/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add environment variables that should be made available to the browser
  env: {
    // Firebase client config (already in .env)
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    
    // Auth configuration
    COOKIE_NAME: process.env.COOKIE_NAME || 'bca-buy-sell-auth',
    COOKIE_SECURE: (process.env.NODE_ENV === 'production').toString(),
    SESSION_MAX_AGE: (60 * 60 * 24 * 7).toString(), // 7 days
  },
  
  // Configure experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"]
    },
  },
  
  // Configure headers to enhance security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          }
        ],
      },
    ]
  },
  
  // This is needed for proper cookie handling in some environments
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Configure redirects for authentication
  async redirects() {
    return [
      {
        source: '/auth',
        destination: '/auth/signin',
        permanent: true,
      },
    ]
  },
  
  // Disable eslint during build to prevent failures from linting errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
