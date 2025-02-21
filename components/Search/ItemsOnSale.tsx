import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  handle: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  image?: {
    url: string;
    altText?: string;
  };
}

interface ItemsOnSaleProps {
  products: Product[];
}

export default function ItemsOnSale({ products }: ItemsOnSaleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const controls = useAnimation();

  const checkScrollButtons = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      
      // Update scroll buttons after animation
      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <div className="py-4 px-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium">Items on Sale</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className={`p-1.5 rounded-full transition-colors ${
              canScrollLeft 
                ? 'hover:bg-gray-100 text-gray-900' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className={`p-1.5 rounded-full transition-colors ${
              canScrollRight 
                ? 'hover:bg-gray-100 text-gray-900' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            disabled={!canScrollRight}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="overflow-x-auto scrollbar-hide"
        onScroll={checkScrollButtons}
      >
        <div className="flex gap-3 min-w-max">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              className="flex-shrink-0 w-32 group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
                {product.image?.url ? (
                  <Image
                    src={product.image.url}
                    alt={product.image.altText || product.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="128px"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}
                
                {product.compareAtPrice && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Sale
                  </div>
                )}
              </div>
              
              <h4 className="text-sm font-medium line-clamp-1">{product.title}</h4>
              <div className="flex items-center gap-1.5">
                <p className="text-sm text-red-500 font-medium">
                  ₹{parseFloat(product.price).toFixed(2)}
                </p>
                {product.compareAtPrice && (
                  <p className="text-xs text-gray-400 line-through">
                    ₹{parseFloat(product.compareAtPrice).toFixed(2)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 