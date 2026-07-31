import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/admin2026',
        destination: '/admin',
      },
      {
        source: '/admin2026/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
