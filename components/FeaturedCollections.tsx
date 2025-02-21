'use client';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';
import ProductCard from './ProductCard';
import CollectionPageModal from './CollectionPageModal';

interface Collection {
  id: string;
  title: string;
  handle: string;
  image: {
    url: string;
    altText: string | null;
  } | null;
  products?: any[]; // Add products to collection interface
}

interface FeaturedCollectionsProps {
  collections: Collection[];
}

export default function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
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
        } as Collection);
      }
    } catch (error) {
      console.error('Error loading collection products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-medium mb-8">Featured Collections</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              className="group cursor-pointer"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={(e) => handleCollectionClick(collection, e)}
            >
              {/* Image Container */}
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                {collection.image && (
                  <Image
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              
              {/* Title Below Image */}
              <h3 className="mt-4 text-sm font-medium text-gray-900 group-hover:underline">
                {collection.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        <CollectionPageModal
          collection={selectedCollection}
          isLoading={isLoading}
          clickedPosition={clickedPosition}
          onClose={() => setSelectedCollection(null)}
        />
      </AnimatePresence>
    </>
  );
} 