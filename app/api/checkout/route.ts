import { NextResponse } from 'next/server';
import { storefrontClient } from '@/utils/shopify';

interface CheckoutResponse {
  checkoutCreate: {
    checkout: {
      webUrl: string;
    };
    checkoutUserErrors: Array<{
      message: string;
      field: string[];
    }>;
  };
}

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    // Create line items for checkout
    const lineItems = items.map((item: any) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    // Create checkout mutation
    const mutation = `
      mutation createCheckout($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            webUrl
          }
          checkoutUserErrors {
            message
            field
          }
        }
      }
    `;

    // Execute the mutation
    const response = await storefrontClient.request<CheckoutResponse>(mutation, {
      input: {
        lineItems,
        // You can add additional checkout fields here if needed
      },
    });

    if (response.checkoutCreate.checkoutUserErrors.length > 0) {
      throw new Error(response.checkoutCreate.checkoutUserErrors[0].message);
    }

    return NextResponse.json({
      url: response.checkoutCreate.checkout.webUrl,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
} 