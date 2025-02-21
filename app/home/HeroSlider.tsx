'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import { motion } from 'framer-motion';
import { useSlide } from '@/context/SlideContext';
import type { Swiper as SwiperType } from 'swiper';

export default function HeroSlider() {
  const { setCurrentSlide } = useSlide();

  const slides = [
    {
      id: 'new-year',
      title: "New Year Special",
      subtitle: "Exclusive Collection 2024",
      bgColor: "from-black via-purple-900 to-black",
      buttonText: "Shop Now",
      buttonLink: "/collections/new-year"
    },
    {
      id: 'summer',
      title: "Summer Collection",
      subtitle: "Fresh Arrivals for Summer 2024",
      bgColor: "from-blue-900 via-blue-600 to-blue-900",
      buttonText: "Explore Now",
      buttonLink: "/collections/summer"
    },
    {
      id: 'sale',
      title: "Flash Sale",
      subtitle: "Up to 50% Off on Selected Items",
      bgColor: "from-red-900 via-red-600 to-red-900",
      buttonText: "View Deals",
      buttonLink: "/sale"
    },
    {
      id: 'premium',
      title: "Premium Collection",
      subtitle: "Luxury Items Just for You",
      bgColor: "from-gray-900 via-gray-600 to-gray-900",
      buttonText: "Discover More",
      buttonLink: "/collections/premium"
    }
  ];

  const handleSlideChange = (swiper: SwiperType) => {
    const currentSlideId = slides[swiper.realIndex].id;
    setCurrentSlide(currentSlideId);
  };

  return (
    <div className="w-full relative group">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation]}
        effect="fade"
        autoplay={{ 
          delay: 5000,
          disableOnInteraction: false
        }}
        loop={true}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        onSlideChange={handleSlideChange}
        className="w-full h-[500px]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className={`w-full h-full bg-gradient-to-r ${slide.bgColor}`}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="container mx-auto px-4 h-full flex items-center"
              >
                <div className="text-white space-y-6 max-w-xl">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold leading-tight"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl opacity-90"
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="px-8 py-3 bg-white text-black rounded-full 
                      hover:bg-opacity-90 transition-all duration-300"
                  >
                    {slide.buttonText}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Minimal Navigation Buttons */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
        <button className="swiper-button-prev w-12 h-12 flex items-center justify-start pointer-events-auto text-white/50 hover:text-white transition-colors">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button className="swiper-button-next w-12 h-12 flex items-center justify-end pointer-events-auto text-white/50 hover:text-white transition-colors">
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className="w-1.5 h-1.5 rounded-full bg-white/30 transition-all duration-300"
          />
        ))}
      </div>
    </div>
  );
} 