import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
