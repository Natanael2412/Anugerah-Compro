import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Per PRD: Vercel's built-in Image Optimization must be disabled.
  // All image processing is handled manually via our own API route using sharp.
  images: {
    unoptimized: true,
  },

  // In Next.js 16, this moved from experimental to a top-level key
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
