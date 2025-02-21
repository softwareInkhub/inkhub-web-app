/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cdn.shopify.com',
      'ink7.myshopify.com' // Replace with your actual Shopify domain
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  // Change output to 'standalone' instead of 'export'
  output: 'standalone',
  distDir: '.next',
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ];
  }
}

module.exports = nextConfig