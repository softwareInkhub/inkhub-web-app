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

interface RouteContext {
  params: {
    orderId: string;
  };
}

export async function GET(
  request: Request,
  context: RouteContext & { params: Promise<RouteContext['params']> }
) {
  try {
    const { orderId } = await context.params;
    const query = `
      query GetOrderFulfillments($orderId: ID!) {
        node(id: $orderId) {
          ... on Order {
            id
            fulfillments {
              id
              status
              trackingInfo {
                number
                url
              }
            }
          }
        }
      }
    `;

    const data = await storefrontClient.request(query, {
      orderId: `gid://shopify/Order/${orderId}`
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching fulfillments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}