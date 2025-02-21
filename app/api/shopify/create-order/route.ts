import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Starting order creation with body:', JSON.stringify(body, null, 2));

    // 1. First create/find customer with selected address info
    const customerData = {
      customer: {
        // Use shipping address name for the customer
        first_name: body.shippingAddress.firstName,
        last_name: body.shippingAddress.lastName,
        email: body.email,
        phone: body.shippingAddress.phone,
        verified_email: true,
        addresses: [{
          first_name: body.shippingAddress.firstName,
          last_name: body.shippingAddress.lastName,
          address1: body.shippingAddress.street,
          city: body.shippingAddress.city,
          province: body.shippingAddress.state,
          zip: body.shippingAddress.pincode,
          country: "India",
          country_code: "IN",
          default: true
        }]
      }
    };

    // Search for existing customer by email
    const customerSearchResponse = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/customers/search.json?query=email:${body.email}`,
      {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN!,
        }
      }
    );

    const customerSearchData = await customerSearchResponse.json();
    let customerId;

    if (customerSearchData.customers?.length > 0) {
      // Update existing customer with new address
      customerId = customerSearchData.customers[0].id;
      
      // Update customer information
      await fetch(
        `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/customers/${customerId}.json`,
        {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer: {
              id: customerId,
              first_name: body.shippingAddress.firstName,
              last_name: body.shippingAddress.lastName,
              addresses: [{
                address1: body.shippingAddress.street,
                city: body.shippingAddress.city,
                province: body.shippingAddress.state,
                zip: body.shippingAddress.pincode,
                country: "India",
                country_code: "IN",
                first_name: body.shippingAddress.firstName,
                last_name: body.shippingAddress.lastName
              }]
            }
          })
        }
      );
    } else {
      // Create new customer
      const createCustomerResponse = await fetch(
        `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/customers.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData)
        }
      );

      const newCustomerData = await createCustomerResponse.json();
      if (!createCustomerResponse.ok) {
        throw new Error(`Failed to create customer: ${JSON.stringify(newCustomerData)}`);
      }
      customerId = newCustomerData.customer.id;
    }

    // 2. Create order with customer ID
    const orderData = {
      order: {
        line_items: body.items.map((item: any) => ({
          variant_id: parseInt(item.variantId.split('/').pop()),
          quantity: item.quantity,
          price: (body.finalAmount / body.items.reduce((total: number, item: any) => total + item.quantity, 0)).toFixed(2)
        })),
        customer: {
          id: customerId
        },
        email: body.email,
        shipping_address: {
          first_name: body.shippingAddress.firstName,
          last_name: body.shippingAddress.lastName,
          address1: body.shippingAddress.street,
          phone: body.shippingAddress.phone,
          city: body.shippingAddress.city,
          province: body.shippingAddress.state,
          zip: body.shippingAddress.pincode,
          country: "India",
          country_code: "IN"
        },
        billing_address: {
          first_name: body.shippingAddress.firstName,
          last_name: body.shippingAddress.lastName,
          address1: body.shippingAddress.street,
          phone: body.shippingAddress.phone,
          city: body.shippingAddress.city,
          province: body.shippingAddress.state,
          zip: body.shippingAddress.pincode,
          country: "India",
          country_code: "IN"
        },
        financial_status: "paid",
        inventory_behaviour: "bypass",
        send_receipt: true,
        send_fulfillment_receipt: true,
        tags: [
          body.isFreeOrder ? "FREE_ORDER" : "PAID_ORDER",
          body.appliedDiscount ? `DISCOUNT_${body.appliedDiscount.code}` : ""
        ].filter(Boolean),
        note: `Order by: ${body.shippingAddress.firstName} ${body.shippingAddress.lastName}\n${
          body.appliedDiscount 
            ? `Discount Applied: ${body.appliedDiscount.code} (${body.appliedDiscount.percentageOff}% off)\n` 
            : ''
        }${body.isFreeOrder ? "Free Order" : "Paid Order"}`
      }
    };

    // Add debug logging
    console.log('Order total:', body.total);
    console.log('Line items:', orderData.order.line_items);

    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

    const createOrderResponse = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      }
    );

    const result = await createOrderResponse.json();
    console.log('Shopify order creation response:', JSON.stringify(result, null, 2));

    if (!createOrderResponse.ok) {
      throw new Error(`Shopify Error: ${JSON.stringify(result)}`);
    }

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      orderName: result.order.name
    });

  } catch (error) {
    console.error('Detailed order creation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
