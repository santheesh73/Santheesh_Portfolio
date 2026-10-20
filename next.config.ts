import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: process.env.SOURCEMAPS === "1",
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  webpack(config) {
    config.module.rules.push({ test: /\.glsl$/, type: "asset/source" });
    return config;
  },
  experimental: {
    optimizePackageImports: ["gsap"],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
