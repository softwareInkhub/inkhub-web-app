import CollectionClient from './CollectionClient';
import { storefrontClient } from '@/utils/shopify';
import PageTransition from '@/components/PageTransition';
import { Metadata } from 'next';

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

async function getCollection(handle: string) {
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

  const data = await storefrontClient.request<CollectionResponse>(query, { handle });
  return data.collection;
}

interface PageProps {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<any>;
}

export default async function CollectionPage({ 
  params 
}: PageProps) {
  const { handle } = await params;
  const collection = await getCollection(handle);
  
  return (
    <PageTransition>
      <CollectionClient collection={collection} />
    </PageTransition>
  );
} 