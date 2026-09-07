import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 blocks /_next dev assets from alternate loopback hosts by default.
  // Without this, http://127.0.2.2:3000 loads HTML but JavaScript never runs.
  allowedDevOrigins: ["127.0.2.2", "127.0.0.1", "localhost"],
  experimental: {
    serverActions: {
      allowedOrigins: ["127.0.2.2:3000", "127.0.0.1:3000", "localhost:3000"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
