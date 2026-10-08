import type { NextConfig } from "next";
import path from "node:path";

/*
  Files in public/ are served with `max-age=0, must-revalidate` unless told
  otherwise, so every page view re-asked the server about every font, logo
  and film clip it had already downloaded.

    fonts   The official General Sans files never change (the licence
            forbids modifying them), so they are cached for a year.
    media   Images and film clips DO get replaced under the same names, the
            hero film has been re-graded in place several times, so they are
            cached for an hour and then revalidated in the background. A
            reviewer looking for a change made minutes ago is at most one
            reload away from seeing it, while a visitor moving between pages
            stops re-requesting the same pictures.
*/
const MEDIA_CACHE = "public, max-age=3600, stale-while-revalidate=86400";

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site has no reason to be framed by anyone else's page.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.resolve(__dirname),
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      ...["media", "company-logos", "portfolio", "brand", "team"].map((dir) => ({
        source: `/${dir}/:path*`,
        headers: [{ key: "Cache-Control", value: MEDIA_CACHE }],
      })),
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    /*
      EVERY quality the site asks for has to appear here, not just the
      interesting ones. Next 15 only warns about an unlisted value, but
      declaring this array opts into the Next 16 behaviour immediately: from
      then on an unlisted quality is a thrown error, and because it throws
      inside <Image> it takes the whole route down with a 500 rather than
      degrading. Listing only [75, 90] broke /team and every
      /portfolio/[slug] page, which use 88.

        75  next/image's default, used by everything not named below
        88  components/team/TeamGrid.tsx and
            components/portfolio/CompanyVisual.tsx
        90  the three homepage photographs in public/media/home

      Adding a quality anywhere means adding it here in the same commit.
    */
    qualities: [75, 88, 90],
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
