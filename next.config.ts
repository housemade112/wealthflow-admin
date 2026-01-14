import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ============================================
  // CODE PROTECTION (Production)
  // ============================================

  // Disable source maps in production (prevents reverse engineering)
  productionBrowserSourceMaps: false,

  // SWC compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Minification (already on by default, but explicit)
  swcMinify: true,

  // Disable React DevTools in production
  reactStrictMode: true,

  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
