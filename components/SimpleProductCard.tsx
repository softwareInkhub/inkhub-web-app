'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/utils/price';
import ProductDetailsSkeleton from '@/components/ProductDetailsSkeleton';

interface Product {
  id: string;
  handle: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  image: {
    url: string;
    altText: string;
  };
  variantId: string;
}

interface SimpleProductCardProps {
  product: Product;
  className?: string;
}

export default function SimpleProductCard({ product, className = '' }: SimpleProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleProductClick = async () => {
    setIsNavigating(true);
    router.prefetch(`/products/${product.handle}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    router.push(`/products/${product.handle}`);
  };
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await addToCart({
        id: product.id,
        handle: product.handle,
        variantId: product.variantId,
        quantity: 1,
        title: product.title,
        price: product.price,
        image: product.image,
        selectedOptions: []
      });
      toast.success('Added to cart');
      await new Promise(resolve => setTimeout(resolve, 600));
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlistAnimating(true);
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }

    // Reset animation after a delay
    setTimeout(() => setIsWishlistAnimating(false), 500);
  };

  return (
    <AnimatePresence mode="wait">
      {isNavigating ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-white z-50"
        >
          <ProductDetailsSkeleton productId={product.id} />
        </motion.div>
      ) : (
        <motion.div
          layoutId={`product-card-${product.id}`}
          onClick={handleProductClick}
          className={`relative cursor-pointer bg-white rounded-lg overflow-hidden ${className}`}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {/* Image Section */}
          <motion.div 
            className="relative w-full bg-gray-50"
            layoutId={`product-image-${product.id}`}
          >
            <Image
              src={product.image.url}
              alt={product.image.altText}
              width={200}
              height={200}
              className="w-full h-auto object-contain"
              priority
            />
            
            {/* Wishlist Button */}
            <motion.button
              onClick={handleWishlist}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 
                         shadow-sm hover:bg-white transition-colors"
              whileTap={{ scale: 0.8 }}
              animate={isWishlistAnimating ? {
                scale: [1, 1.3, 0.9, 1.1, 1],
                rotate: [0, 20, -20, 10, 0],
              } : {}}
              transition={{ 
                duration: 0.5,
                type: "spring",
                stiffness: 400,
                damping: 10
              }}
            >
              <motion.div
                animate={isWishlistAnimating && isInWishlist(product.id) ? {
                  scale: [1, 1.2, 1],
                } : {}}
              >
                <Heart 
                  className={`w-[0.8em] h-[0.8em] transition-colors duration-300
                    ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* Info Section */}
          <motion.div 
            className="flex items-center justify-between py-1.5 px-2 bg-gray-50"
            layoutId={`product-info-${product.id}`}
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-[0.65em] font-medium text-gray-800 truncate leading-tight">
                {product.title}
              </h3>
              <p className="text-[0.6em] text-gray-600 mt-0.5">
                {formatPrice(Number(product.price.amount), 'INR')}
              </p>
            </div>
            
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(e);
              }}
              disabled={isLoading}
              className="relative ml-2 p-1 rounded-full bg-black text-white hover:bg-black/90
                       disabled:bg-black/50 disabled:cursor-not-allowed overflow-hidden"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence initial={false} mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      rotate: 360 
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ 
                      duration: 0.2,
                      rotate: { 
                        repeat: Infinity, 
                        duration: 0.8, 
                        ease: "linear" 
                      }
                    }}
                    className="flex items-center justify-center"
                  >
                    <Loader2 className="w-[0.8em] h-[0.8em] text-white animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <ShoppingCart className="w-[0.8em] h-[0.8em]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 