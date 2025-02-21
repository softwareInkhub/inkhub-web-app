import { NextResponse } from 'next/server';

const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_DOMAIN;

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ 
        success: false, 
        error: 'Phone number is required' 
      });
    }

    const formattedPhone = phone.replace(/\+|\s/g, '');
    const shopifyUrl = `https://${SHOPIFY_STORE_URL}/admin/api/2024-01`;

    // First, search for customer
    const customerResponse = await fetch(
      `${shopifyUrl}/customers/search.json?query=phone:${encodeURIComponent(formattedPhone)}`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!customerResponse.ok) {
      const errorData = await customerResponse.text();
      throw new Error(`Shopify API error: ${customerResponse.status} ${errorData}`);
    }

    const customerData = await customerResponse.json();

    if (!customerData.customers || customerData.customers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        orders: [],
        message: 'No customer found with this phone number'
      });
    }

    const customer = customerData.customers[0];

    // Fetch orders with line item images
    const ordersResponse = await fetch(
      `${shopifyUrl}/orders.json?customer_id=${customer.id}&status=any&fields=id,name,created_at,total_price,fulfillment_status,financial_status,line_items`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!ordersResponse.ok) {
      const errorData = await ordersResponse.text();
      throw new Error(`Shopify Orders API error: ${ordersResponse.status} ${errorData}`);
    }

    const ordersData = await ordersResponse.json();

    // Process orders and fetch product images
    const processedOrders = await Promise.all(ordersData.orders.map(async (order: any) => {
      // Fetch product details for each line item to get images
      const lineItemsWithImages = await Promise.all(order.line_items.map(async (item: any) => {
        if (item.product_id) {
          try {
            const productResponse = await fetch(
              `${shopifyUrl}/products/${item.product_id}.json`,
              {
                headers: {
                  'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN!,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (productResponse.ok) {
              const productData = await productResponse.json();
              const variant = productData.product.variants.find(
                (v: any) => v.id === item.variant_id
              );
              
              // Get the specific variant image or the first product image
              const variantImage = variant?.image_id 
                ? productData.product.images.find((img: any) => img.id === variant.image_id)
                : productData.product.images[0];

              return {
                ...item,
                image: variantImage?.src || null
              };
            }
          } catch (error) {
            console.error(`Error fetching product ${item.product_id}:`, error);
          }
        }
        return item;
      }));

      return {
        id: order.id,
        name: order.name,
        created_at: order.created_at,
        total_price: order.total_price,
        fulfillment_status: order.fulfillment_status || 'unfulfilled',
        financial_status: order.financial_status,
        line_items: lineItemsWithImages.map((item: any) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          image: item.image || null,
          product_id: item.product_id,
          variant_id: item.variant_id
        }))
      };
    }));

    return NextResponse.json({
      success: true,
      orders: processedOrders
    });

  } catch (error) {
    console.error('Detailed API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch orders',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 