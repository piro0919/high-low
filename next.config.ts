import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    typedEnv: true,
    // typedRoutes: true,
    useLightningcss: true,
  },
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
  reactStrictMode: false,
};

export default nextConfig;
