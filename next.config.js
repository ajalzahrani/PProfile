/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable browser source maps to prevent .map file 404 errors
  productionBrowserSourceMaps: false,
  webpack: (config) => {
    // Add the rules for pdf.js worker
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: "asset/resource",
      generator: {
        filename: "static/worker/[hash][ext][query]",
      },
    });

    return config;
  },
};

module.exports = nextConfig;
