'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OtpInput from 'react-otp-input';

export default function VerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [contactInfo, setContactInfo] = useState('');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  useEffect(() => {
    const storedMethod = sessionStorage.getItem('authMethod') as 'phone' | 'email';
    const storedContact = sessionStorage.getItem('contactInfo');

    if (!storedContact) {
      router.replace('/'); // Redirect to home instead of account
      return;
    }

    setAuthMethod(storedMethod);
    setContactInfo(storedContact);

    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Add your OTP verification logic here
      // const response = await verifyOTP(contactInfo, otp);
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear session storage
      sessionStorage.removeItem('authMethod');
      sessionStorage.removeItem('contactInfo');
      
      // Store auth token
      localStorage.setItem('authToken', 'mock-token');
      
      // Redirect to account dashboard
      router.push('/account/dashboard');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setTimer(30);
    // Add your resend OTP logic here
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold mb-2 text-center">Verify Your Account</h1>
        <p className="text-center text-gray-600 mb-8">
          Enter the code we sent to{' '}
          <span className="font-medium text-black">
            {authMethod === 'phone' 
              ? contactInfo.replace(/(\d{2})(\d{5})(\d{5})/, '$1*****$3')
              : contactInfo.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
          </span>
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              renderInput={(props) => (
                <input
                  {...props}
                  className="w-12 h-12 mx-1 text-center border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                />
              )}
              shouldAutoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
          &quot;Didn&#39;t receive the code?&#39; &quot;
            {timer > 0 ? (
              <span className="text-gray-400">Resend in {timer}s</span>
            ) : (
              <button
                onClick={handleResendOTP}
                className="text-black hover:underline"
              >
                Resend Code
              </button>
            )}
          </p>
        </div>

        <button
          onClick={() => router.push('/account')}
          className="mt-8 w-full text-center text-sm text-gray-600 hover:text-black"
        >
          ← Use different {authMethod === 'phone' ? 'phone number' : 'email'}
        </button>
      </div>
    </div>
  );
} 