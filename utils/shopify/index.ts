const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!domain || !storefrontAccessToken) {
  throw new Error('Shopify environment variables are not properly configured');
}

async function shopifyFetch({ query }: { query: string }) {
  try {
    const endpoint = `https://${domain}/api/2024-01/graphql.json`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch from Shopify');
  }
}

export async function getAllCollections() {
  const query = `
    query Collections {
      collections(first: 250) {
        edges {
          node {
            id
            title
            handle
            products(first: 8) {
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
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query });
  return response.data.collections.edges;
}

export async function getFeaturedProducts() {
  const query = `
    query FeaturedProducts {
      products(first: 4, sortKey: BEST_SELLING) {
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
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query });
  return response.data.products.edges;
} 