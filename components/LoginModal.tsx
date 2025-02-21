'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, X } from 'lucide-react';
import { auth, db } from '@/utils/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocs, query, where, deleteDoc, collection } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import OnboardingModal from './OnboardingModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const cooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newUserId, setNewUserId] = useState('');

  // Create a stable reference for the recaptcha container
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  // Cleanup function
  const cleanupRecaptcha = useCallback(async () => {
    try {
      if (verifierRef.current) {
        await verifierRef.current.clear();
        verifierRef.current = null;
      }
      if (window.recaptchaVerifier) {
        await window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      if (recaptchaContainerRef.current) {
        recaptchaContainerRef.current.innerHTML = '';
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecaptcha();
    };
  }, [cleanupRecaptcha]);

  // Reset on modal close
  useEffect(() => {
    if (!isOpen) {
      setPhone('');
      setOtp('');
      setStep('phone');
      setLoading(false);
      setRetryCount(0);
      setIsInCooldown(false);
      setCooldownTime(0);
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
      cleanupRecaptcha();
    }
  }, [isOpen, cleanupRecaptcha]);

  const setupRecaptcha = async () => {
    try {
      await cleanupRecaptcha();

      if (!recaptchaContainerRef.current) {
        throw new Error('Recaptcha container not found');
      }

      const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          toast.error('reCAPTCHA expired. Please try again.');
          cleanupRecaptcha();
        }
      });

      verifierRef.current = verifier;
      await verifier.render();
      return verifier;
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      throw error;
    }
  };

  const startCooldown = (attempts: number) => {
    // Exponential backoff: 30s -> 1m -> 2m -> 5m -> 10m
    const cooldownDurations = [30, 60, 120, 300, 600];
    const cooldownSeconds = cooldownDurations[Math.min(attempts, cooldownDurations.length - 1)];
    
    setIsInCooldown(true);
    setCooldownTime(cooldownSeconds);

    const timer = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsInCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-reset retry count after longest cooldown
    cooldownTimeoutRef.current = setTimeout(() => {
      setRetryCount(0);
    }, cooldownDurations[cooldownDurations.length - 1] * 1000);

    return () => {
      clearInterval(timer);
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
    };
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInCooldown || loading) return;
    setLoading(true);

    try {
      const verifier = await setupRecaptcha();
      const formattedPhone = `+91${phone}`;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      window.confirmationResult = confirmationResult;
      
      setStep('otp');
      toast.success('OTP sent successfully!');
      setRetryCount(0);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      if (error.code === 'auth/too-many-requests') {
        setRetryCount(prev => prev + 1);
        startCooldown(retryCount + 1);
        toast.error('Too many attempts. Please wait before trying again.');
      } else if (error.code === 'auth/invalid-phone-number') {
        toast.error('Please enter a valid phone number');
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
      await cleanupRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!window.confirmationResult) {
        throw new Error('Please request OTP first');
      }

      const result = await window.confirmationResult.confirm(otp);
      if (result.user) {
        // Get the token
        const idToken = await result.user.getIdToken();
        
        // Create session server-side
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          throw new Error('Failed to create session');
        }

        const userDocRef = doc(db, 'users', result.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await setDoc(userDocRef, {
            lastLoginAt: new Date().toISOString(),
            phone: result.user.phoneNumber,
          }, { merge: true });

          toast.success('Welcome back!');
          onLoginSuccess();
          onClose();
        } else {
          await setDoc(userDocRef, {
            phone: result.user.phoneNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingComplete: false
          });

          setNewUserId(result.user.uid);
          setShowOnboarding(true);
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl overflow-hidden z-50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Section */}
        <div className="bg-gray-50 px-6 py-8 text-center">
          <div className="bg-black/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {step === 'otp' ? 'Verify OTP' : 'Welcome Back!'}
          </h2>
          <p className="text-gray-500 text-sm">
            {step === 'otp' 
              ? 'Enter the code we sent you'
              : 'Login with your phone number to continue'}
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                  +91
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter phone number"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  required
                  pattern="[0-9]{10}"
                />
              </div>
              <button
                type="submit"
                disabled={loading || phone.length !== 10 || isInCooldown}
                className="w-full bg-black text-white p-4 rounded-xl flex items-center 
                          justify-center gap-2 disabled:opacity-50 text-lg font-medium
                          hover:opacity-90 active:scale-[0.99] transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : isInCooldown ? (
                  `Try again in ${cooldownTime}s`
                ) : (
                  'Continue'
                )}
              </button>
              <div 
                ref={recaptchaContainerRef} 
                className="!invisible"
                style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}
              />
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-center text-lg tracking-[0.5em]
                    focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  required
                  pattern="[0-9]{6}"
                />
                <p className="text-xs text-gray-500 text-center">
                  OTP sent to +91 {phone}
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-black text-white py-3.5 rounded-xl font-medium
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify & Continue'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                }}
                className="w-full py-3 text-gray-600 text-sm hover:text-black transition-colors"
              >
                ← Change Phone Number
              </button>
            </form>
          )}
        </div>
      </div>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        userId={newUserId}
        onComplete={() => {
          setShowOnboarding(false);
          onLoginSuccess();
          onClose();
        }}
      />
    </>
  );
}