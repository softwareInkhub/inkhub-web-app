'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/utils/price';

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

interface ProductCardProps {
  product: Product;
  isFirst?: boolean;
}

export default function ProductCard({ product, isFirst }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Smoother transition without delay
    router.push(`/products/${product.handle}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product.id);
      toast.success('Added to wishlist');
    }
  };

  const isWishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative cursor-pointer"
      onClick={handleProductClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="group relative">
        <div className="relative rounded-xl overflow-hidden bg-gray-50">
          <Image
            src={product.image.url}
            alt={product.image.altText}
            width={500}
            height={500}
            className="w-full h-auto object-contain transition-transform duration-200 
              group-hover:scale-105"
            priority
          />

          {/* Action Buttons Container */}
          <div className="absolute inset-0 flex flex-col justify-between p-3">
            {/* Top Row - Wishlist */}
            <div className="flex justify-end">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleWishlist(e);
                }}
                className="p-2 rounded-full bg-white shadow-sm hover:scale-105 transition-transform"
                whileTap={{ scale: 0.95 }}
              >
                <Heart 
                  className={`w-4 h-4 ${
                    isWishlisted 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600'
                  }`}
                />
              </motion.button>
            </div>

            {/* Bottom Row - Product Info and Quick Add */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 bg-white/90 py-1 px-1.5 rounded-md">
                <h3 className="text-xs font-medium text-gray-800 line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {formatPrice(Number(product.price.amount), 'INR')}
                </p>
              </div>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(e);
                }}
                disabled={isLoading}
                className="p-2 rounded-full bg-black text-white hover:scale-105 transition-transform
                         disabled:bg-black/50 disabled:hover:scale-100 shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 