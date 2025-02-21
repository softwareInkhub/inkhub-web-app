'use client';
import { useState } from 'react';
import Image from 'next/image';
import BackButton from './BackButton';

export function ProductView({ product }: { product: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="h-12 flex items-center">
            <BackButton />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 mb-20">
        <div className="space-y-4">
          {/* Product Images */}
          <div className="w-full rounded-xl overflow-hidden bg-gray-100">
            <div className="relative w-full">
              <Image
                src={product.images[selectedImageIndex]?.url || '/placeholder.jpg'}
                alt={product.images[selectedImageIndex]?.altText || product.title}
                width={500}
                height={500}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image: any, index: number) => (
                <button
                  key={image.url}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden ${
                    selectedImageIndex === index ? 'ring-2 ring-black' : ''
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.altText || ''}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Product Info */}
          <div>
            {product.vendor && (
              <p className="text-sm text-gray-500 mb-1">{product.vendor}</p>
            )}
            <h1 className="text-xl font-medium text-gray-900">{product.title}</h1>
            <p className="text-lg font-medium text-gray-900 mt-1">
              {product.priceRange.minVariantPrice.currencyCode} 
              {product.priceRange.minVariantPrice.amount}
            </p>
          </div>

          {/* Product Description */}
          <div className="text-sm text-gray-600 leading-relaxed">
            <div className={`relative ${!isExpanded && 'max-h-24 overflow-hidden'}`}>
              <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }} />
              {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-900 text-sm mt-2 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button 
          className={`w-full py-3 rounded-lg font-medium ${
            product.availableForSale 
              ? 'bg-black text-white hover:bg-gray-900' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!product.availableForSale}
        >
          {product.availableForSale ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
} 