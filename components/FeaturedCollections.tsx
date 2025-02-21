'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';
import SimpleProductCard from './SimpleProductCard';

interface Collection {
  id: string;
  title: string;
  handle: string;
  image: {
    url: string;
    altText: string | null;
  } | null;
  products?: any[];
}

export default function FeaturedCollections({ collections }: { collections: Collection[] }) {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clickedPosition, setClickedPosition] = useState({ x: 0, y: 0 });

  const handleCollectionClick = async (collection: Collection, e: React.MouseEvent) => {
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
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-8">
      <h2 className="text-xl font-medium mb-4">Featured Collections</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {collections.map((collection) => (
          <motion.div
            key={collection.id}
            className="cursor-pointer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => handleCollectionClick(collection, e)}
          >
            <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
              {collection.image && (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <h3 className="mt-2 text-sm">{collection.title}</h3>
          </motion.div>
        ))}
      </div>

      {/* Collection Modal */}
      {selectedCollection && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 p-4 overflow-y-auto"
          onClick={() => setSelectedCollection(null)}
        >
          <motion.div
            className="bg-white rounded-lg max-w-4xl mx-auto mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b">
              <h2 className="text-lg font-medium">{selectedCollection.title}</h2>
              <button onClick={() => setSelectedCollection(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-lg" />
                      <div className="h-4 bg-gray-200 rounded mt-2 w-2/3" />
                    </div>
                  ))
                ) : (
                  selectedCollection.products?.map((product) => (
                    <SimpleProductCard 
                      key={product.id}
                      product={product}
                      className="w-full"
                    />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 