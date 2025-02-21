import { NextResponse } from 'next/server';
import { storefrontClient } from '@/utils/shopify';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const query = `
      query {
        discountNodes(first: 10) {
          edges {
            node {
              id
              discount {
                ... on DiscountCodeBasic {
                  title
                  code
                  startsAt
                  endsAt
                  customerSelection {
                    ... on DiscountCustomerAll {
                      allCustomers
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await storefrontClient.request(query);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return NextResponse.json({ error: 'Failed to fetch discount codes' }, { status: 500 });
  }
} 