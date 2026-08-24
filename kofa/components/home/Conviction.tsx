import { Fragment } from "react";
import Image from "next/image";
import { Container, Section } from "@/components/ui/primitives";
import { LineReveal, Reveal } from "@/components/motion/Reveal";
import { Rise } from "@/components/motion/Rise";
import { ScientificBackground } from "@/components/motion/ScientificBackground";
import { TextLink } from "@/components/ui/Button";
import { site } from "@/data/site";
import { activeCategories, portfolio } from "@/data/portfolio";

/* ===========================================================================
   CONVICTION: the page's one inverted moment
   ---------------------------------------------------------------------------
   Every other section sits on ivory. This one drops to deep teal for the
   length of a single statement and comes straight back up. It exists for
   pacing: after the portfolio grid and the process row, the page needs one
   place to stop talking and simply assert something, and a tonal shift does
   that far more economically than another headline on the same ground.

   The line it carries is KOFA's own, "Empower Innovations to Advance Global
   Health" is the h1 of the current site. In the redesign it had been demoted
   to a <title> tag; this gives it the loudest position on the page instead.

   The figures are the four facts that are independently checkable. No
   invented metrics, no counters animating up from zero.

   THE CARDIOVASCULAR VISUAL BREAK. This is also where the page's first big
   image lands: a 3D anatomical heart, glowing on the right of the dark ground
   while the tagline and the figures sit on a near-opaque scrim to the left.
   Cardiovascular is KOFA's largest cluster, so the one image the page stops
   on is a heart — without captioning the section as "cardiovascular", which
   would wrongly narrow the fund's remit. The render is composed with the heart
   opposite the copy, preserving a clean field behind the statement.

   Removing this section is a one-line change in app/page.tsx if KOFA would
   rather the site stay light throughout.
=========================================================================== */

const FIGURES = [
  { v: String(portfolio.length), k: "Portfolio companies" },
  { v: String(activeCategories.length), k: "Areas of medicine" },
  { v: String(site.founded), k: "Founded" },
  { v: "Evergreen", k: "Fund structure" },
];

export function Conviction() {
  return (
    <Section
      space="roomy"
      id="conviction"
      className="relative overflow-hidden bg-[#0B2220]"
      aria-labelledby="conviction-heading"
    >
      {/* The heart, glowing off the right edge and composed opposite the copy;
          kept soft and dark so it reads as atmosphere behind the statement
          rather than as a diagram to be studied. */}
      <div aria-hidden className="absolute inset-0">
        <Image
          src="/media/home/heart-cinematic.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-right opacity-95"
        />
      </div>

      {/* The same living network, drawn pale, held quiet so it does not fight
          the heart behind it. */}
      <div aria-hidden className="absolute inset-0">
        <ScientificBackground
          density={0.7}
          intensity={0.32}
          linkDistance={190}
          tone="onDark"
          interactive={false}
        />
      </div>

      {/* Holds the type on the dark left while the heart stays legible on the
          right. Darker and wider than the old radial: it now has to carry text
          over a lit photograph, not over a pale network. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,#0B2220_0%,rgba(11,34,32,0.92)_34%,rgba(11,34,32,0.58)_58%,rgba(11,34,32,0.2)_100%)]"
      />

      <Container className="relative">
        <Reveal>
          {/* Hand-rolled rather than <Eyebrow>, because this section inverts
              and needs its own on-teal colours. The 5px square was dropped
              here at the same time as the one in the shared component. */}
          {/* "Our conviction", not "Our purpose". FundIntro's eyebrow four
              screens up is already "Our purpose", and this section was
              repeating it verbatim — so the loudest frame on the page opened
              by announcing itself as something the reader had already been
              shown. The label now matches this section's own chapter in the
              rail, which is what it should have been. */}
          <span className="type-eyebrow text-[#8FC0B8]">Our conviction</span>
        </Reveal>

        {/* KOFA's own line, at the scale it deserves. */}
        <h2
          id="conviction-heading"
          /* 18ch, not 15ch. At 15ch the measure is 973px and "Empower
             innovations" — the longest of the three authored lines — is a
             few pixels too wide for it, so it wrapped INSIDE its own
             clip-line. That cost twice over: the line box doubled to 209px
             against its siblings' 109px, putting a ragged 100px hole in the
             middle of the section, and LineReveal translates each line by its
             own height to hide it, so the wrapped line had twice as far to
             travel and sat visibly blank while the two below it had already
             arrived. The section read as a headline with its first line
             missing.

             LineReveal exists precisely so the breaks are authored rather
             than discovered, so the measure's only job is to be wide enough
             never to fight them. Measured: it stops wrapping at 17ch, and
             18ch leaves a character of headroom for font-loading variance.
             Narrower screens still wrap, which is correct — there the author's
             breaks cannot be honoured anyway. */
          className="type-display mt-9 max-w-[18ch] text-ivory"
        >
          <LineReveal
            lines={[
              "Empower innovations",
              "to advance",
              <Fragment key="global">
                <span className="italic text-[#7FBDB3]">global</span> health.
              </Fragment>,
            ]}
          />
        </h2>

        {/* THE REPEATED PARAGRAPH IS GONE.
            A five-column block here used to carry `site.intro` — the exact
            string FundIntro renders four screens earlier, word for word — with
            a link to /fund beside it, which FundIntro also already offers.
            This is the page's one inverted moment and its whole documented job
            is "to stop talking and simply assert something"; opening it with a
            paragraph the reader has already read is the opposite of that, and
            it squeezed the four figures into six columns to do it.

            With it gone the figures take the full measure, and the section is
            the tagline plus the four checkable facts, which is all it ever
            needed to be. The link moves below the figures so the section still
            has a way out. */}
        <div className="mt-14 grid grid-cols-12 gap-y-12">
          {/* Figures set light and large, the weight does the work, not size
              alone. Every one of these is checkable against the portfolio. */}
          <div className="col-span-12">
            {/* Four across at lg, not two. At two columns on the full measure
                each figure would sit under a 700px rule with a two-word label
                under it, which reads as a table that lost its data. The lean
                is neutral now: `from="right"` was there to close a pair
                against the paragraph on the left, and there is no pair any
                more — four peers read left to right, so they arrive that way,
                on the stagger alone. */}
            <dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
              {FIGURES.map((f, i) => (
                <Rise key={f.k} from="up" delay={0.16 + i * 0.06} as="div">
                  <div className="h-px w-full bg-[rgba(247,248,244,0.18)]" />
                  {/* The figure rises from behind its own rule, the same
                      masked reveal the display headlines use. Reusing that
                      language rather than inventing a counter keeps the set
                      feeling like one system, and avoids the animated
                      statistic the brief rules out. */}
                  <dd className="mt-6 font-light tracking-[-0.02em] text-ivory text-[clamp(2.25rem,1.2rem+2.6vw,3.25rem)] leading-none tabular-nums">
                    <LineReveal lines={[f.v]} delay={0.2 + i * 0.08} />
                  </dd>
                  <dt className="type-eyebrow mt-4 text-[rgba(247,248,244,0.6)]">
                    {f.k}
                  </dt>
                </Rise>
              ))}
            </dl>
          </div>
        </div>

        {/* The way out. It sat beside the deleted paragraph; on its own under
            the figures it is the last thing in the section, which is where a
            reader looks for it anyway. */}
        <Rise from="up" delay={0.4}>
          <div className="mt-14">
            <TextLink href="/fund" tone="white">
              How we invest
            </TextLink>
          </div>
        </Rise>
      </Container>
    </Section>
  );
}
