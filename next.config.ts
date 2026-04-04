import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      new URL("https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/**"),
    ],
  },
};

export default nextConfig;
