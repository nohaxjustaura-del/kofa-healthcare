import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  /*
    Dev and production builds get separate output directories.

    `next dev` and `next start` both write to `.next` by default, so running a
    dev server while a production build is being served from the same checkout
    makes them clobber each other's manifests, which surfaces as an EINVAL on
    `_buildManifest.js` at dev startup. Splitting the two costs nothing and
    lets a preview server and a production server coexist.
  */
  distDir: process.env.NODE_ENV === "production" ? ".next" : ".next-dev",
};

export default nextConfig;
