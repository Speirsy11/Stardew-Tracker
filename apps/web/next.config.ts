import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@stardew/db', '@stardew/auth', '@stardew/pixel-art'],
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
