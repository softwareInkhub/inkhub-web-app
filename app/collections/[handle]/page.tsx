import { storefrontClient } from '@/utils/shopify';
import ProductCard from '@/components/ProductCard';

interface PageProps {
  params: Promise<{ handle: string }>
  searchParams?: Promise<any>
}

interface CollectionResponse {
  collection: {
    id: string;
    title: string;
    description: string;
    products: {
      edges: Array<{
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
        };
      }>;
    };
  };
}

const getCollection = async (handle: string) => {
  const query = `
    query getCollection($handle: String!) {
      collection(handle: $handle) {
        id
        title
        description
        products(first: 50) {
          edges {
            node {
              id
              title
              handle
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await storefrontClient.request<CollectionResponse>(query, { handle });
    return data.collection;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CollectionPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { handle } = resolvedParams as { handle: string };
  const collection = await getCollection(handle);

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
  );
} 