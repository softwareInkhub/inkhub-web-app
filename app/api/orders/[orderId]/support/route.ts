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
  params: Promise<{
    orderId: string;
  }>;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { orderId } = await context.params;
    
    const query = `
      query GetOrder($orderId: ID!) {
        node(id: $orderId) {
          ... on Order {
            id
            email
            customerUrl
          }
        }
      }
    `;

    const data = await storefrontClient.request(query, {
      orderId: `gid://shopify/Order/${orderId}`
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { order } = await request.json();
    const { orderId } = await context.params;

    const message = encodeURIComponent(
      `Hi, I need help with my order #${order.name}. Order ID: ${orderId}`
    );
    const whatsappLink = `https://wa.me/+919693934748?text=${message}`;

    return NextResponse.json({ whatsappLink });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate support link' }, { status: 500 });
  }
}