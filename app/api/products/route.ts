import { NextResponse } from 'next/server';
import { storefrontClient } from '@/utils/shopify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collection');

    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    const query = `
      query CollectionProducts {
        collection(id: "gid://shopify/Collection/${collectionId}") {
          id
          title
          handle
          products(first: 50) {
            edges {
              node {
                id
                title
                handle
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
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

    if (!data?.collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json({ collection: data.collection });

  } catch (error) {
    console.error('Error fetching collection products:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch products' 
    }, { status: 500 });
  }
}