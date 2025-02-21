'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { X } from 'lucide-react';
import ProductCard from './ProductCard';

interface Collection {
  id: string;
  title: string;
  handle: string;
  image: {
    url: string;
    altText: string | null;
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

interface CollectionCirclesProps {
  collections: Collection[];
}

export default function CollectionCircles({ collections }: CollectionCirclesProps) {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clickedPosition, setClickedPosition] = useState({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleCollectionClick = async (collection: Collection, index: number, e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setClickedPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    
    setActiveIndex(index);
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
        });
      }
    } catch (error) {
      console.error('Error loading collection products:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setActiveIndex(null), 300);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex overflow-x-auto hide-scrollbar gap-4 py-2">
        {collections.map((collection, index) => (
          <motion.div
            key={collection.id}
            className="flex flex-col items-center gap-2 cursor-pointer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleCollectionClick(collection, index, e)}
          >
            <motion.div 
              className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-50 
                ring-1 ring-black/[0.08] hover:ring-2 hover:ring-black/20 transition-all"
              animate={activeIndex === index ? {
                scale: [1, 0.9, 1],
                transition: { duration: 0.3 }
              } : {}}
            >
              {collection.image?.url && (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
            </motion.div>

            <motion.span 
              className="text-sm text-gray-600 text-center line-clamp-1 max-w-[80px]"
              animate={activeIndex === index ? {
                scale: [1, 0.95, 1],
                transition: { duration: 0.3 }
              } : {}}
            >
              {collection.title}
            </motion.span>
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
                    selectedCollection.products?.map((product, index) => (
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
        )}
      </AnimatePresence>
    </div>
  );
}