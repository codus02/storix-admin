import type { NextConfig } from 'next'

const apiOrigin = process.env.NEXT_PUBLIC_API_URL || 'https://api.storix.kr'

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
