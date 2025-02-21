'use client';
import { useState, useEffect } from 'react';
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
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newUserId, setNewUserId] = useState('');

  useEffect(() => {
    // Cleanup reCAPTCHA when component unmounts
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          toast.error('reCAPTCHA expired. Please try again.');
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        }
      });
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      setupRecaptcha();
      const formattedPhone = '+91' + phone;
      
      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      const confirmation = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        window.recaptchaVerifier
      );
      
      window.confirmationResult = confirmation;
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP');
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
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
        const idToken = await result.user.getIdToken();
        document.cookie = `session=${idToken}; path=/; max-age=${60 * 60 * 24 * 5}`;

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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Header */}
          <div className="bg-gray-50 px-6 py-8 text-center">
            <div className="bg-black/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {!otpSent ? 'Welcome Back!' : 'Verify OTP'}
            </h2>
            <p className="text-gray-500 text-sm">
              {!otpSent 
                ? 'Login with your phone number to continue' 
                : 'Enter the code we sent you'}
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6">
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
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
                  disabled={loading || phone.length !== 10}
                  className="w-full bg-black text-white py-3.5 rounded-xl font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Continue'
                  )}
                </button>
                <div id="recaptcha-container"></div>
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
                    setOtpSent(false);
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