'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import ProductCard from './ProductCard';
import type { ShopifyCollection } from '@/types/shopify';

interface CollectionsSliderProps {
  collections: ShopifyCollection[];
  activeCollection?: string | null;
  onCollectionClick: (collection: ShopifyCollection) => void;
  selectedCollectionProducts: any[];
  isLoading: boolean;
  error: string | null;
}

export default function CollectionsSlider({ 
  collections,
  activeCollection,
  onCollectionClick,
  selectedCollectionProducts,
  isLoading,
  error 
}: CollectionsSliderProps) {
  const [activeCollectionState, setActiveCollection] = useState(activeCollection);
  
  // Add debug logging
  console.log('Collections:', collections);
  const activeCollectionData = collections.find(c => c.id === activeCollectionState);
  console.log('Active Collection:', activeCollectionData);
  
  const selectedProducts = activeCollectionData?.products?.edges || [];
  console.log('Selected Products:', selectedProducts);

  // Update the onClick handler
  const handleClick = (collection: ShopifyCollection) => {
    setActiveCollection(collection.id);
    onCollectionClick(collection);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <h2 className="text-2xl font-bold mb-8">Shop by Collection</h2>
      
      {/* Collection Pills with improved scrolling */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4">
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => handleClick(collection)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap
                transition-all duration-200 flex-shrink-0
                ${activeCollectionState === collection.id 
                  ? 'bg-black text-white scale-105' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
              `}
            >
              {collection.image && (
                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                  <Image
                    src={collection.image.url}
                    alt={collection.image.altText || ''}
                    fill
                    className="object-cover"
                    sizes="20px"
                  />
                </div>
              )}
              <span className="text-sm font-medium">{collection.title}</span>
            </button>
          ))}
        </div>
        
        {/* Fade indicators */}
        <div className="absolute left-0 top-0 bottom-6 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-6 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {selectedProducts.map((product: any) => (
          <ProductCard
            key={product.node.id}
            product={{
              id: product.node.id,
              handle: product.node.handle,
              title: product.node.title,
              price: {
                amount: product.node.priceRange.minVariantPrice.amount,
                currencyCode: product.node.priceRange.minVariantPrice.currencyCode
              },
              image: {
                url: product.node.images?.edges[0]?.node?.url || '',
                altText: product.node.title
              },
              variantId: product.node.variants?.edges[0]?.node?.id
            }}
          />
        ))}
      </div>
    </div>
  );
} 