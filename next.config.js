/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.shopify.com'], // Add your Shopify CDN domain
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
  distDir: 'dist',
  trailingSlash: true,
  optimizeFonts: true,
  experimental: {
    optimizeFonts: true,
  }
}

module.exports = nextConfig