'use client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  link?: string;
}

interface BannerScrollProps {
  banners: Banner[];
  autoScrollInterval?: number; // in milliseconds
}

export default function BannerScroll({ 
  banners, 
  autoScrollInterval = 3000 // default 3 seconds
}: BannerScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const bannerWidth = container.clientWidth * 0.65 + 24; // 65% width + gap
    const newScrollPosition = index * bannerWidth;

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });

    setCurrentIndex(index);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    let nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;

    // Handle wrap-around
    if (nextIndex >= banners.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = banners.length - 1;
    }

    scrollToIndex(nextIndex);
  };

  // Auto scroll effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      scroll('right');
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [isPaused, autoScrollInterval, currentIndex]);

  // Scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Scroll Buttons */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-black/10 hover:bg-black/20 p-2 rounded-full transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-black/10 hover:bg-black/20 p-2 rounded-full transition-all"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Scrollable Container */}
        <motion.div 
          ref={scrollContainerRef}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex overflow-x-auto overflow-y-hidden gap-6 scrollbar-hide snap-x snap-mandatory"
          style={{
            maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
          }}
        >
          {banners.map((banner) => (
            <motion.div
              key={banner.id}
              variants={item}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 w-[65%] relative cursor-pointer snap-center"
            >
              <div className="relative aspect-[21/9] overflow-hidden rounded-lg">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 65vw"
                  priority={false}
                />
                {/* Optional overlay text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <h3 className="text-white text-lg font-medium p-4">
                    {banner.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Optional: Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-black' : 'bg-gray-300'
              }`}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 