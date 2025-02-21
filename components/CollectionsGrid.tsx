'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ProductCard from './ProductCard';
import SimpleProductCard from './SimpleProductCard';

interface Collection {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText?: string;
  } | null;
  products?: Array<{
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
  }>;
}

interface CollectionsGridProps {
  collections: Collection[];
  className?: string;
  gridCols?: string;
  title?: string;
}

export default function CollectionsGrid({ collections, className = '', gridCols = 'grid-cols-2', title = 'Collections' }: CollectionsGridProps) {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clickedPosition, setClickedPosition] = useState({ x: 0, y: 0 });

  const handleCollectionClick = async (collection: Collection, e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setClickedPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    
    setIsLoading(true);
    setSelectedCollection(collection);

    try {
      const cleanId = collection.id.replace('gid://shopify/Collection/', '');
      const response = await fetch(`/api/products?collection=${cleanId}`);
      const data = await response.json();

      if (response.ok && data.collection) {
        setSelectedCollection({
          ...collection,
          products: data.collection.products.edges.map(({ node }: any) => ({
            id: node.id,
            title: node.title,
            handle: node.handle,
            price: {
              amount: node.priceRange.minVariantPrice.amount,
              currencyCode: node.priceRange.minVariantPrice.currencyCode
            },
            image: {
              url: node.images.edges[0]?.node.url || '',
              altText: node.images.edges[0]?.node.altText || node.title
            },
            variantId: node.variants.edges[0]?.node.id
          }))
        } as Collection);
      }
    } catch (error) {
      console.error('Error loading collection products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      {/* Title */}
      <h2 className="text-lg font-medium mb-4">{title}</h2>
      
      {/* Grid */}
      <div className={`grid ${gridCols} gap-4`}>
        {collections.map((collection) => (
          <motion.div
            key={collection.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={(e) => handleCollectionClick(collection, e)}
            className="cursor-pointer"
          >
            <div className="group">
              {/* Image Container */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {collection.image?.url && (
                  <img
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              
              {/* Collection Title */}
              <h3 className="mt-2 text-sm font-medium text-gray-900 text-center group-hover:underline">
                {collection.title}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedCollection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 overflow-y-auto backdrop-blur-sm"
            onClick={() => setSelectedCollection(null)}
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
                  <h2 className="text-2xl font-medium">{selectedCollection.title}</h2>
                  <button
                    onClick={() => setSelectedCollection(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {isLoading ? (
                    [...Array(8)].map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="animate-pulse"
                      >
                        <div className="bg-gray-200 rounded-lg">
                          <div className="aspect-square rounded-t-lg bg-gray-300" />
                          <div className="p-2 bg-gray-100">
                            <div className="h-3 bg-gray-300 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-300 rounded w-1/2" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    selectedCollection.products?.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <SimpleProductCard product={product} className="w-full" />
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 