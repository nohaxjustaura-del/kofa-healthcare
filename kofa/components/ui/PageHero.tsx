import type { ReactNode } from "react";
import { Container } from "@/components/ui/primitives";
import { FieldPlate } from "@/components/visuals/plates";

/* ---------------------------------------------------------------------------
   PAGE HEADER
   ---------------------------------------------------------------------------
   The teal band that opens About, Our Approach, Focus Areas, Portfolio, Team,
   News and Contact. One component, so those seven pages cannot drift apart.

   The backdrop used to be three hand-placed polylines that read as a stray
   chart. It is now the shared technical field from components/visuals, the
   same drawing language as the homepage plates, held at low contrast so it
   stays furniture and never competes with the headline.

   The white curve at the foot is the site's one soft gesture, borrowed from
   the reference layout. It is two overlapping ellipses rather than an image,
   so it costs nothing and scales cleanly.
--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
   GROUND COLOUR: teal-deep, not teal
   ---------------------------------------------------------------------------
   This band was --color-teal, #008e95. White text on it measures 3.96:1,
   which clears WCAG AA for the headline (large text, needs 3:1) and fails it
   for everything else on the band: the 11px eyebrow, the 17px intro and the
   14px metadata row, all of which need 4.5:1. Seven pages, every one of them
   failing on the first thing a reader sees.

   --color-teal-deep, #006a70, is an existing token and takes white to
   6.37:1, so every size on the band clears AA with room, including the
   eyebrow. It also happens to be the better colour here: the brighter teal
   read as a product marketing banner, and this is a fund.

   The measured ratios on #006a70, computed rather than eyeballed:
     white          6.37:1
     white/90       5.49:1   intro
     white/85       5.07:1   eyebrow, metadata keys
   The opacities below are chosen against those numbers. Lowering any of
   them, or putting the band back to #008e95, breaks AA.
--------------------------------------------------------------------------- */

export function PageHero({
  eyebrow,
  lines,
  intro,
  meta,
  aside,
}: {
  eyebrow: string;
  lines: ReactNode[];
  intro?: ReactNode;
  meta?: { k: string; v: string }[];
  aside?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-teal-deep pb-20 pt-[152px] text-white sm:pb-24 sm:pt-[168px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[62%] text-white opacity-[0.38] lg:w-[48%]"
      >
        <FieldPlate className="h-full w-full" />
      </div>

      <Container className="relative">
        <p className="type-eyebrow text-white/85">{eyebrow}</p>

        <div className="mt-7 grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.75fr)] lg:items-end">
          <h1 className="max-w-[19ch] text-balance text-[clamp(2.5rem,4.1vw,3.4rem)] font-normal leading-[1.08] tracking-[-0.032em]">
            {lines.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </h1>

          {(intro || aside) && (
            <div className="border-l border-white/45 pl-6 text-[1.0625rem] leading-7 text-white/90">
              {intro}
              {aside}
            </div>
          )}
        </div>

        {meta && meta.length > 0 && (
          <dl className="mt-11 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/30 pt-5 text-sm text-white/90">
            {meta.map((item) => (
              <div key={item.k}>
                <dt className="inline text-white/85">{item.k}: </dt>
                <dd className="inline font-medium">{item.v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Container>

      {/* The curved foot. Both ellipses are WIDER than the viewport and
          centred on it: left-[-25%] w-[150%] puts their vertical extremes
          off-screen, so what shows is one continuous shallow arc.

          The previous pair spanned -5% to 73% and 36% to 106%, which meant
          the white fill simply stopped at 73% and the teal band went square
          from there to the right edge. On a wide screen that read as a step
          in the curve, and it was the first thing the eye caught on every
          interior page. */}
      <div
        aria-hidden
        className="absolute -bottom-14 left-[-10%] h-28 w-[120%] rounded-[50%] bg-white"
      />
      <div
        aria-hidden
        className="absolute -bottom-8 left-[-8%] h-24 w-[116%] rounded-[50%] border-t border-white/55"
      />
    </section>
  );
}
