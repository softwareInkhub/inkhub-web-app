'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { ShoppingBag } from 'lucide-react';

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;


    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#000000', '#FF0000', '#FFA500']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#000000', '#FF0000', '#FFA500']
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Thank You for Your Order!</h1>
        <p className="text-gray-600 mb-4">
          Your order has been successfully placed and will be processed soon.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">Order ID</p>
          <p className="font-mono font-medium">{orderId}</p>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full bg-black text-white py-3 rounded-full font-medium flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          Continue Shopping
        </button>
      </div>
    </div>
  );
} 