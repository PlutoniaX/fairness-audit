import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: resolve(__dirname),
  },
  typescript: {
    // We run tsc separately; skip during build to avoid hanging
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
