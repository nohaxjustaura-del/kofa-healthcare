import type { Metadata } from "next";
import { site } from "@/data/site";

/**
 * THE ORIGIN THIS DEPLOYMENT IS ACTUALLY SERVED FROM
 * ---------------------------------------------------------------------------
 * Every absolute URL the site emits — og:image, og:url, canonical, the sitemap
 * entries, the sitemap reference in robots.txt — has to point at the host the
 * visitor is really on, or it points somewhere that is not serving this build.
 *
 * `site.url` is the BRAND address (data/site.ts) and is the right answer once
 * the custom domain is attached. It is the wrong answer before that: the first
 * Vercel deployment emitted
 *   og:image = https://www.kofahealthcare.com/opengraph-image?…
 * while the site itself was on kofa-healthcare.vercel.app, so every social card
 * fetched an image from a host that does not serve one, and every canonical
 * pointed at a different site.
 *
 * Resolution order, first match wins:
 *
 *   1. NEXT_PUBLIC_SITE_URL — explicit override. Set this in the Vercel
 *      dashboard the moment the custom domain goes live and nothing else has
 *      to change.
 *   2. VERCEL_PROJECT_PRODUCTION_URL on a production deploy — the project's
 *      canonical production host. Vercel updates this to the custom domain as
 *      soon as one is assigned, so this arrangement corrects itself.
 *   3. VERCEL_URL — the unique per-deployment host, which is what a preview
 *      build should describe itself as rather than claiming to be production.
 *   4. site.url — local development, and the honest fallback anywhere the
 *      platform variables are absent.
 *
 * Read at module scope, which on Vercel means build time for the statically
 * generated routes. That is the correct moment: the HTML is prerendered then,
 * so a value read later could not reach it anyway.
 *
 * Note this is deliberately NOT used for the domain printed on the OG card
 * artwork (app/opengraph-image.tsx). That is branding — it should read
 * "kofahealthcare.com" whatever host happens to serve the image.
 */
function resolveSiteUrl(): string {
  const strip = (u: string) => u.replace(/\/+$/, "");

  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return strip(explicit);

  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${strip(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${strip(process.env.VERCEL_URL)}`;
  }

  return strip(site.url);
}

/** The origin every absolute URL on the site is built from. */
export const siteUrl = resolveSiteUrl();

/**
 * SHARED SOCIAL METADATA
 * ---------------------------------------------------------------------------
 * One place that builds the `openGraph` and `twitter` blocks for every route,
 * so that every shared link renders a complete card.
 *
 * This helper exists because of a Next.js merging rule that is easy to get
 * wrong and silent when you do. Scalar metadata (title, description,
 * alternates) inherits down the segment tree, but `openGraph` and `twitter` do
 * NOT merge into their parent — in mergeMetadata()
 * (next/dist/lib/metadata/resolve-metadata.js) the `openGraph` case is a
 * straight assignment:
 *
 *     target.openGraph = resolveOpenGraph(source.openGraph, ...)
 *
 * So the moment a page declares an `openGraph` object of its own, it REPLACES
 * the root layout's wholesale. That is exactly what used to happen here: each
 * page hand-wrote `openGraph: { title, description, url }` and thereby dropped
 * og:site_name, og:locale and og:type from its own HTML. The built index.html
 * carried six og:* tags; fund.html carried exactly three.
 *
 * The same rule is why the image cannot be left to the app/opengraph-image.tsx
 * file convention on its own. mergeStaticMetadata() attaches the generated
 * image only when the *current* segment's metadata does not already own an
 * `images` key, and it is only ever handed the static files belonging to its
 * own segment. So the root image is attached at the root layout and then
 * discarded again the instant a child page assigns its own openGraph. With ~82
 * URLs in the sitemap and every one of them declaring page-specific social
 * copy, relying on the convention alone would have put an image on the
 * homepage and nowhere else.
 *
 * Hence: every route names the image explicitly, and does so through this one
 * function, so no page has to remember to.
 *
 * If you add a route, do not hand-write `openGraph`. Call pageMetadata().
 */

/**
 * The generated card at app/opengraph-image.tsx. Next serves that file
 * convention at exactly this pathname (normalizeMetadataRoute() maps
 * `/opengraph-image` -> `/opengraph-image/route`, with no `[__metadata_id__]`
 * segment because the module exports no generateImageMetadata).
 *
 * The `?v=` is a manual cache-buster and is the one thing here that needs
 * maintaining. Next appends a content hash to the URL it emits for a
 * file-convention image, but that hash is computed inside the webpack loader
 * and cannot be read from userland, so a hand-written reference like this one
 * has no automatic equivalent. Facebook, LinkedIn and Slack cache OG images
 * against the URL for days-to-forever; if you change the artwork in
 * app/opengraph-image.tsx and do not bump this number, everyone who has ever
 * shared a KOFA link keeps getting the old card.
 */
const OG_IMAGE_URL = "/opengraph-image?v=1";

/** 1200x630 is the size Twitter/X, LinkedIn and Slack all crop cleanly to. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

export const OG_IMAGE_ALT = `${site.name} — ${site.tagline}`;

/**
 * KOFA's hexagonal mark, copied verbatim from LogoGlyph in
 * components/ui/LogoMark.tsx (viewBox "0 0 1000 866.21").
 *
 * It is duplicated rather than imported because LogoMark.tsx is a React
 * component that pulls in next/link, and the two metadata image routes render
 * through satori, which wants nothing but the geometry. If the artwork is ever
 * revised, both copies have to move together or the favicon quietly stops
 * matching the logo in the header.
 *
 * `fillRule="evenodd"` is not optional: the path is three subpaths and the
 * counters inside the mark are holes, not shapes. Drop the rule and the glyph
 * renders as a solid blob.
 */
export const KOFA_GLYPH_PATH =
  "M550.6 0.0L751.3 0.0L1000.0 430.5L999.1 437.4L891.1 623.5L691.3 623.5L811.3 416.0L550.6 416.0L450.3 243.6L690.4 242.7ZM250.4 0.0L470.8 0.0L570.3 173.2L331.0 172.4L331.9 176.7L460.5 399.7L360.2 572.0L240.1 364.5L108.1 594.3L99.5 606.3L0.0 433.1ZM490.6 485.4L690.4 485.4L571.2 693.0L850.8 693.0L751.3 866.2L249.6 866.2L140.7 677.5L140.7 674.1L237.6 506.0L241.0 502.6L358.5 709.3L361.1 710.1Z";

export const KOFA_GLYPH_VIEWBOX = "0 0 1000 866.21";

/** The brand tokens from app/globals.css, restated for satori, which has no
 *  stylesheet and cannot read a CSS custom property. Keep in sync with the
 *  @theme block there. */
export const BRAND = {
  ivory: "#f7f8f4",
  ink: "#121a18",
  inkSoft: "#59635f",
  teal: "#176d67",
  /** The mark's own red. Sampled from public/brand/kofa-mark.png. */
  kofaRed: "#d61319",
  rule: "rgba(18, 26, 24, 0.12)",
};

type SocialType = "website" | "article" | "profile";

type SocialInput = {
  /** og:title and twitter:title. Not run through the <title> template. */
  title: string;
  /** og:description and twitter:description. */
  description: string;
  /** Route path, e.g. "/fund". Resolved against metadataBase for og:url. */
  path: string;
  type?: SocialType;
  /** article:published_time. Only meaningful when type is "article". */
  publishedTime?: string;
};

/**
 * The complete social block: the identity fields that used to be lost on every
 * page but the homepage (site_name, locale, type), the card image, and the
 * per-page title/description/url.
 *
 * Exported separately from pageMetadata() because the root layout's `title` is
 * a template object rather than a string and so cannot go through the page
 * helper.
 */
export function socialMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
}: SocialInput): Pick<Metadata, "openGraph" | "twitter"> {
  const images = [
    {
      url: OG_IMAGE_URL,
      width: OG_IMAGE_SIZE.width,
      height: OG_IMAGE_SIZE.height,
      alt: OG_IMAGE_ALT,
    },
  ];

  const shared = {
    siteName: site.name,
    locale: "en_US",
    title,
    description,
    url: path,
    images,
  };

  const openGraph: NonNullable<Metadata["openGraph"]> =
    type === "article"
      ? {
          ...shared,
          type: "article",
          // Spread rather than assigned: an explicit `publishedTime: undefined`
          // is still an own key, and Next walks own keys when it resolves.
          ...(publishedTime ? { publishedTime } : {}),
        }
      : type === "profile"
        ? { ...shared, type: "profile" }
        : { ...shared, type: "website" };

  return {
    openGraph,
    twitter: {
      // The root layout has declared summary_large_image since day one. It was
      // promising a 1200x630 card that no route actually supplied, so every
      // share rendered a blank frame; this is the other half of that promise.
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

type PageMetadataInput = {
  /** <title>, before the root layout's "%s · KOFA Healthcare" template. */
  title: string;
  /** <meta name="description">. */
  description: string;
  /** Route path, e.g. "/fund". Used for both the canonical and og:url. */
  path: string;
  /**
   * og:title, when it should differ from `${title} · ${site.name}`. Open Graph
   * has no equivalent of the title template — Next only applies one if the
   * PARENT declared `openGraph.title` as a template object — so the suffix has
   * to be produced here, and the two dynamic routes that want a different
   * shape pass their own.
   */
  socialTitle?: string;
  /** og:description, when the card wants shorter copy than the meta tag. */
  socialDescription?: string;
  type?: SocialType;
  publishedTime?: string;
  robots?: Metadata["robots"];
};

/** The whole metadata export for a leaf page. */
export function pageMetadata({
  title,
  description,
  path,
  socialTitle,
  socialDescription,
  type,
  publishedTime,
  robots,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...socialMetadata({
      title: socialTitle ?? `${title} · ${site.name}`,
      description: socialDescription ?? description,
      path,
      type,
      publishedTime,
    }),
    // Conditional, never `robots: undefined`. mergeMetadata() iterates the own
    // keys of whatever a segment exports, so a present-but-undefined `robots`
    // would resolve to null and wipe the root layout's index/follow directive
    // for that route.
    ...(robots ? { robots } : {}),
  };
}
