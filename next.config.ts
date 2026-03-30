import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/**"),
    ],
  },
};

export default nextConfig;
