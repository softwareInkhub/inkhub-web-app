'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  {
    id: 1,
    imageUrl: '/banners/banner1.jpg',
    title: 'Summer Collection',
    link: '/collections/summer',
  },
  {
    id: 2,
    imageUrl: '/banners/banner2.jpg',
    title: 'New Arrivals',
    link: '/new-arrivals',
  },
  {
    id: 3,
    imageUrl: '/banners/banner3.jpg',
    title: 'Special Offers',
    link: '/sale',
  },
  {
    id: 4,
    imageUrl: '/banners/banner4.jpg',
    title: 'Limited Edition',
    link: '/collections/limited',
  },
];

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered) {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isHovered]);

  const handlePrevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div 
      className="relative h-[220px] rounded-xl overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-full"
        >
          <Link href={banners[currentIndex].link}>
            <div className="relative w-full h-full">
              <Image
                src={banners[currentIndex].imageUrl}
                alt={banners[currentIndex].title}
                fill
                className="object-cover"
                priority
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-8">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold text-white mb-4"
                  >
                    {banners[currentIndex].title}
                  </motion.h2>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handlePrevSlide}
          className="p-2 text-white/75 hover:text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={handleNextSlide}
          className="p-2 text-white/75 hover:text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Interactive Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="group p-2"
            aria-label={`Go to slide ${index + 1}`}
          >
            <motion.div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 group-hover:bg-white/80'
              }`}
              layoutId="activeDot"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </button>
        ))}
      </div>
    </div>
  );
} 