'use client';
import { motion } from 'framer-motion';
import PageTransition from './PageTransition';

interface ProductDetailSkeletonProps {
  productId?: string; // Add this to match layoutIds with actual content
}

export default function ProductDetailsSkeleton({ productId = 'loading' }: ProductDetailSkeletonProps) {
  return (
    <PageTransition>
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery Skeleton */}
          <motion.div 
            className="flex gap-4"
            layoutId={`product-gallery-${productId}`}
          >
            {/* Thumbnails */}
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="w-16 aspect-square bg-gray-200 rounded-lg animate-pulse"
                  layoutId={`product-thumbnail-${productId}-${i}`}
                />
              ))}
            </div>

            {/* Main Image */}
            <motion.div 
              className="flex-1 aspect-square bg-gray-200 rounded-2xl animate-pulse"
              layoutId={`product-image-${productId}`}
            />
          </motion.div>

          {/* Product Info */}
          <motion.div 
            className="mt-8 lg:mt-0 space-y-6"
            layoutId={`product-info-${productId}`}
          >
            {/* Title and Price */}
            <motion.div 
              className="space-y-4"
              layoutId={`product-header-${productId}`}
            >
              <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
              <div className="h-6 bg-gray-200 rounded-lg w-1/4" />
            </motion.div>

            {/* Rest of the skeleton with layoutIds */}
            <motion.div 
              className="space-y-3"
              layoutId={`product-features-${productId}`}
            >
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full" />
              ))}
            </motion.div>

            <motion.div 
              className="h-14 bg-gray-200 rounded-full"
              layoutId={`product-quantity-${productId}`}
            />

            <motion.div 
              className="flex gap-3"
              layoutId={`product-actions-${productId}`}
            >
              <div className="flex-1 h-14 bg-gray-200 rounded-full" />
              <div className="w-14 h-14 bg-gray-200 rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </PageTransition>
  );
} 