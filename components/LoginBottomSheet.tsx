'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import OtpInput from 'react-otp-input';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, db } from '@/utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface LoginBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

declare global {
  interface Window {
    OTPCredential: any;
  }
  interface CredentialRequestOptions {
    otp?: { transport: string[] };
  }
}

export default function LoginBottomSheet({ isOpen, onClose, onLoginSuccess }: LoginBottomSheetProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);
  const [autofilledOtp, setAutofilledOtp] = useState<string | null>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
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
    }
  }, [isOpen]);

  const setupRecaptcha = async () => {
    try {
      // Clear existing verifier
      if (window.recaptchaVerifier) {
        await window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          toast.error('reCAPTCHA expired. Please try again.');
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
          }
        }
      });

      await verifier.render();
      window.recaptchaVerifier = verifier;
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
    if (isInCooldown) return;
    setLoading(true);

    try {
      const verifier = await setupRecaptcha();
      const formattedPhone = `+91${phone}`;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      window.confirmationResult = confirmationResult;
      
      setStep('otp');
      toast.success('OTP sent successfully!');
      
      // Reset retry count on success
      setRetryCount(0);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      if (error.code === 'auth/too-many-requests') {
        setRetryCount(prev => prev + 1);
        startCooldown(retryCount);
        toast.error('Too many attempts. Please try again later.');
      } else if (error.code === 'auth/invalid-phone-number') {
        toast.error('Please enter a valid phone number');
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (number: string) => {
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  };

  useEffect(() => {
    if (otp.length === 6 && !loading) {
      setIsAutoVerifying(true);
      handleVerifyOtp();
    }
  }, [otp]);

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        throw new Error('Please request OTP first');
      }

      const result = await confirmationResult.confirm(otp);
      if (result.user) {
        // Get user token
        const idToken = await result.user.getIdToken();
        
        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', result.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Update existing user
          await setDoc(userDocRef, {
            lastLoginAt: new Date().toISOString(),
            phone: result.user.phoneNumber,
          }, { merge: true });
        } else {
          // Create new user
          await setDoc(userDocRef, {
            phone: result.user.phoneNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingComplete: false
          });
        }

        toast.success('Successfully logged in!');
        onLoginSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Invalid OTP');
      setOtp(''); // Clear OTP on error
    } finally {
      setLoading(false);
      setIsAutoVerifying(false);
    }
  };

  useEffect(() => {
    if (!('OTPCredential' in window) || step !== 'otp') return;

    const ac = new AbortController();
    
    navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: ac.signal
    } as CredentialRequestOptions).then((otp: any) => {
      if (otp?.code && !ac.signal.aborted) {
        setOtp(otp.code);
        setAutofilledOtp(otp.code);
      }
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        console.error('OTP Error:', err);
      }
    });

    return () => {
      try {
        ac.abort();
      } catch (err) {
        // Ignore abort errors
      }
    };
  }, [step]);

  const copyOtpFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const otpMatch = text.match(/\b(\d{6})\b/);
      if (otpMatch) {
        setOtp(otpMatch[0]);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with faster fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-[2px]"
          />

          {/* Larger Bottom Sheet with snappier animation */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 overflow-hidden
                     max-h-[85vh] pb-safe"
          >
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />

            <div className="px-6 pt-2 pb-8 space-y-8 max-h-[calc(85vh-40px)] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-semibold"
                >
                  {step === 'phone' ? 'Login to continue' : 'Verify OTP'}
                </motion.h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Phone Input with improved spacing */}
              {step === 'phone' && (
                <motion.form 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSendOtp}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <label className="block text-base text-gray-600">
                      Enter your phone number
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg z-10 pointer-events-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-14 pr-4 py-4 bg-gray-50 rounded-xl text-lg
                                focus:outline-none focus:ring-2 focus:ring-black/5 relative"
                        placeholder="Enter phone number"
                        maxLength={10}
                        required
                      />
                    </div>
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
                </motion.form>
              )}

              {/* OTP Input with improved spacing */}
              {step === 'otp' && (
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <label className="block text-base text-gray-600">
                      Enter the OTP sent to {formatPhoneNumber(phone)}
                    </label>
                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      numInputs={6}
                      renderInput={(props) => (
                        <input
                          {...props}
                          className="!w-12 h-14 mx-1 text-center border rounded-xl text-lg
                                   focus:border-black focus:ring-1 focus:ring-black 
                                   transition-colors [webkit-text-security:disc]"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          pattern="\d*"
                          disabled={loading || isAutoVerifying}
                        />
                      )}
                      shouldAutoFocus
                      containerStyle="flex justify-center gap-2"
                    />
                    {autofilledOtp && (
                      <p className="text-sm text-center text-gray-500">
                        OTP auto-filled: {autofilledOtp}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={loading || isAutoVerifying || otp.length !== 6}
                      className="w-full bg-black text-white p-4 rounded-xl flex items-center 
                               justify-center gap-2 disabled:opacity-50 text-lg font-medium
                               hover:opacity-90 active:scale-[0.99] transition-all"
                    >
                      {loading || isAutoVerifying ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Continue
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setOtp('');
                      }}
                      className="w-full text-center text-base text-gray-500 hover:text-black transition-colors"
                    >
                      ← Change phone number
                    </button>

                    <button
                      type="button"
                      onClick={copyOtpFromClipboard}
                      className="mt-2 text-sm text-gray-500 hover:text-black"
                    >
                      Paste from clipboard
                    </button>
                  </div>
                </motion.form>
              )}
            </div>
          </motion.div>
          <div id="recaptcha-container"></div>
        </>
      )}
    </AnimatePresence>
  );
} 