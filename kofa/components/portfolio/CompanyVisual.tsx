import Image from "next/image";
import type { HealthcareCategory } from "@/data/portfolio";

/* ===========================================================================
   COMPANY VISUAL
   ---------------------------------------------------------------------------
   KOFA has supplied logos, not photography. Rather than dress the portfolio in
   stock images of doctors, explicitly ruled out by the brief, each company
   gets an abstract field generated deterministically from its slug: the same
   living-network motif as the hero, seeded so every company reads as its own
   specimen while the set stays visibly one system.

   The moment a real `featuredImage` is supplied through the CMS it takes over
   and nothing else changes.
=========================================================================== */

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
  featuredImage,
  name,
  className = "",
  priority = false,
  reactive = true,
}: {
  slug: string;
  category: HealthcareCategory;
  featuredImage?: string;
  name: string;
  className?: string;
  priority?: boolean;
  /** Dim at rest and resolve on hover of the enclosing card. Set false where
   *  the visual is the subject rather than a preview (detail-page hero). */
  reactive?: boolean;
}) {
  if (featuredImage) {
    return (
      <Image
        src={featuredImage}
        alt={`${name} company imagery`}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
        className={`object-cover ${className}`}
      />
    );
  }

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
      className={`absolute inset-0 bg-[linear-gradient(140deg,#F4F7F4_0%,#EEF3EF_52%,#E8F0EB_100%)] ${className}`}
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
            <stop offset="0%" stopColor="#4DA9A0" stopOpacity="0.16" />
            <stop offset="70%" stopColor="#176D67" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#176D67" stopOpacity="0" />
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
                stroke="#176D67"
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
              stroke="#176D67"
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
              fill="#176D67"
              fillOpacity="0.34"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
