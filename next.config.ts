import type { NextConfig } from 'next'

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})

const config: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['cdn.shopify.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

export default withPWA(config)
