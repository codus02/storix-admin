import type { NextConfig } from 'next'

const defaultApiOrigin = process.env.NODE_ENV === 'development'
  ? 'https://dev.storix.kr'
  : 'https://api.storix.kr'

const apiOrigin = process.env.NEXT_PUBLIC_API_URL || defaultApiOrigin

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
