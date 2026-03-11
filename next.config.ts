import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/reads',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/cheats',
        destination: '/tools',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
