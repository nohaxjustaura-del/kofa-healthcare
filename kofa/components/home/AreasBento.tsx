"use client";

import { BentoCard, BentoGrid } from "@/components/ui/bento";
import { RiseGroup, RiseItem } from "@/components/motion/Rise";
import { investmentAreas } from "@/data/site";
import { categoryCount, type HealthcareCategory } from "@/data/portfolio";

/* ===========================================================================
   INVESTMENT AREAS, AS A BENTO
   ---------------------------------------------------------------------------
   The six areas, sized by how much KOFA actually publishes about each. The
   four areas named verbatim on kofahealthcare.com get the wide cards; the two
   the portfolio implies rather than states get the narrow ones. The layout is
   therefore an argument about the content, which is the only thing that makes
   a mixed-size grid better than a uniform one.

   THE ARTWORK IS THE ONE THAT WAS ALREADY HERE. Each card's field is that
   area's node cluster, previously drawn one-at-a-time in FundIntro's sticky
   panel and only ever visible for whichever row the pointer happened to be
   on. Six cards means all six clusters are on screen at once, at a size where
   the differences between them read: women's health is a broad spread,
   emerging technologies is three nodes in a corner. Same data, same motif,
   considerably more of it doing work.

   NOTHING HERE IS INVENTED. Titles and notes come from data/site.ts, counts
   from the published portfolio. An area with no published companies shows no
   count rather than a zero, because a zero would be a claim about KOFA's
   activity that its own site does not make.
=========================================================================== */

/** Node clusters, one per area, in the order of `investmentAreas`. */
const CLUSTERS: { x: number; y: number; r: number }[][] = [
  // Women's Health
  [
    { x: 26, y: 32, r: 3.2 }, { x: 44, y: 22, r: 2.2 }, { x: 38, y: 48, r: 2.6 },
    { x: 18, y: 54, r: 1.8 }, { x: 55, y: 40, r: 2 },
  ],
  // Orthopedics
  [
    { x: 62, y: 26, r: 2.8 }, { x: 76, y: 38, r: 2.2 }, { x: 68, y: 52, r: 3 },
    { x: 84, y: 24, r: 1.8 },
  ],
  // Diagnostics
  [
    { x: 30, y: 68, r: 2.6 }, { x: 48, y: 74, r: 3.1 }, { x: 62, y: 66, r: 2.2 },
    { x: 20, y: 80, r: 1.9 }, { x: 74, y: 78, r: 2.4 },
  ],
  // Cardiovascular
  [
    { x: 50, y: 50, r: 3.4 }, { x: 36, y: 40, r: 2.4 }, { x: 64, y: 44, r: 2.6 },
    { x: 46, y: 64, r: 2.2 }, { x: 58, y: 30, r: 2 },
  ],
  // Digital Health
  [
    { x: 82, y: 60, r: 2.6 }, { x: 70, y: 72, r: 2.2 }, { x: 88, y: 76, r: 2.9 },
    { x: 76, y: 50, r: 1.8 },
  ],
  // Emerging Technologies
  [
    { x: 14, y: 20, r: 2.2 }, { x: 24, y: 12, r: 1.7 }, { x: 10, y: 40, r: 2.5 },
  ],
];

/**
 * One area's cluster, centred and scaled up to fill the card's well. The
 * source coordinates were authored for a full square panel, so they are
 * re-centred on their own bounding box here rather than re-typed: a cluster
 * that lived in the bottom-left corner of the old panel should sit in the
 * middle of its own card, not in the bottom-left of it.
 *
 * `group-hover` rather than a variant: this is a stroke-opacity change on ~20
 * SVG nodes, and CSS transitions on presentation attributes composite without
 * involving the animation library at all.
 */
function AreaField({ index }: { index: number }) {
  const cluster = CLUSTERS[index] ?? [];
  if (!cluster.length) return null;

  const xs = cluster.map((p) => p.x);
  const ys = cluster.map((p) => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  // Re-centre on 50,50 and open the cluster out; 1.55 fills the well without
  // pushing the outermost nodes past the edge for any of the six.
  const pts = cluster.map((p) => ({
    x: 50 + (p.x - cx) * 1.55,
    y: 50 + (p.y - cy) * 1.55,
    r: p.r,
  }));

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      {pts.flatMap((a, i) =>
        pts.slice(i + 1).map((b, j) => (
          <line
            key={`${i}-${j}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#176D67"
            strokeWidth="0.25"
            strokeOpacity={0.16}
            className="transition-[stroke-opacity] duration-[600ms] ease-kofa group-hover:[stroke-opacity:0.4]"
          />
        )),
      )}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r * 0.55}
          fill="#176D67"
          fillOpacity={0.34}
          className="transition-[fill-opacity] duration-[600ms] ease-kofa group-hover:[fill-opacity:0.68]"
        />
      ))}
    </svg>
  );
}

/* Spans on the 6-column track, plus the direction each card leans in from.
   Paired cards lean toward each other so every row closes on its own centre
   line, which is the rule set out at the top of components/motion/Rise.tsx. */
const LAYOUT = [
  { span: "lg:col-span-4", from: "left" },
  { span: "lg:col-span-2", from: "right" },
  { span: "lg:col-span-2", from: "left" },
  { span: "lg:col-span-4", from: "right" },
  { span: "lg:col-span-3", from: "left" },
  { span: "lg:col-span-3", from: "right" },
] as const;

export function AreasBento() {
  return (
    <RiseGroup amount={0.1}>
      <BentoGrid>
        {investmentAreas.map((area, i) => {
          const l = LAYOUT[i] ?? LAYOUT[LAYOUT.length - 1];
          const count = categoryCount(area.title as HealthcareCategory);

          return (
            <RiseItem
              key={area.slug}
              from={l.from}
              // The span lives on the RiseItem because it is the grid child.
              // `flex` so the card can stretch to the row's height, which is
              // what keeps the hairline dividers continuous.
              className={`flex ${l.span}`}
            >
              <BentoCard
                className="flex-1"
                tone={i === 3 ? "sage" : "light"}
                eyebrow={String(i + 1).padStart(2, "0")}
                title={area.title}
                description={area.note}
                graphic={<AreaField index={i} />}
                footer={
                  count > 0 ? (
                    <span className="type-eyebrow tabular-nums text-ink-mute">
                      {count} {count === 1 ? "company" : "companies"}
                    </span>
                  ) : null
                }
              />
            </RiseItem>
          );
        })}
      </BentoGrid>
    </RiseGroup>
  );
}
