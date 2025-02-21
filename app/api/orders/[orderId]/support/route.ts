import { NextResponse } from 'next/server';
import { storefrontClient } from '@/utils/shopify';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  try {
    const query = `
      query {
        orders(first: 100) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const data = await storefrontClient.request<{
      orders: {
        edges: Array<{
          node: {
            id: string;
          };
        }>;
      };
    }>(query);

    return data.orders.edges.map(({ node }) => ({
      orderId: node.id.split('/').pop()
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
        orders(first: 100) {
          edges {
            node {
              id
              email
            }
          }
        }
      }
    `;

    const data = await storefrontClient.request<{
      orders: {
        edges: Array<{
          node: {
            id: string;
            email: string;
          };
        }>;
      };
    }>(query);

    const orders = data.orders.edges.map(({ node }) => ({
      orderId: node.id.split('/').pop(),
      email: node.email
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}