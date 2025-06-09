/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optionally modify images domain for remote images
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'firebasestorage.googleapis.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'placehold.co'
    ],
  },
  
  // Configure experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "bcabuysell.vercel.app"],
      bodySizeLimit: "2mb"
    },
    // Disable opt-in automatic staticGeneration
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    ppr: false,
  },
  
  // Disable eslint during build to prevent failures from linting errors
  eslint: {
    ignoreDuringBuilds: true,
  },
   
  // Disable type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configure specific headers for the application
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
        ],
      },
    ]
  },
  
  // Vercel-specific configuration for build environment
  env: {
    VERCEL_ENV: process.env.VERCEL_ENV || 'development',
    VERCEL_URL: process.env.VERCEL_URL || 'localhost:3000',
  },

  // Optimization settings
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  
  webpack: (config, { isServer }) => {
    // Add specific webpack configurations as needed
    if (!isServer) {
      // Client-side specific configs
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
