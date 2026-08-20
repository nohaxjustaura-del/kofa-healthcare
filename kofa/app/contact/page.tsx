import { Fragment } from "react";
import type { Metadata } from "next";
import { Container, Eyebrow, Section } from "@/components/ui/primitives";
import { ContactForm } from "@/components/ui/ContactForm";
import { LineReveal, Reveal } from "@/components/motion/Reveal";
import { Rise } from "@/components/motion/Rise";
import { ScientificBackground } from "@/components/motion/ScientificBackground";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/data/site";
import { portfolio } from "@/data/portfolio";

/* See lib/metadata.ts: a hand-written page-level `openGraph` replaces the root
   layout's wholesale, taking og:site_name, og:locale, og:type and the share
   card with it. The helper is the only place that block gets assembled. */
export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with KOFA Healthcare. We are always interested in meeting teams working on meaningful solutions to important clinical challenges.",
  path: "/contact",
  socialDescription: "Let's advance healthcare together.",
});

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-[clamp(3rem,5vw,4.5rem)] pt-[clamp(8rem,12vw,12rem)]">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="bg-grid absolute inset-0 opacity-55 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
          <div className="absolute inset-0 opacity-80">
            <ScientificBackground
              density={0.5}
              intensity={0.55}
              linkDistance={200}
              interactive={false}
            />
          </div>
        </div>

        <Container className="relative">
          {/* Stays on Reveal, not Rise: this section clips (overflow-hidden, so
              the grid and the network field can be masked at its edges) and
              Rise's skew throws the far corners outside the border box while it
              is in flight. See hazard (1) at the top of Rise.tsx. */}
          <Reveal>
            <Eyebrow>Contact</Eyebrow>
          </Reveal>
          <h1 className="type-display mt-8 max-w-[15ch] text-ink">
            <LineReveal
              lines={[
                "Let's advance",
                <Fragment key="together">
                  healthcare <span className="accent-italic">together</span>.
                </Fragment>,
              ]}
            />
          </h1>
        </Container>
      </section>

      <Section space="tight" className="border-t border-rule">
        <Container>
          <div className="grid grid-cols-12 gap-x-0 sm:gap-x-8 gap-y-16">
            {/* The two halves lean toward each other: the copy (col-span-4) in
                from the left, the form (col-start-6) in from the right, so the
                row closes on its own centre line instead of both columns
                sliding the same way. The rule is at the top of Rise.tsx. */}

            {/* --- welcome --- */}
            <div className="col-span-12 lg:col-span-4">
              <Rise from="left">
                <p className="type-body-lg max-w-[36ch] text-ink">
                  We are always interested in meeting teams working on
                  meaningful solutions to important clinical challenges.
                </p>
              </Rise>

              <Rise from="left" delay={0.08}>
                <p className="type-body mt-7 max-w-[38ch]">
                  KOFA invests from seed stage through commercial stage across
                  women's health, orthopedics, diagnostics, cardiovascular and
                  more. If that sounds like the problem you are working on, tell
                  us about it.
                </p>
              </Rise>

              <Rise from="left" delay={0.14}>
                <dl className="mt-12 border-t border-rule">
                  <div className="flex items-baseline justify-between gap-6 border-b border-rule py-5">
                    <dt className="type-eyebrow text-ink-mute">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${site.email}`}
                        className="link-draw -my-1 inline-block py-1 text-[0.9375rem] text-ink transition-colors duration-300 ease-kofa hover:text-teal"
                      >
                        {site.email}
                      </a>
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-6 border-b border-rule py-5">
                    <dt className="type-eyebrow text-ink-mute">Founded</dt>
                    <dd className="text-[0.9375rem] text-ink">
                      {site.founded}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-6 border-b border-rule py-5">
                    <dt className="type-eyebrow text-ink-mute">Portfolio</dt>
                    <dd className="text-[0.9375rem] text-ink">
                      {portfolio.length} companies
                    </dd>
                  </div>
                </dl>
              </Rise>
            </div>

            {/* --- form --- */}
            <div className="col-span-12 lg:col-span-7 lg:col-start-6">
              {/* The whole form arrives as one object. The fields never carry a
                  transform of their own; a field that skews under the cursor
                  while someone is reaching for it is worse than no motion. */}
              <Rise from="right" delay={0.1}>
                <ContactForm />
              </Rise>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
