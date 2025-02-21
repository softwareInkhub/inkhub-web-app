'use client';
import { useState, useEffect } from 'react';

interface FlashSaleBannerProps {
  endTime: Date;
  message: string;
}

export default function FlashSaleBanner({ endTime, message }: FlashSaleBannerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const distance = endTime.getTime() - now.getTime();
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft('Sale ended');
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="bg-red-500 text-white p-4 rounded-lg shadow-md text-center">
      <h2 className="text-lg font-bold">{message}</h2>
      <p className="text-sm">Ends in: {timeLeft}</p>
    </div>
  );
} 