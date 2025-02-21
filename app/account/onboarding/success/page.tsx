'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import confetti from 'canvas-confetti';

const OnboardingSuccess = () => {
  const router = useRouter();
  const { userProfile } = useAuth();

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Redirect to home after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {userProfile?.firstName}! 🎉
        </h1>
        <p className="text-gray-600 mb-8">
        Your profile is all set. Let&apos;s start shopping!
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-black text-white px-8 py-3 rounded-lg hover:bg-black/90 transition-colors"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default OnboardingSuccess; 