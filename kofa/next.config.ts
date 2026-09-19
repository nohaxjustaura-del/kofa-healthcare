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

    KOFA_DIST_SUFFIX extends the same idea to a second DEV server. Two
    `next dev` processes on different ports still share `.next-dev` unless
    told otherwise, and they will interleave writes into the same webpack
    pack files and server manifests. That does not fail loudly: it surfaces
    as "__webpack_require__.C is not a function", a missing
    `server/app/<route>/page.js`, or a 500 on a route that compiles fine,
    all of which look like application bugs and are not. Set the variable to
    anything unique (`KOFA_DIST_SUFFIX=b npm run dev`) to get `.next-dev-b`.
  */
  distDir:
    process.env.NODE_ENV === "production"
      ? ".next"
      : `.next-dev${process.env.KOFA_DIST_SUFFIX ? `-${process.env.KOFA_DIST_SUFFIX}` : ""}`,
};

export default nextConfig;
