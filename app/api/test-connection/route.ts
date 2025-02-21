import { NextResponse } from 'next/server';
import { storefrontClient } from '@/utils/shopify';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const query = `
      query {
        shop {
          name
          primaryDomain {
            url
          }
        }
      }
    `;

    const data = await storefrontClient.request<{
      shop: {
        name: string;
        primaryDomain: {
          url: string;
        };
      };
    }>(query);

    return NextResponse.json({
      success: true,
      shop: {
        name: data.shop.name,
        domain: data.shop.primaryDomain.url,
        hasDiscounts: true
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}