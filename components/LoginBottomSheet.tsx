'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import OtpInput from 'react-otp-input';

interface LoginBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginBottomSheet({ isOpen, onClose, onLoginSuccess }: LoginBottomSheetProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const { signInWithPhone, verifyOtp } = useAuth();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithPhone(phone);
      setStep('otp');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(otp);
      onLoginSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
                    disabled={loading || phone.length !== 10}
                    className="w-full bg-black text-white p-4 rounded-xl flex items-center 
                             justify-center gap-2 disabled:opacity-50 text-lg font-medium
                             hover:opacity-90 active:scale-[0.99] transition-all"
                  >
                    {loading ? 'Sending OTP...' : 'Continue'}
                    <ArrowRight className="w-5 h-5" />
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
                      Enter the OTP sent to +91 {phone}
                    </label>
                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      numInputs={6}
                      renderInput={(props) => (
                        <input
                          {...props}
                          className="w-14 h-14 mx-1 text-center text-lg border rounded-xl 
                                   bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                      )}
                      shouldAutoFocus
                    />
                  </div>

                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-black text-white p-4 rounded-xl flex items-center 
                               justify-center gap-2 disabled:opacity-50 text-lg font-medium
                               hover:opacity-90 active:scale-[0.99] transition-all"
                    >
                      {loading ? 'Verifying...' : 'Verify & Continue'}
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="w-full text-center text-base text-gray-500 hover:text-black transition-colors"
                    >
                      ← Change phone number
                    </button>
                  </div>
                </motion.form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 