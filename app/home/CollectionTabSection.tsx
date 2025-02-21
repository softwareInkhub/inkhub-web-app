'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SimpleProductCard from '@/components/SimpleProductCard';

interface CollectionTabSectionProps {
  collections: any[];
}

export default function CollectionTabSection({ collections }: CollectionTabSectionProps) {
  const [selectedCollection, setSelectedCollection] = useState<any>({ ...collections[0], products: [] });
  const [isLoading, setIsLoading] = useState(true);

  const handleCollectionClick = async (collection: any) => {
    setIsLoading(true);
    setSelectedCollection({ ...collection, products: [] });

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
    }
  };

  // Fetch initial collection's products
  useEffect(() => {
    if (collections[0]) {
      handleCollectionClick(collections[0]);
    }
  }, [collections]);

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Section Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Shop by Collections</h2>
        <p className="text-gray-600 mt-2">Explore our curated collection categories</p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-gray-100 rounded-full p-2 flex items-center gap-2 mb-8 max-w-5xl mx-auto overflow-x-auto scrollbar-hide">
        {collections.slice(0, 6).map((collection) => (
          <button
            key={collection.id}
            onClick={() => handleCollectionClick(collection)}
            className={`px-6 py-3 rounded-full transition-all flex-shrink-0 ${
              selectedCollection?.id === collection.id 
                ? 'bg-white shadow-md' 
                : 'hover:bg-white/50'
            }`}
          >
            <div className="text-sm font-medium leading-none whitespace-nowrap">
              {collection.title}
            </div>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCollection?.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <div className="flex overflow-x-auto gap-2 sm:gap-3 md:gap-4 scrollbar-hide pb-4">
            {isLoading ? (
              // Loading skeletons
              [...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="animate-pulse flex-shrink-0 w-[120px] sm:w-[160px] md:w-[180px]"
                >
                  <div className="bg-gray-200 rounded-xl">
                    <div className="aspect-square rounded-t-xl bg-gray-300" />
                    <div className="p-2 sm:p-3 bg-gray-100">
                      <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4 mb-2" />
                      <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              selectedCollection?.products?.map((product: any) => (
                <div 
                  key={product.id} 
                  className="flex-shrink-0 w-[120px] sm:w-[160px] md:w-[180px]"
                >
                  <SimpleProductCard 
                    product={product}
                    className="w-full"
                  />
                </div>
              ))
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 