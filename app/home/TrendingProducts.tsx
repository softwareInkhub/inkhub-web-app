'use client';
import { motion } from 'framer-motion';
import SimpleProductCard from '@/components/SimpleProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface TrendingProductsProps {
  products: any[];
}

export default function TrendingProducts({ products }: TrendingProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = direction === 'left' ? -400 : 400;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Trending Products</h2>
          <p className="text-gray-600 mt-2">Discover our most popular designs</p>
        </div>

        {/* Scroll Container with Navigation Arrows */}
        <div className="relative">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                       bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                       bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-2 sm:gap-3 md:gap-4 scrollbar-hide pb-4"
          >
            {products.map((product) => (
              <div 
                key={product.node.id} 
                className="flex-shrink-0 w-[120px] sm:w-[160px] md:w-[180px]"
              >
                <SimpleProductCard 
                  product={{
                    id: product.node.id,
                    handle: product.node.handle,
                    title: product.node.title,
                    price: {
                      amount: product.node.priceRange.minVariantPrice.amount,
                      currencyCode: product.node.priceRange.minVariantPrice.currencyCode
                    },
                    image: {
                      url: product.node.images?.edges[0]?.node?.url || '',
                      altText: product.node.title
                    },
                    variantId: product.node.variants?.edges[0]?.node?.id
                  }}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 