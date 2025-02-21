import { NextResponse } from 'next/server';

const VALIDATE_DISCOUNT_QUERY = `
  query($code: String!) {
    codeDiscountNodeByCode(code: $code) {
      id
      codeDiscount {
        ... on DiscountCodeBasic {
          title
          status
          startsAt
          endsAt
          customerGets {
            value {
              ... on DiscountPercentage {
                percentage
              }
              ... on DiscountAmount {
                amount {
                  amount
                  currencyCode
                }
              }
            }
            items {
              ... on AllDiscountItems {
                allItems
              }
            }
          }
        }
      }
    }
  }
`;

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Please enter a discount code' 
      });
    }

    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: VALIDATE_DISCOUNT_QUERY,
          variables: { code }
        }),
      }
    );

    const { data, errors } = await response.json();

    // Debug log to see raw response
    console.log('Shopify Discount Response:', JSON.stringify(data, null, 2));

    if (errors) {
      console.error('GraphQL Errors:', errors);
      return NextResponse.json({ 
        valid: false, 
        error: 'Failed to validate discount code' 
      });
    }

    if (!data.codeDiscountNodeByCode) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid discount code' 
      });
    }

    const discount = data.codeDiscountNodeByCode.codeDiscount;
    const discountValue = discount.customerGets.value;

    // Extract and validate discount value
    let discountType: 'percentage' | 'fixed';
    let discountAmount: string;

    if ('percentage' in discountValue) {
      discountType = 'percentage';
      // Ensure we're getting the correct percentage value
      const percentageValue = parseFloat(discountValue.percentage);
      
      // Debug log for percentage value
      console.log('Raw percentage value:', discountValue.percentage);
      console.log('Parsed percentage value:', percentageValue);

      // Handle 100% discount case
      if (percentageValue === 100) {
        discountAmount = '100';
      } else {
        // Convert to string with up to 2 decimal places
        discountAmount = percentageValue.toFixed(2);
      }
    } else {
      discountType = 'fixed';
      // Handle fixed amount discount
      const fixedAmount = parseFloat(discountValue.amount.amount);
      discountAmount = fixedAmount.toFixed(2);
    }

    // Debug log final discount details
    console.log('Final discount details:', {
      type: discountType,
      amount: discountAmount,
      originalValue: discountValue
    });

    return NextResponse.json({
      valid: true,
      discount: {
        code: code.toUpperCase(),
        amount: discountAmount,
        type: discountType,
        title: discount.title
      }
    });

  } catch (error) {
    console.error('Validation Error:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Failed to validate discount code',
      debug: error instanceof Error ? error.message : String(error)
    });
  }
} 