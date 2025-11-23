/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@safewatch/shared'],
  eslint: {
    // Disable ESLint during builds (for deployment)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during builds (for deployment)
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'
  }
}

module.exports = nextConfig
