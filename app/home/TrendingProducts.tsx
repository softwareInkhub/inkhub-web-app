'use client';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
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

        <div className="flex overflow-x-auto gap-4 md:gap-6 scrollbar-hide pb-4">
          {products.map((product) => (
            <div 
              key={product.node.id} 
              className="flex-shrink-0 w-[calc(100vw/3.5)] md:w-[calc(100vw/6)]"
            >
              <ProductCard 
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
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 