'use client';
import ProductCard from '@/components/ProductCard';
import PageTransition from '@/components/PageTransition';

interface CollectionClientProps {
  collection: any; // Add proper typing based on your data structure
}

export default function CollectionClient({ collection }: CollectionClientProps) {
  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Collection not found</h2>
          <p className="mt-1 text-sm text-gray-500">Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
        {collection.description && (
          <p className="text-gray-600 mb-8">{collection.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          {collection.products.edges.map(({ node: product }, index) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                handle: product.handle,
                title: product.title,
                price: {
                  amount: product.priceRange.minVariantPrice.amount,
                  currencyCode: product.priceRange.minVariantPrice.currencyCode
                },
                image: {
                  url: product.images.edges[0]?.node.url || '',
                  altText: product.images.edges[0]?.node.altText || product.title
                },
                variantId: product.id
              }}
              isFirst={index === 0}
            />
          ))}
        </div>
      </div>
    </PageTransition>
  );
} 