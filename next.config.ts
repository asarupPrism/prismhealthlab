import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Environment validation at build time
function validateCriticalEnvVars() {
  const critical = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'NEXT_PUBLIC_SWELL_STORE_ID',
    'NEXT_PUBLIC_SWELL_PUBLIC_KEY'
  ];
  
  const missing = critical.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.error('❌ Critical environment variables missing for production build:');
    missing.forEach(envVar => console.error(`   - ${envVar}`));
    console.error('\n📝 See .env.example for setup instructions');
    process.exit(1);
  } else if (missing.length > 0) {
    console.warn('⚠️  Some environment variables are missing (will use fallbacks):');
    missing.forEach(envVar => console.warn(`   - ${envVar}`));
  }
}

// Run validation
validateCriticalEnvVars();

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['framer-motion', '@supabase/supabase-js'],
  },
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Compress responses
  compress: true,
  
  webpack(config, { isServer }) {
    // Prevent client-side bundling of server-only dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Stub out deasync and other native dependencies on client-side
        deasync: false,
        'http-cookie-agent': false,
        'swell-node': false,
      }
    }
    
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    }
    
    return config
  },
  
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
};

export default withBundleAnalyzer(nextConfig);
