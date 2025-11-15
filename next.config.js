/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CIRCLE_API_KEY: process.env.CIRCLE_API_KEY,
    CIRCLE_CLIENT_KEY: process.env.CIRCLE_CLIENT_KEY,
    CIRCLE_ENTITY_SECRET: process.env.CIRCLE_ENTITY_SECRET,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Optimize chunk loading
  experimental: {
    optimizePackageImports: ['react-query', 'wagmi', 'viem']
  },
  // Ensure proper static file serving
  assetPrefix: '',
  // Configure build optimization
  compiler: {
    removeConsole: false,
  },
}

module.exports = nextConfig