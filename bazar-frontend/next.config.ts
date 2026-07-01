import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: 'localhost',
        port: '5050',
        pathname: '/uploads/**',
      },
      {
        protocol: "http",
        hostname: '127.0.0.1',
        port: '5050',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.nepalyp.com',
      },
      {
        protocol: 'https',
        hostname: 'nepalyp.com',
      }
    ]
  }
};

export default nextConfig;
