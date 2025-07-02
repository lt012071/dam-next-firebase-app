import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: "export",
  images: {
    domains: ["lh3.googleusercontent.com"],
    unoptimized: true,
  },
};

export default nextConfig;
