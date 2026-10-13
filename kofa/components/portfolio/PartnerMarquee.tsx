import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { CompanyLogo } from "@/components/portfolio/CompanyLogo";
import type { PortfolioCompany } from "@/data/portfolio";
import { getSiteContent } from "@/lib/site-content";

/* ===========================================================================
   PARTNER MARQUEE — the revolving portfolio strip
   ---------------------------------------------------------------------------
   The portfolio as a continuous run of plates, after the partners strip on
   biofarma.com.ar: a white card per company, the name in the top corner, the
   logo given the middle of the card, the whole row drifting sideways
   forever. One device, every company, a fifth of the
   height a grid of the same content would take.

   It was removed in favour of a static Active/Exits tab grid and the client
   asked for it back ("let's still use the revolving structure you designed
   earlier for the front page"), so it is restored from 0a063b1 — with one
   structural change.

   WHAT CHANGED ON THE WAY BACK
   The original was a whole <Section>: eyebrow, its own headline, its own
   "View all N companies" link, and the strip. The homepage's Portfolio
   section now supplies all of that chrome itself, so shipping the old
   component would have put two headings and two portfolio links on one
   screen. What remains here is the strip alone; the section that hosts it
   owns the words. The full-bleed behaviour is unchanged and is the reason
   this must be rendered OUTSIDE its section's <Container>.

   WHY THE CARD CARRIES MORE THAN A LOGO
   The reference strip repeats the brand name beside the logo, which on that
   site is the whole content of a card. A logo is a picture of a name, so a
   caption that only repeats the name is decoration. The name is here because
   these logos are not household marks and several are wordless, but the card
   also gets `focus`, the one-line clinical problem the company works on, from
   the same field the portfolio index uses. That is the difference between a
   wall of client logos and a portfolio: the reader leaves knowing what the
   companies DO.

   MOTION
   The track is rendered twice and translated by exactly -50%, which is what
   makes the loop seamless; the duplicate is `aria-hidden` and holds no
   focusable content, so assistive technology and the keyboard meet the list
   once. Hovering or focusing anywhere in the strip pauses it, so nothing is
   ever chased. With motion off (the footer control) the animation is
   cancelled in CSS, the duplicate is dropped, and the plates wrap into a
   static centred grid. See the `.animate-marquee` rules in app/globals.css.
=========================================================================== */

/** Duration of one full pass. Slower than it sounds: at sixteen cards this is
 *  a little under three seconds per card, which reads as drift rather than as
 *  a carousel. Passed to CSS so the marquee's speed stays declared at its
 *  call site rather than buried in the stylesheet. */
const PASS_SECONDS = 68;

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
      {/* --- corner: the name ---
          The restored plate carried a teal check-in-a-circle beside every
          name. The September brief removed exactly that ("company name
          blocks have no green checkmarks"), so it did not come back with
          the strip. The name stands alone. */}
      <span className="type-eyebrow block truncate text-ink-mute transition-colors duration-500 ease-kofa group-hover/plate:text-ink group-focus-visible/plate:text-ink">
        {company.name}
      </span>

      {/* --- the logo, given the middle of the card ---
          Logos arrive as mixed JPEG/PNG/WebP on white grounds, so they are
          multiplied against the card rather than placed on it: the plate is
          white, the logo's own white disappears, and sixteen files from
          sixteen design systems sit on one surface without haloes. Each is
          drawn at the same visual area (CompanyLogo.tsx), with the caps
          tracking the plate, which itself scales with the window. */}
      <div className="my-auto flex h-[clamp(3.25rem,4.6vw,4rem)] w-full items-center justify-center [--logo-base:clamp(3.5rem,4.9vw,4.4rem)] [--logo-max-h:clamp(3.25rem,4.6vw,4rem)] [--logo-max-w:clamp(9.5rem,13.5vw,12.5rem)]">
        {/* Decorative: the name is already the plate's first line, so the
            link reads "Axon Therapies, Heart failure" rather than naming the
            company twice. */}
        <CompanyLogo
          company={company}
          decorative
          className="logo-plate transition-transform duration-[700ms] ease-kofa group-hover/plate:scale-[1.04]"
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
function Track({ duplicate = false, companies }: { duplicate?: boolean; companies: PortfolioCompany[] }) {
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
      {companies.map((company) => (
        <li key={company.slug} className="shrink-0">
          <Plate company={company} inert={duplicate} />
        </li>
      ))}
    </ul>
  );
}

/**
 * The strip. Render it OUTSIDE a <Container>: the row has to run out of both
 * edges of the screen for the loop to read as endless rather than as a list
 * that happens to be clipped. The mask is what sells it — cards dissolve into
 * the ground instead of meeting a hard cut.
 */
export async function PartnerMarquee({ className = "" }: { className?: string }) {
  const { companies } = await getSiteContent();
  return (
    /* Reveal rather than Rise: Rise travels sideways and skews, and a
       full-bleed strip that moves sideways shows its own end at the edge of
       the screen for the length of the entrance. A straight rise keeps it
       reading as endless. */
    <Reveal delay={0.16} y={28}>
      {/* overflow-CLIP, not overflow-hidden. `hidden` still creates a
          programmatically scrollable box, so the scroll-into-view the browser
          fires when a card outside the visible window takes keyboard focus was
          moving this host's scrollLeft — and nothing ever put it back, because
          the animation is a transform on the inner track and composes with the
          host's scroll offset rather than overriding it. Tabbing through the
          strip therefore displaced it permanently, and the marquee never
          recovered. `clip` is not a scroll container, so the mechanism cannot
          occur at all.

          The padding is the focus ring's clearance. A plate exactly fills the
          host's height and lifts 6px on focus, while the indicator is
          outline-2 at outline-offset-4 — 6px of reach beyond the card. With no
          padding the host clipped the ring's horizontal runs away entirely.
          12px covers the measured loss. */}
      <div
        className={`marquee-host relative overflow-clip py-3 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] ${className}`}
      >
        <div
          className="animate-marquee flex w-max"
          style={{ ["--marquee-duration" as string]: `${PASS_SECONDS}s` }}
        >
          <Track companies={companies} />
          <Track companies={companies} duplicate />
        </div>
      </div>
    </Reveal>
  );
}
