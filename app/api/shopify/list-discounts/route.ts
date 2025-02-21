import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

const DISCOUNT_CODES_QUERY = `
  query($cursor: String) {
    priceRules(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          target {
            type
            selection
          }
          allocationMethod
          valueType
          value
          startsAt
          endsAt
          status
          discountCodes(first: 250) {
            edges {
              node {
                id
                code
                usageCount
              }
            }
          }
        }
      }
    }
  }
`;

export async function GET() {
  try {
    if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_ADMIN_TOKEN) {
      console.error('Missing Shopify credentials in environment variables');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing Shopify configuration' 
        },
        { status: 500 }
      );
    }

    const shopifyUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`;
    
    // Fetch all price rules using pagination
    let allPriceRules: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const response = await fetch(shopifyUrl, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: DISCOUNT_CODES_QUERY,
          variables: { cursor }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Shopify API Error:', errorData);
        throw new Error(`Shopify API Error: ${response.status}`);
      }

      const { data } = await response.json();
      
      allPriceRules = [...allPriceRules, ...data.priceRules.edges];
      hasNextPage = data.priceRules.pageInfo.hasNextPage;
      cursor = data.priceRules.pageInfo.endCursor;

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Transform the GraphQL response to a cleaner format
    const discountCodes = allPriceRules.map((edge: any) => {
      const rule = edge.node;
      return {
        priceRule: {
          id: rule.id,
          title: rule.title,
          target_type: rule.target.type,
          target_selection: rule.target.selection,
          allocation_method: rule.allocationMethod,
          value_type: rule.valueType,
          value: rule.value,
          starts_at: rule.startsAt,
          ends_at: rule.endsAt,
          status: rule.status,
        },
        discountCodes: rule.discountCodes.edges.map((codeEdge: any) => ({
          id: codeEdge.node.id,
          code: codeEdge.node.code,
          usage_count: codeEdge.node.usageCount,
        })),
      };
    });

    // Add summary information
    const summary = {
      totalPriceRules: discountCodes.length,
      totalDiscountCodes: discountCodes.reduce(
        (sum, rule) => sum + rule.discountCodes.length, 
        0
      ),
      activePriceRules: discountCodes.filter(
        rule => rule.priceRule.status === 'ACTIVE'
      ).length,
    };

    return NextResponse.json({
      success: true,
      summary,
      discountCodes,
    });
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch discount codes',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 