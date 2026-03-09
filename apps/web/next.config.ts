import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@stardew/db', '@stardew/auth'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'stardewvalleywiki.com',
      },
    ],
  },
}

export default nextConfig
