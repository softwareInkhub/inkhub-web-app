'use client';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  title: string;
  handle: string;
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

interface Collection {
  title: string;
  products?: Product[];
}

interface CollectionPageModalProps {
  collection: Collection | null;
  isLoading: boolean;
  clickedPosition: { x: number; y: number };
  onClose: () => void;
}

export default function CollectionPageModal({ 
  collection, 
  isLoading, 
  clickedPosition, 
  onClose 
}: CollectionPageModalProps) {
  if (!collection) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 overflow-y-auto backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ 
          opacity: 0,
          scale: 0.5,
          x: clickedPosition.x - window.innerWidth / 2,
          y: clickedPosition.y - window.innerHeight / 2
        }}
        animate={{ 
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0
        }}
        exit={{ 
          opacity: 0,
          scale: 0.5,
          x: clickedPosition.x - window.innerWidth / 2,
          y: clickedPosition.y - window.innerHeight / 2
        }}
        transition={{ 
          type: "spring",
          damping: 25,
          stiffness: 300
        }}
        className="min-h-screen py-12 px-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white max-w-6xl mx-auto rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium">{collection.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="animate-pulse"
                >
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </motion.div>
              ))
            ) : (
              collection.products?.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 