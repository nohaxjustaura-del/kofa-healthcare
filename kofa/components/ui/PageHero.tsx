import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { LineReveal, Reveal } from "@/components/motion/Reveal";

/* ---------------------------------------------------------------------------
   Interior page hero. Shorter than the homepage's, no canvas, just the grid
   substrate and one line of metadata. Consistency where it matters, without
   repeating the homepage's full performance on every route.
--------------------------------------------------------------------------- */

export function PageHero({
  eyebrow,
  lines,
  intro,
  meta,
  aside,
}: {
  eyebrow: string;
  /** Headline, split into the lines you want revealed. */
  lines: ReactNode[];
  intro?: ReactNode;
  /** Small right-hand metadata pairs. */
  meta?: { k: string; v: string }[];
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-[clamp(3.5rem,6vw,6rem)] pt-[clamp(8rem,12vw,12rem)]">
      <div
        aria-hidden
        className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]"
      />

      <Container>
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>

        <div className="mt-8 grid grid-cols-12 gap-y-10">
          <h1 className="type-display col-span-12 max-w-[17ch] text-ink lg:col-span-8">
            <LineReveal lines={lines} />
          </h1>

          {(intro || aside) && (
            <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:self-end">
              <Reveal delay={0.18}>
                {intro && (
                  <>
                    <div className="h-px w-full bg-rule" />
                    <p className="type-body-sm mt-6 max-w-[42ch]">
                      {intro}
                    </p>
                  </>
                )}
                {aside}
              </Reveal>
            </div>
          )}
        </div>

        {meta && meta.length > 0 && (
          <Reveal delay={0.26}>
            <dl className="mt-[clamp(3rem,5vw,4.5rem)] flex flex-wrap items-center gap-x-12 gap-y-3 border-t border-rule pt-6">
              {meta.map((m) => (
                <div key={m.k} className="flex items-baseline gap-2.5">
                  <dt className="type-eyebrow text-ink-mute">{m.k}</dt>
                  <dd className="type-eyebrow text-ink">{m.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
