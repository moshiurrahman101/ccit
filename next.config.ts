import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude cloudinary from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        util: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
  // Exclude cloudinary from client-side bundle
  serverExternalPackages: ['cloudinary'],
};

export default nextConfig;
