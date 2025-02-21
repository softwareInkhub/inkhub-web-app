'use client';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';

interface ProductGridProps {
  products: any[];
  isLoading: boolean;
  error: string | null;
}

export default function ProductGrid({ products, isLoading, error }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-gray-400 text-sm mt-1">Try selecting a different collection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product.id} className="relative group">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={product.image || '/placeholder.png'}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={false}
            />
          </div>
          <ProductCard
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
              variantId: product.variantId
            }}
            isFirst={product.id === products[0].id}
          />
        </div>
      ))}
    </div>
  );
} 