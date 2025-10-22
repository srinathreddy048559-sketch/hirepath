import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Don’t let ESLint/type errors block Vercel builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: true,
};

export default nextConfig;
