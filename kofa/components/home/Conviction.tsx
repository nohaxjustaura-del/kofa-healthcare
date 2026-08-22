import { Fragment } from "react";
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
      className="relative overflow-hidden bg-[#0B2E2C]"
      aria-labelledby="conviction-heading"
    >
      {/* The same living network, drawn pale on the dark ground. */}
      <div aria-hidden className="absolute inset-0">
        <ScientificBackground
          density={0.8}
          intensity={0.55}
          linkDistance={190}
          tone="onDark"
          interactive={false}
        />
      </div>

      {/* Keeps the type off the brightest part of the field. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_15%_50%,rgba(11,46,44,0.94)_0%,rgba(11,46,44,0.72)_45%,rgba(11,46,44,0.3)_100%)]"
      />

      <Container className="relative">
        <Reveal>
          {/* Hand-rolled rather than <Eyebrow>, because this section inverts
              and needs its own on-teal colours. The 5px square was dropped
              here at the same time as the one in the shared component. */}
          <span className="type-eyebrow text-[#8FC0B8]">Our purpose</span>
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

        <div className="mt-14 grid grid-cols-12 gap-y-12">
          {/* The two columns lean toward each other: copy in from the left,
              figures in from the right, so the row closes on its own centre
              line instead of both halves sliding the same way. The rule is
              set out at the top of components/motion/Rise.tsx. */}
          <Rise from="left" delay={0.12} className="col-span-12 lg:col-span-5">
            <p className="max-w-[44ch] text-[1.0625rem] leading-[1.62] text-[rgba(247,248,244,0.72)]">
              {site.intro}
            </p>
            <div className="mt-9">
              <TextLink href="/fund" tone="white">
                How we invest
              </TextLink>
            </div>
          </Rise>

          {/* Figures set light and large, the weight does the work, not size
              alone. Every one of these is checkable against the portfolio. */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-10">
              {FIGURES.map((f, i) => (
                <Rise key={f.k} from="right" delay={0.16 + i * 0.06} as="div">
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
      </Container>
    </Section>
  );
}
