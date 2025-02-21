'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { ShopifyCollection } from '@/types/shopify';
import { useEffect } from 'react';
import ProductCard from '../ProductCard';

interface CollectionsSliderProps {
  collections: ShopifyCollection[];
  activeCollection: string | null;
  onCollectionClick: (collection: ShopifyCollection) => void;
  selectedCollectionProducts: any[]; // Add proper type
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
  useEffect(() => {
    if (collections.length > 0 && !activeCollection) {
      onCollectionClick(collections[0]);
    }
  }, [collections, activeCollection, onCollectionClick]);

  return (
    <div className="h-[500px] bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Horizontal Collections Bar */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="flex p-2.5 gap-2 overflow-x-auto scrollbar-hide">
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => onCollectionClick(collection)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all
                ${activeCollection === collection.id
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'}
              `}
            >
              {collection.image?.url && (
                <div className="relative w-6 h-6 rounded-md overflow-hidden">
                  <Image
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    fill
                    className="object-cover"
                    sizes="24px"
                  />
                </div>
              )}
              <span className="text-sm font-medium">{collection.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="h-[calc(100%-61px)] overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : selectedCollectionProducts.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {selectedCollectionProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  handle: product.handle,
                  title: product.title,
                  price: {
                    amount: product.price,
                    currencyCode: 'INR'
                  },
                  image: {
                    url: product.image?.url || '',
                    altText: product.image?.altText || product.title
                  },
                  variantId: product.variantId || product.id // Adjust based on your data structure
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 font-medium">
                {activeCollection
                  ? 'No products found in this collection'
                  : 'Select a collection to view products'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {activeCollection
                  ? 'Try selecting a different collection'
                  : 'Browse our curated collections above'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 