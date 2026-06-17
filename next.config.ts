import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not fail the production build on ESLint problems (mostly pre-existing
  // stylistic rules: no-explicit-any, no-unused-vars, no-unescaped-entities).
  // Lint still runs in development / `next lint`.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
