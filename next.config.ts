import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // ... other Next.js configuration settings
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  // Configure the server port for standalone builds
  serverRuntimeConfig: {
    port: process.env.PORT || 3004,
  },
  // Configure uploaded file size limit for server actions
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // Set your desired limit (e.g., '2mb', '10mb', '1gb')
    },
  },
};

export default nextConfig;
