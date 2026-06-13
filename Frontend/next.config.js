


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  swcMinify: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },

  // API Proxy — avoids CORS issues in production
  async rewrites() {
    const nodeUrl   = process.env.NEXT_PUBLIC_API_URL    || 'http://localhost:5080';
    const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_URL || 'http://localhost:8000';
    return [
      { source: '/node-api/:path*',   destination: `${nodeUrl}/:path*`   },
      { source: '/python-api/:path*', destination: `${pythonUrl}/:path*` },
    ];
  },

  // WWW → non-WWW canonical redirect (only matters once you own a custom domain)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.ranksetu.in' }],
        destination: 'https://ranksetu.in/:path*',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',       value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/(.*)\\.(js|css|woff2|woff|ttf|png|jpg|jpeg|gif|ico|svg|webp|avif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;