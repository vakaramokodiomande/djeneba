import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Fix pour Jest worker error sous Windows avec Next.js 15
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
