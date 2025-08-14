import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Smart environment validation with graceful degradation
function validateEnvironmentConfiguration() {
  const critical = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'NEXT_PUBLIC_SWELL_STORE_ID',
    'NEXT_PUBLIC_SWELL_PUBLIC_KEY'
  ];
  
  const optional = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
    'NEXT_PUBLIC_SENTRY_DSN'
  ];
  
  const missing = critical.filter(envVar => !process.env[envVar]);
  const missingOptional = optional.filter(envVar => !process.env[envVar]);
  
  // Environment-aware validation strategy
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercelBuild = process.env.VERCEL === '1';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  
  console.log('\n🔧 Environment Configuration Analysis');
  console.log('=====================================');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Platform: ${isVercelBuild ? 'Vercel' : 'Local'}`);
  console.log(`Build Type: ${isPreview ? 'Preview' : (isProduction ? 'Production' : 'Development')}`);
  
  if (missing.length === 0) {
    console.log('✅ All critical environment variables configured');
  } else {
    console.log('⚠️  Missing critical environment variables:');
    missing.forEach(envVar => console.log(`   - ${envVar}`));
    
    // Smart degradation strategy
    if (isProduction && !isPreview) {
      console.log('\n🚨 Production Deployment Strategy:');
      console.log('   • Database features will be disabled');
      console.log('   • E-commerce integration will show maintenance mode');
      console.log('   • Static content and UI will function normally');
      console.log('   • Configure environment variables to enable full functionality');
      console.log('\n📝 See .env.example for setup instructions');
      
      // Don't exit - allow build to continue with degraded functionality
    } else if (isPreview) {
      console.log('\n🔍 Preview Deployment: Building with mock data for UI testing');
    } else {
      console.log('\n🛠️  Development Mode: Using fallback configurations');
    }
  }
  
  if (missingOptional.length > 0) {
    console.log('\n📋 Optional integrations available for enhanced functionality:');
    missingOptional.forEach(envVar => {
      const features: Record<string, string> = {
        'UPSTASH_REDIS_REST_URL': 'Performance caching',
        'VAPID_PUBLIC_KEY': 'Push notifications',
        'NEXT_PUBLIC_SENTRY_DSN': 'Error monitoring'
      };
      const feature = features[envVar] || 'Additional features';
      console.log(`   - ${envVar} (${feature})`);
    });
  }
  
  console.log('\n');
  
  // Set deployment mode flags for runtime use
  process.env.NEXT_PUBLIC_DEPLOYMENT_MODE = missing.length === 0 ? 'full' : 'degraded';
  process.env.NEXT_PUBLIC_FEATURES_AVAILABLE = JSON.stringify({
    database: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    ecommerce: !!process.env.NEXT_PUBLIC_SWELL_STORE_ID,
    caching: !!process.env.UPSTASH_REDIS_REST_URL,
    notifications: !!process.env.VAPID_PUBLIC_KEY,
    monitoring: !!process.env.NEXT_PUBLIC_SENTRY_DSN
  });
}

// Run smart environment validation
validateEnvironmentConfiguration();

const nextConfig: NextConfig = {
  // Re-enable production-grade checking with medical animation system
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
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
