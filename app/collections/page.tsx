import CollectionsGrid from '@/components/CollectionsGrid';
import type { ShopifyCollection } from '@/types/shopify';
import { getCollections } from '@/lib/shopify';
import { Suspense } from 'react';

export default async function CollectionsPage() {
  const shopifyCollections: ShopifyCollection[] = await getCollections();

  // Transform the collections to match the expected type
  const collections = shopifyCollections.map(collection => ({
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    image: collection.image,
    products: collection.products?.edges.map(({ node }) => ({
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
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Our Collections</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <CollectionsGrid 
          collections={collections} 
          className="container mx-auto px-4 py-8"
          gridCols="grid-cols-2 md:grid-cols-3"
        />
      </Suspense>
    </div>
  );
} 