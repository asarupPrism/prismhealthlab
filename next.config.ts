import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    return config
  },
};

export default nextConfig;
