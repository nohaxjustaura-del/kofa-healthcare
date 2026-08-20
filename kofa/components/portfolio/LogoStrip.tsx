import Image from "next/image";
import Link from "next/link";
import { portfolioSorted } from "@/data/portfolio";
import { Container, Eyebrow } from "@/components/ui/primitives";

/* ---------------------------------------------------------------------------
   A very slow marquee, 78 seconds for a full pass. Logos sit muted and
   monochrome until hovered, then return to their own colour.

   The track is duplicated once and translated by exactly -50%, which is what
   makes the loop seamless. The duplicate is aria-hidden so screen readers meet
   the list once. Under prefers-reduced-motion the animation is cancelled in
   CSS and the strip becomes an ordinary horizontally-scrollable row.
--------------------------------------------------------------------------- */

function Track({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center"
      aria-hidden={duplicate || undefined}
    >
      {portfolioSorted.map((c) => {
        const media = (
          <Image
            src={c.logo}
            alt={duplicate ? "" : `${c.name} logo`}
            fill
            sizes="136px"
            className="logo-mono object-contain"
          />
        );

        return (
          <li key={c.slug} className="shrink-0 px-[clamp(1.75rem,3.5vw,3.5rem)]">
            {/* The second track exists only to make the loop seamless. It is
                rendered as an inert div rather than a tabindex={-1} anchor:
                aria-hidden must not contain focusable content at all, and a
                duplicate link is nothing for anyone to reach anyway. */}
            {duplicate ? (
              <div className="group relative block h-9 w-[136px]">{media}</div>
            ) : (
              <Link
                href={`/portfolio/${c.slug}`}
                className="group relative block h-9 w-[136px] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-teal"
              >
                {media}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function LogoStrip() {
  return (
    <section
      aria-label="Portfolio companies"
      className="border-y border-rule bg-ivory py-[clamp(3rem,5vw,4.5rem)]"
    >
      <Container>
        {/* The label alone. It used to trail a full-width hairline, which sat
            a few pixels under the section's own top border and read as a
            second, broken rule rather than as a flourish. */}
        <Eyebrow tone="mute">The portfolio</Eyebrow>
      </Container>

      <div className="marquee-host relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)]">
        <div className="animate-marquee flex w-max motion-reduce:animate-none">
          <Track />
          <Track duplicate />
        </div>
      </div>
    </section>
  );
}
