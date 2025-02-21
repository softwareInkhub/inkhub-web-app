const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

async function ShopifyData(query: string) {
  try {
    const response = await fetch(
      `https://${domain}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontAccessToken!
        },
        body: JSON.stringify({ query })
      }
    );

    const jsonResponse = await response.json();
    
    if (jsonResponse.errors) {
      console.error('Shopify API Error:', jsonResponse.errors);
      throw new Error('Shopify API Error');
    }

    return jsonResponse;
  } catch (error) {
    console.error('Error fetching from Shopify:', error);
    throw error;
  }
}

export async function getCollections() {
  const query = `
    query Collections {
      collections(first: 10) {
        edges {
          node {
            id
            title
            handle
            image {
              url
              altText
            }
            products(first: 20) {
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
      }
    }
  `;

  try {
    const response = await ShopifyData(query);
    console.log('Shopify Response:', response); // Debug log

    if (!response.data) {
      console.error('No data in response:', response);
      return [];
    }

    const collections = response.data.collections.edges.map(({ node }) => {
      console.log('Collection:', node); // Debug log for each collection
      return node;
    });

    return collections;
  } catch (error) {
    console.error('Error in getCollections:', error);
    return [];
  }
}

export async function getCollectionProducts(collectionId: string) {
  const query = `
    {
      collection(id: "${collectionId}") {
        products(first: 20) {
          edges {
            node {
              id
              title
              handle
              priceRange {
                minVariantPrice {
                  amount
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
  `;

  const response = await ShopifyData(query);
  const products = response.data.collection.products.edges.map(({ node }) => ({
    ...node,
    price: node.priceRange.minVariantPrice.amount,
    image: node.images.edges[0]?.node
  }));
  return products;
}

export async function getFeaturedProducts() {
  const query = `
    query FeaturedProducts {
      products(first: 8, query: "tag:featured") {
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
  `;

  const response = await ShopifyData(query);
  return response?.data?.products?.edges || [];
} 