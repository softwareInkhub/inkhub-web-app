'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function PromotionalBanner() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 10,
    minutes: 47,
    seconds: 55
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newSeconds = prev.seconds - 1;
        if (newSeconds >= 0) return { ...prev, seconds: newSeconds };
        
        const newMinutes = prev.minutes - 1;
        if (newMinutes >= 0) return { ...prev, minutes: newMinutes, seconds: 59 };
        
        const newHours = prev.hours - 1;
        if (newHours >= 0) return { ...prev, hours: newHours, minutes: 59, seconds: 59 };
        
        const newDays = prev.days - 1;
        if (newDays >= 0) return { ...prev, days: newDays, hours: 23, minutes: 59, seconds: 59 };
        
        clearInterval(timer);
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-lg shadow-lg overflow-hidden"
    >
      <div className="relative aspect-[4/3] md:aspect-[16/9] lg:aspect-[2/1] max-h-[400px]">
        <Image
          src="/promo-banner.jpg"
          alt="Promotional banner"
          fill
          className="object-cover object-center"
          priority
        />
        
        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-8 
          bg-gradient-to-r from-black/70 via-black/50 to-transparent">
          <div className="max-w-xl space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                EXTRA 10% OFF
              </h2>
              <p className="text-lg md:text-xl text-white">
                ON ALL ORDERS OVER ₹799
              </p>
              <p className="text-sm text-white">
                Apply code: <span className="font-semibold">EXTRA10</span> at checkout
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 md:gap-4">
                {Object.entries(timeLeft).map(([key, value]) => (
                  <div key={key} className="flex flex-col items-center">
                    <div className="bg-black/80 text-white px-3 py-1.5 md:px-4 md:py-2 rounded 
                      min-w-[45px] md:min-w-[55px] text-center text-base md:text-lg font-medium">
                      {String(value).padStart(2, '0')}
                    </div>
                    <span className="text-xs md:text-sm text-white mt-1 capitalize">
                      {key}
                    </span>
                  </div>
                ))}
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-black px-6 py-2 md:px-8 md:py-3 rounded-full 
                  text-base md:text-lg font-medium hover:bg-white/90 transition-colors"
              >
                Shop Now & Save Big
              </motion.button>

              <p className="text-sm md:text-base text-white/90">
                Hurry, offer ending soon !!
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 