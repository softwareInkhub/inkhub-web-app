import { NextResponse } from 'next/server';
import { storefrontClient } from '@/utils/shopify';

type ProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange: {
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

type ProductResponse = {
  product: ProductNode | null;
};

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  try {
    const query = `
      query {
        products(first: 100) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const data = await storefrontClient.request<{
      products: {
        edges: Array<{
          node: {
            id: string;
          };
        }>;
      };
    }>(query);

    return data.products.edges.map(({ node }) => ({
      id: node.id.split('/').pop()
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function GET() {
  try {
    const query = `
      query {
        products(first: 100) {
          edges {
            node {
              id
              title
              handle
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              compareAtPriceRange {
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
    `;

    const data = await storefrontClient.request<{
      products: {
        edges: Array<{
          node: ProductNode;
        }>;
      };
    }>(query);

    const products = data.products.edges.map(({ node }) => ({
      id: node.id.split('/').pop(),
      title: node.title,
      handle: node.handle,
      description: node.description,
      price: node.priceRange.minVariantPrice,
      compareAtPrice: node.compareAtPriceRange?.minVariantPrice,
      image: node.images.edges[0]?.node || null
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}