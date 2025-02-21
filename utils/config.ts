export const config = {
  shopify: {
    storeName: process.env.SHOPIFY_STORE_NAME,
    adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  }
};

export function validateConfig() {
  const requiredVars = {
    'SHOPIFY_STORE_NAME': config.shopify.storeName,
    'SHOPIFY_ADMIN_ACCESS_TOKEN': config.shopify.adminAccessToken,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
} 