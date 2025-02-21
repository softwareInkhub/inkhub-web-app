'use client';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

type Product = {
  node: {
    id: string;
    title: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
        };
      }>;
    };
  };
};

type FeaturedProductsProps = {
  products: Array<Product>;
};

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Best Sellers</h2>
          <Link 
            href="/collections/best-sellers" 
            className="text-gray-900 hover:text-gray-600"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products?.map(({ node: product }) => (
            <div key={product.id}>
              <ProductCard
                product={{
                  id: product.id,
                  handle: product.handle,
                  title: product.title,
                  price: {
                    amount: product.priceRange.minVariantPrice.amount,
                    currencyCode: product.priceRange.minVariantPrice.currencyCode
                  },
                  image: {
                    url: product.images?.edges[0]?.node?.url || '',
                    altText: product.images?.edges[0]?.node?.altText || product.title
                  },
                  variantId: product.variants?.edges[0]?.node?.id || ''
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 