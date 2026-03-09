import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@stardew/db', '@stardew/auth'],
}

export default nextConfig
