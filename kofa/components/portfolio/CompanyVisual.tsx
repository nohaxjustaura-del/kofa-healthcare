import type { ReactNode } from "react";
import Image from "next/image";
import type { CompanyMedia, HealthcareCategory } from "@/data/portfolio";
import { PortfolioVideo } from "./PortfolioVideo";

/* ===========================================================================
   COMPANY VISUAL
   ---------------------------------------------------------------------------
   The one place every company's picture is decided. In priority order:

     1  a real company `media` entry, a device photo, a product render, a
        platform screen or a short muted clip, taken from the company's own
        official site (see data/portfolio.ts and public/media/CREDITS.md);
     2  a legacy `featuredImage` path, kept working for any older content;
     3  the generative "living network" field, seeded from the slug, so a
        company with no approved asset yet still reads as one of the set
        rather than as a hole.

   COVER vs CONTAIN. Photography and full-frame renders are `cover` and fill
   the tile. Product shots that arrive on their own transparent or white ground
   are `contain`, inset on a soft light surface so they are never cropped
   through the device. The `fit` field in the data decides; this component owns
   how each one is framed.

   STILL vs MOVING. A video always has a poster. Cards pass `playable={false}`
   and get the poster as a plain image, so a grid never loads video; the detail
   hero and the homepage story pass `playable` and mount PortfolioVideo, which
   lazy-loads, respects motion-off and falls back to the same poster.
=========================================================================== */

/** The soft light ground a contained product shot sits on. Matches the
 *  generative field's palette so the two never look like different systems. */
const LIGHT_GROUND =
  "bg-[linear-gradient(140deg,#ffffff_0%,#edf6f7_55%,#e4f0f1_100%)]";

/** mulberry32, deterministic, so server and client render identically. */
function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Each category leans the geometry a different way: same system, own dialect. */
const CATEGORY_TRAIT: Record<
  HealthcareCategory,
  { nodes: number; link: number; cells: number; drift: number }
> = {
  Cardiovascular: { nodes: 22, link: 34, cells: 2, drift: 0.55 },
  "Women's Health": { nodes: 17, link: 40, cells: 3, drift: 0.75 },
  Diagnostics: { nodes: 28, link: 26, cells: 1, drift: 0.35 },
  Orthopedics: { nodes: 14, link: 46, cells: 2, drift: 0.3 },
  "Digital Health": { nodes: 24, link: 30, cells: 1, drift: 0.62 },
};

export function CompanyVisual({
  slug,
  category,
  media,
  featuredImage,
  name,
  className = "",
  priority = false,
  reactive = true,
  playable = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw",
}: {
  slug: string;
  category: HealthcareCategory;
  media?: CompanyMedia;
  featuredImage?: string;
  name: string;
  className?: string;
  priority?: boolean;
  /** Dim at rest and resolve on hover of the enclosing card. Set false where
   *  the visual is the subject rather than a preview (detail-page hero). */
  reactive?: boolean;
  /** Mount the real video where a clip exists. Cards leave this false and show
   *  the poster; the detail hero and homepage story set it true. */
  playable?: boolean;
  sizes?: string;
}) {
  // 1. a real company asset.
  if (media) {
    const contain = media.fit === "contain";
    const fitClass = contain ? "object-contain" : "object-cover";
    const groundClass = contain ? media.ground ?? LIGHT_GROUND : "";
    const position = media.position ?? "center";

    // A contained product shot is inset so it never touches the tile edges;
    // a cover asset fills the frame.
    const frame = (child: ReactNode) =>
      contain ? (
        <div className={`absolute inset-0 ${groundClass} ${className}`}>
          <div className="absolute inset-[7%]">{child}</div>
        </div>
      ) : (
        <div className={`absolute inset-0 ${className}`}>{child}</div>
      );

    if (media.kind === "video" && media.poster) {
      // Cards: poster only, no video ever fetched.
      if (!playable) {
        return frame(
          <Image
            src={media.poster}
            alt={media.alt}
            fill
            priority={priority}
            sizes={sizes}
            className={fitClass}
            style={{ objectPosition: position }}
          />,
        );
      }
      // Subject surfaces: the real clip, with the poster as its own fallback.
      return frame(
        <PortfolioVideo
          src={media.src}
          poster={media.poster}
          alt={media.alt}
          fit={media.fit ?? "cover"}
          position={position}
        />,
      );
    }

    return frame(
      <Image
        src={media.src}
        alt={media.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={fitClass}
        style={{ objectPosition: position }}
      />,
    );
  }

  // 2. legacy featuredImage.
  if (featuredImage) {
    return (
      <Image
        src={featuredImage}
        alt={`${name} company imagery`}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${className}`}
      />
    );
  }

  // 3. generative fallback.
  const trait = CATEGORY_TRAIT[category];
  const r = rng(hash(slug));
  const W = 100;
  const H = 100;

  const pts = Array.from({ length: trait.nodes }, () => ({
    x: r() * W,
    y: r() * H,
    s: 0.4 + r() * 0.9,
  }));

  const cells = Array.from({ length: trait.cells }, () => ({
    x: 12 + r() * (W - 24),
    y: 12 + r() * (H - 24),
    rad: 16 + r() * 26 * (1 + trait.drift),
  }));

  const links: [number, number, number][] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < trait.link) links.push([i, j, 1 - d / trait.link]);
    }
  }

  const gid = `cv-${slug}`;

  return (
    <div
      className={`absolute inset-0 bg-[linear-gradient(140deg,#ffffff_0%,#edf6f7_52%,#e4f0f1_100%)] ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        fill="none"
      >
        <defs>
          <radialGradient id={`${gid}-cell`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5bb9bd" stopOpacity="0.16" />
            <stop offset="70%" stopColor="#006a70" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#006a70" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Cells bloom slightly; the connections carry most of the change.
            Hovering a card should read as the network waking up, not as a
            brightness slider, so links move furthest (0.62 → 1) and the
            cell wash least. Named-group variants cover both the portfolio
            card and the news feature; on pages with no group wrapper the
            field simply rests at its default weight. */}
        <g
          className={
            reactive
              ? "opacity-[0.86] transition-opacity duration-[800ms] ease-kofa group-hover/card:opacity-100 group-hover/news:opacity-100"
              : undefined
          }
        >
          {cells.map((c, i) => (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={c.rad} fill={`url(#${gid}-cell)`} />
              <circle
                cx={c.x}
                cy={c.y}
                r={c.rad * 0.62}
                stroke="#006a70"
                strokeOpacity="0.12"
                strokeWidth="0.28"
              />
            </g>
          ))}
        </g>

        <g
          className={
            reactive
              ? "opacity-[0.62] transition-opacity duration-[800ms] ease-kofa group-hover/card:opacity-100 group-hover/news:opacity-100"
              : undefined
          }
        >
          {links.map(([i, j, k], n) => (
            <line
              key={n}
              x1={pts[i].x}
              y1={pts[i].y}
              x2={pts[j].x}
              y2={pts[j].y}
              stroke="#006a70"
              strokeOpacity={(k * 0.3).toFixed(3)}
              strokeWidth="0.22"
            />
          ))}
        </g>

        <g
          className={
            reactive
              ? "opacity-[0.8] transition-opacity duration-[800ms] ease-kofa group-hover/card:opacity-100 group-hover/news:opacity-100"
              : undefined
          }
        >
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.s * 0.62}
              fill="#006a70"
              fillOpacity="0.34"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
