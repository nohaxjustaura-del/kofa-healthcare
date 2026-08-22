import Image from "next/image";
import Link from "next/link";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { TextLink } from "@/components/ui/Button";
import { AnimatedDivider, Reveal } from "@/components/motion/Reveal";
import {
  portfolio,
  portfolioSorted,
  type PortfolioCompany,
} from "@/data/portfolio";

/* ===========================================================================
   PARTNER MARQUEE
   ---------------------------------------------------------------------------
   The portfolio as a continuous run of plates, after the partners strip on
   biofarma.com.ar: a white card per company, a small verified mark and the
   name in the top corner, the logo given the middle of the card, the whole row
   drifting sideways forever.

   It replaces two things that used to sit back to back on the homepage, a thin
   logo strip and a six-card editorial grid, and it does the job of both. The
   grid was the better piece of design in isolation and the worse one in
   position: it showed six of sixteen companies at the cost of roughly two
   screens, immediately after a strip that had just shown all sixteen as
   thumbnails. One device, every company, a fifth of the height.

   WHY THE CARD CARRIES MORE THAN A LOGO
   The reference strip repeats the brand name beside the logo, which on that
   site is the whole content of a card. A logo is a picture of a name, so a
   caption that only repeats the name is decoration. The name is here because
   these logos are not household marks and several are wordless, but the card
   also gets `focus`, the one-line clinical problem the company works on, from
   the same CMS field the portfolio index uses. That is the difference between
   a wall of client logos and a portfolio: the reader leaves knowing what the
   companies DO.

   MOTION
   The track is rendered twice and translated by exactly -50%, which is what
   makes the loop seamless; the duplicate is `aria-hidden` and holds no
   focusable content, so assistive technology and the keyboard meet the list
   once. Hovering or focusing anywhere in the strip pauses it, so nothing is
   ever chased. With motion off in the footer the animation is cancelled in CSS
   and the row becomes an ordinary horizontally scrollable shelf. See the
   `.animate-marquee` rules in app/globals.css.
=========================================================================== */

/** Duration of one full pass. Slower than it sounds: at sixteen cards this is
 *  a little under three seconds per card, which reads as drift rather than as
 *  a carousel. Passed to CSS so the two marquee speeds on the site stay
 *  declared at their call sites rather than buried in the stylesheet. */
const PASS_SECONDS = 68;

/* ---------------------------------------------------------------------------
   The verified mark. A ring with a check, drawn rather than imported: at 14px
   an icon font or an SVG sprite would both cost a request to render something
   that is nine path commands.
--------------------------------------------------------------------------- */
function VerifiedMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-[15px] w-[15px] shrink-0 text-teal transition-colors duration-500 ease-kofa"
    >
      <circle cx="8" cy="8" r="7.25" fill="currentColor" />
      <path
        d="M4.9 8.15 6.95 10.2 11.1 6.05"
        fill="none"
        stroke="var(--color-white)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   One plate.

   `inert` renders the duplicate track: same pixels, no link, no alt text, no
   tab stop. An aria-hidden subtree must not contain focusable content at all,
   and a second copy of the same link is nothing for anyone to reach.
--------------------------------------------------------------------------- */
function Plate({
  company,
  inert = false,
}: {
  company: PortfolioCompany;
  inert?: boolean;
}) {
  const body = (
    <>
      {/* --- corner: mark + name --- */}
      <div className="flex items-center gap-2.5">
        <VerifiedMark />
        <span className="type-eyebrow truncate text-ink-mute transition-colors duration-500 ease-kofa group-hover/plate:text-ink group-focus-visible/plate:text-ink">
          {company.name}
        </span>
      </div>

      {/* --- the logo, given the middle of the card ---
          Logos arrive as mixed JPEG/PNG/WebP on white grounds, so they are
          multiplied against the card rather than placed on it: the plate is
          white, the logo's own white disappears, and sixteen files from
          sixteen design systems sit on one surface without haloes. */}
      <div className="relative my-auto h-[clamp(2.75rem,4vw,3.5rem)] w-full">
        <Image
          src={company.logo}
          alt={inert ? "" : `${company.name} logo`}
          fill
          sizes="(max-width: 640px) 190px, 240px"
          className="logo-plate object-contain transition-transform duration-[700ms] ease-kofa group-hover/plate:scale-[1.04]"
        />
      </div>

      {/* --- the clinical problem, in one line --- */}
      <p className="type-meta line-clamp-2 text-ink-mute">{company.focus}</p>
    </>
  );

  const shell =
    "group/plate flex h-[clamp(14rem,19vw,16.5rem)] w-[clamp(12.5rem,17vw,15.5rem)] flex-col justify-between rounded-[14px] border border-rule bg-white p-[clamp(1.1rem,1.5vw,1.4rem)] transition-[transform,border-color,background-color] duration-[650ms] ease-kofa";

  if (inert) return <div className={shell}>{body}</div>;

  return (
    <Link
      href={`/portfolio/${company.slug}`}
      className={`${shell} hover:-translate-y-1.5 hover:border-rule-teal focus-visible:-translate-y-1.5 focus-visible:border-rule-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal`}
    >
      {body}
    </Link>
  );
}

/** One pass of every company. Rendered twice; see the note on MOTION above. */
function Track({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      /* marquee-dupe is not decoration. With motion off the strip stops being
         a marquee, and a second copy of the list would just be the same
         sixteen companies printed twice; app/globals.css hides it there. */
      className={`flex shrink-0 items-stretch gap-[clamp(0.75rem,1.2vw,1.25rem)] pr-[clamp(0.75rem,1.2vw,1.25rem)] ${
        duplicate ? "marquee-dupe" : ""
      }`}
      aria-hidden={duplicate || undefined}
    >
      {portfolioSorted.map((company) => (
        <li key={company.slug} className="shrink-0">
          <Plate company={company} inert={duplicate} />
        </li>
      ))}
    </ul>
  );
}

export function PartnerMarquee() {
  return (
    <Section
      className="border-t border-rule bg-ivory-deep"
      id="portfolio-preview"
      aria-labelledby="portfolio-marquee-heading"
    >
      <Container>
        <div className="grid grid-cols-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <Eyebrow index="01">The portfolio</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              {/* THE THIRD TELLING IS GONE.
                  Read in order, the first three screens used to be: the hero's
                  "Investing in innovation that moves healthcare forward",
                  FundIntro's "We back healthcare innovators solving difficult
                  clinical problems", and this heading's "Backing the next
                  generation of healthcare innovation" — three consecutive
                  display-scale headlines making one claim, in the same words.
                  The bento that used to sit between the second and third hid
                  the adjacency; removing it exposed it.

                  A section heading should say what THIS section uniquely is.
                  This one's argument is completeness — every company, not a
                  selection — so it says that instead of re-asserting the
                  thesis two screens after the last time. */}
              <SectionHeading
                id="portfolio-marquee-heading"
                className="mt-7 max-w-[16ch]"
              >
                Every company we have backed.
              </SectionHeading>
            </Reveal>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.12}>
              {/* The trailing "from seed stage through commercial" is cut. It
                  paraphrased a clause the hero and FundIntro both already
                  print verbatim ("from seed stage startups to commercial
                  stage corporations") within the two screens above this one —
                  the same sentence three times before the reader has scrolled
                  twice. This is the only one of the three that is safe to
                  edit: the other two are KOFA's own approved copy in
                  data/site.ts and are reused on /fund and /portfolio. */}
              <p className="type-body-sm max-w-[38ch]">
                {portfolio.length} companies across cardiovascular, women's
                health, diagnostics, orthopedics and digital health.
              </p>
              <div className="mt-7">
                <AnimatedDivider />
                <div className="mt-7">
                  <TextLink href="/portfolio">
                    View all {portfolio.length} companies
                  </TextLink>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>

      {/* --- the strip ---
          Full bleed on purpose: the row has to run out of both edges of the
          screen for the loop to read as endless rather than as a list that
          happens to be clipped. The mask is what sells it, cards dissolve into
          the ground instead of meeting a hard cut.

          Reveal rather than Rise: Rise carries a skew, and a skewed element
          inside this overflow-hidden host would have its corners sheared off
          for the length of the entrance. The rule is set out at the top of
          components/motion/Rise.tsx. */}
      <Reveal delay={0.16} y={28}>
        {/* overflow-CLIP, not overflow-hidden. `hidden` still creates a
            programmatically scrollable box, so the scroll-into-view the
            browser fires when a card outside the visible window takes keyboard
            focus was moving this host's scrollLeft — and nothing ever put it
            back, because the animation is a transform on the inner track and
            composes with the host's scroll offset rather than overriding it.
            Tabbing through the strip therefore displaced it permanently, and
            the marquee never recovered. `clip` is not a scroll container, so
            the mechanism cannot occur at all.

            The padding is the focus ring's clearance. A plate exactly fills
            the host's height and lifts 6px on focus, while the indicator is
            outline-2 at outline-offset-4 — 6px of reach beyond the card. With
            no padding the host clipped the ring's horizontal runs away
            entirely. 12px covers the measured loss, and it is subtracted back
            out of the top margin in the same expression so nothing moves. */}
        <div className="marquee-host relative mt-[calc(clamp(2.5rem,4vw,3.75rem)-0.75rem)] overflow-clip pt-3 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div
            className="animate-marquee flex w-max"
            style={{ ["--marquee-duration" as string]: `${PASS_SECONDS}s` }}
          >
            <Track />
            <Track duplicate />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
