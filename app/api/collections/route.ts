export const dynamic = 'force-static'
export const revalidate = false

import { NextResponse } from 'next/server';
import { GraphQLClient, gql } from 'graphql-request';

const SHOP_NAME = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

if (!SHOP_NAME || !STOREFRONT_ACCESS_TOKEN) {
  throw new Error('Missing required environment variables');
}

const endpoint = `https://${SHOP_NAME}/api/2024-01/graphql.json`;

const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    'Content-Type': 'application/json',
  },
});

const COLLECTIONS_QUERY = gql`
  query GetCollections {
    collections(first: 20) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
          }
          products(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;

interface CollectionsResponse {
  collections: {
    edges: Array<{
      node: {
        id: string;
        handle: string;
        title: string;
        description: string;
        image?: {
          url: string;
          altText?: string;
        };
        products: {
          edges: Array<{ node: { id: string } }>;
        };
      };
    }>;
  };
}

export async function GET() {
  try {
    const data = await graphqlClient.request<CollectionsResponse>(COLLECTIONS_QUERY);
    
    if (!data?.collections?.edges) {
      throw new Error('Invalid response structure');
    }

    const collections = data.collections.edges.map(({ node }) => ({
      id: node.id,
      handle: node.handle,
      title: node.title,
      description: node.description,
      image: node.image,
      products_count: node.products.edges.length
    }));

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: `Failed to fetch collections: ${error.message}` },
      { status: 500 }
    );
  }
} 