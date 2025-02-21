export interface ShopifyImage {
  url: string;
  altText?: string | null;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText?: string;
  } | null;
  products?: {
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
              altText?: string;
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

export interface ShopifyProduct {
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
        altText?: string;
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
  // Add other properties as needed
} 