import { GraphQLClient, gql } from 'graphql-request';

// Initialize the GraphQL client with NEXT_PUBLIC variables
const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

// Add debug logs for environment variables
console.log('Store Domain:', process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN);
console.log('Endpoint:', endpoint);

if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || !process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN) {
  throw new Error('Shopify environment variables are not properly configured');
}

export const storefrontClient = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '',
    'Content-Type': 'application/json',
  },
});



// Define the query for featured products
const FEATURED_PRODUCTS_QUERY = gql`
  query FeaturedProducts($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          description
          handle
          availableForSale
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
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Define the expected structure of the response
type FeaturedProductsResponse = {
  products: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        description: string;
        handle: string;
        availableForSale: boolean;
        priceRange: {
          minVariantPrice: {
            amount: string;
            currencyCode: string;
          };
        };
        images: {
          edges: Array<{
            node: {
              url: string;
              altText: string | null;
            };
          }>;
        };
        variants: {
          edges: Array<{
            node: {
              id: string;
              price: {
                amount: string;
                currencyCode: string;
              };
            };
          }>;
        };
      };
    }>;
  };
};

// Function to fetch featured products
export async function getFeaturedProducts(first: number = 8) {
  try {
    const data = await storefrontClient.request<FeaturedProductsResponse>(FEATURED_PRODUCTS_QUERY, { first });
    return data.products.edges;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// API route methods
export async function getProducts() {
  try {
    const response = await fetch('/api/products');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch products');
    }

    return data.products.edges.map(({ node }: any) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      priceRange: {
        minVariantPrice: {
          amount: parseFloat(node.priceRange.minVariantPrice.amount).toFixed(2),
          currencyCode: node.priceRange.minVariantPrice.currencyCode
        }
      },
      image: {
        url: node.images.edges[0]?.node.url || '/placeholder.jpg',
        altText: node.images.edges[0]?.node.altText || node.title
      },
      variantId: node.variants.edges[0]?.node.id
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Direct GraphQL queries
export const PRODUCTS_QUERY = gql`
query Products($first: Int!) {
  products(first: $first, sortKey: CREATED_AT, reverse: true) {
    edges {
      node {
        id
        title
        description
        handle
        availableForSale
        priceRange {
          minVariantPrice {  # Remove the colon
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
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}
`;

export const COLLECTIONS_QUERY = gql`
  query Collections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          image {
            src
            altText
          }
        }
      }
    }
  }
`;

// Define the expected structure of the response
interface ProductsResponse {
  products: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
        priceRange: {
          minVariantPrice: {
            amount: string;
            currencyCode: string;
          };
        };
        images: {
          edges: Array<{
            node: {
              url: string;
              altText: string | null;
            };
          }>;
        };
        variants: {
          edges: Array<{
            node: {
              id: string;
            };
          }>;
        };
      };
    }>;
  };
}

// Direct client methods
export async function getAllProducts() {
  const query = `
    query getAllProducts {
      products(first: 250) {
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

  try {
    const response = await storefrontClient.request<ProductsResponse>(query);

    if (!response || !response.products || !response.products.edges) {
      console.error('Invalid response structure:', response);
      return [];
    }

    const products = response.products.edges.map(({ node }: any) => {
      // Add null checks for nested properties
      const imageEdge = node.images?.edges?.[0]?.node;
      const variantEdge = node.variants?.edges?.[0]?.node;
      const priceRange = node.priceRange?.minVariantPrice;

      return {
        id: node.id || '',
        title: node.title || '',
        handle: node.handle || '',
        price: {
          amount: priceRange?.amount || '0',
          currencyCode: priceRange?.currencyCode || 'USD',
        },
        image: {
          url: imageEdge?.url || '',
          altText: imageEdge?.altText || node.title || '',
        },
        variantId: variantEdge?.id || '',
      };
    });

    return products;
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

// Types
type ShopifyFetchParams = {
  query: string;
  variables?: any;
};

type ShopifyCollection = {
  id: string;
  handle: string;
  title: string;
  description?: string;
  image?: any;
  products_count?: number;
  // Make products optional since it's not always returned
  products?: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
};

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
      };
    }>;
  };
};

const domain = process.env.SHOPIFY_STORE_DOMAIN!;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

interface ShopifyFetchProps {
  query?: string;
  variables?: any;
  endpoint?: string;
}

export async function shopifyFetch({ query, variables, endpoint }: ShopifyFetchProps) {
  try {
    const response = await fetch(
      `https://${domain}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    console.log('Shopify Response:', json); // Debug log
    return json;
  } catch (error) {
    console.error('Shopify Fetch Error:', error);
    throw error;
  }
}

export async function getAllCollections() {
  const query = `
    query Collections {
      collections(first: 10) {
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

  const response = await shopifyFetch({ query });
  return response.data.collections.edges;
}

// Add this query with the others
const PRODUCT_BY_HANDLE_QUERY = gql`
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      availableForSale
      descriptionHtml
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
      tags
      vendor
      collections(first: 5) {
        edges {
          node {
            title
            handle
          }
        }
      }
    }
  }
`;

// Define the expected structure of the response
type ProductByHandleResponse = {
  product: {
    id: string;
    title: string;
    handle: string;
    description: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
        };
      }>;
    };
  } | null;
};

interface ProductResponse {
  product: {
    id: string;
    title: string;
    handle: string;
    description: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: {
            name: string;
            value: string;
          }[];
        };
      }>;
    };
    options: {
      id: string;
      name: string;
      values: string[];
    }[];
    collections?: {
      edges: Array<{
        node: {
          title: string;
          handle: string;
        };
      }>;
    };
    descriptionHtml?: string;
  } | null;
}

export async function getProductByHandle(handle: string) {
  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
        }
        options {
          id
          name
          values
        }
        collections(first: 5) {
          edges {
            node {
              title
              handle
            }
          }
        }
        descriptionHtml
      }
    }
  `;

  try {
    const response = await storefrontClient.request(query, { handle });

    // Type assertion
    const typedResponse = response as ProductResponse;

    console.log('Product response:', typedResponse); // Debug log
    return typedResponse.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Define the expected structure of the response
type ProductByIdResponse = {
  data: {
    product: {
      id: string;
      title: string;
      handle: string;
      description: string;
      priceRange: {
        minVariantPrice: {
          amount: string;
          currencyCode: string;
        };
      };
      images: {
        edges: Array<{
          node: {
            url: string;
            altText: string | null;
          };
        }>;
      };
      variants: {
        edges: Array<{
          node: {
            id: string;
          };
        }>;
      };
    } | null;
  };
};

export async function getProductById(id: string) {
  console.log('Fetching product with ID:', id); // Debug log

  const query = `
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        handle
        description
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
  `;

  try {
    const response = await storefrontClient.request<ProductByIdResponse>(query, { id });

    console.log('Raw Shopify Response:', response); // Debug log

    const product = response.data.product;
    if (!product) {
      console.log('No product found for ID:', id); // Debug log
      return null;
    }

    const formattedProduct = {
      id: product.id,
      title: product.title,
      handle: product.handle,
      price: {
        amount: product.priceRange.minVariantPrice.amount,
        currencyCode: product.priceRange.minVariantPrice.currencyCode,
      },
      image: {
        url: product.images.edges[0]?.node.url || '',
        altText: product.images.edges[0]?.node.altText || product.title,
      },
      variantId: product.variants.edges[0]?.node.id || '',
    };

    console.log('Formatted Product:', formattedProduct); // Debug log
    return formattedProduct;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Add this interface to define the collections response type
interface CollectionsResponse {
  collections: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
        image?: {
          src: string;
          altText: string | null;
        };
      };
    }>;
  };
}

export async function getCollections(first: number = 4) {
  try {
    const data = await storefrontClient.request<CollectionsResponse>(COLLECTIONS_QUERY, { first });
    return data.collections.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      imageUrl: node.image?.src || '/placeholder.jpg',
      altText: node.image?.altText || node.title,
    }));
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function getCollectionProducts(collectionId: string) {
  try {
    const response = await fetch(`/api/products?collection=${collectionId}`);
    const data = await response.json();

    if (!data.products?.edges) {
      return [];
    }

    return data.products.edges.map(({ node }) => ({
      objectID: node.id,
      id: node.id.replace('gid://shopify/Product/', ''),
      title: node.title,
      handle: node.handle,
      price: node.priceRange.minVariantPrice.amount,
      image: node.images.edges[0]?.node || null
    }));
  } catch (error) {
    console.error('Error fetching collection products:', error);
    return [];
  }
}
