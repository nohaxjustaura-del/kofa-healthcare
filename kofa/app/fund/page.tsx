import { Fragment } from "react";
import type { Metadata } from "next";
import {
  BodyCopy,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { AreasAccordion } from "@/components/fund/AreasAccordion";
import { CTASection } from "@/components/ui/CTASection";
import { LineReveal, Reveal } from "@/components/motion/Reveal";
import { investmentProcess, site } from "@/data/site";
import { activeCategories, portfolio } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "The Fund",
  description:
    "KOFA Healthcare is an evergreen family office venture fund supporting biotech and healthcare innovations, investing from seed stage through commercial stage.",
  alternates: { canonical: "/fund" },
  openGraph: {
    title: "The Fund · KOFA Healthcare",
    description:
      "Long-term capital for healthcare innovation. An evergreen family office venture fund.",
    url: "/fund",
  },
};

/* Only what KOFA publishes. Anything unconfirmed is marked, not invented. */
const CRITERIA = [
  {
    k: "Stage",
    v: "Seed through commercial",
    note: "Stated: “from seed stage startups to commercial stage corporations.”",
    confirmed: true,
  },
  {
    k: "Structure",
    v: "Evergreen family office fund",
    note: "No fixed fund life, so hold periods follow the science.",
    confirmed: true,
  },
  {
    k: "Sectors",
    v: "Women's health, orthopedics, diagnostics, cardiovascular, and more",
    note: "Stated verbatim on kofahealthcare.com.",
    confirmed: true,
  },
  {
    k: "Geography",
    v: "To be confirmed",
    note: "KOFA does not publish a geographic mandate. CMS field ready.",
    confirmed: false,
  },
  {
    k: "Check size",
    v: "To be confirmed",
    note: "Not published. CMS field ready.",
    confirmed: false,
  },
  {
    k: "Ownership target",
    v: "To be confirmed",
    note: "Not published. CMS field ready.",
    confirmed: false,
  },
];

export default function FundPage() {
  return (
    <>
      <PageHero
        eyebrow="The Fund"
        lines={["Long-term capital", "for healthcare", "innovation."]}
        intro={site.intro}
        meta={[
          { k: "Founded", v: String(site.founded) },
          { k: "Companies", v: String(portfolio.length) },
          { k: "Areas", v: String(activeCategories.length) },
        ]}
      />

      {/* ---------- Who we are ---------- */}
      <Section className="border-t border-rule">
        <Container>
          <div className="grid grid-cols-12 gap-y-10">
            <div className="col-span-12 lg:col-span-3">
              <Reveal>
                <Eyebrow index="01">Who we are</Eyebrow>
              </Reveal>
            </div>
            <div className="col-span-12 lg:col-span-8 lg:col-start-5">
              <Reveal delay={0.06}>
                <p className="type-statement max-w-[26ch] text-ink">
                  KOFA is an evergreen family office venture fund. There is no
                  fund clock, so we can hold a position for as long as the{" "}
                  <span className="accent-italic">science</span> requires.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <BodyCopy className="mt-9 max-w-[58ch]" size="lg">
                  {site.about}
                </BodyCopy>
              </Reveal>
              <Reveal delay={0.16}>
                <BodyCopy className="mt-5 max-w-[58ch]">
                  The firm invests in groundbreaking technologies that address
                  clinical unmet needs: medical devices, diagnostics and
                  biologics that change what clinicians are able to do, rather
                  than incremental improvements on what already exists.
                </BodyCopy>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------- Where we invest ---------- */}
      <Section className="border-t border-rule bg-sage-bg">
        <Container>
          <div className="grid grid-cols-12 gap-y-10">
            <div className="col-span-12 lg:col-span-5">
              <Reveal>
                <Eyebrow index="02">Where we invest</Eyebrow>
              </Reveal>
              <Reveal delay={0.06}>
                <SectionHeading className="mt-7 max-w-[14ch]">
                  What we can say, and what we cannot.
                </SectionHeading>
              </Reveal>
              <Reveal delay={0.12}>
                <BodyCopy className="mt-7 max-w-[38ch] text-[0.9375rem]">
                  The criteria below are drawn from KOFA's own published
                  material. Where the firm has not published a figure, this page
                  says so rather than filling the gap.
                </BodyCopy>
              </Reveal>
            </div>

            <div className="col-span-12 lg:col-span-6 lg:col-start-7">
              <dl className="border-t border-rule">
                {CRITERIA.map((c, i) => (
                  <Reveal key={c.k} delay={Math.min(i * 0.05, 0.25)} as="div">
                    <div className="border-b border-rule py-7">
                      <div className="flex items-baseline justify-between gap-6">
                        <dt className="type-eyebrow text-ink-mute">{c.k}</dt>
                        {!c.confirmed && (
                          <span className="type-eyebrow rounded-[4px] border border-dashed border-sage px-2 py-1 text-[9px] text-ink-mute">
                            CMS field
                          </span>
                        )}
                      </div>
                      <dd
                        className={`mt-3 max-w-[40ch] text-[1.0625rem] leading-snug ${
                          c.confirmed ? "text-ink" : "text-ink-mute italic"
                        }`}
                      >
                        {c.v}
                      </dd>
                      <p className="type-meta mt-2.5 max-w-[46ch] text-ink-mute">
                        {c.note}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------- Our perspective ---------- */}
      <Section space="roomy" className="border-t border-rule">
        <Container>
          <Reveal>
            <Eyebrow index="03">Our perspective</Eyebrow>
          </Reveal>
          <p className="type-display-sm mt-9 max-w-[20ch] text-ink">
            <LineReveal
              lines={[
                "Good medical technology",
                "takes longer than a fund",
                <Fragment key="removed">
                  cycle. So we{" "}
                  <span className="accent-italic">removed</span> the cycle.
                </Fragment>,
              ]}
            />
          </p>

          <div className="mt-16 grid grid-cols-12 gap-x-0 sm:gap-x-8 gap-y-10">
            {investmentProcess.map((s, i) => (
              <Reveal
                key={s.n}
                delay={i * 0.06}
                as="div"
                className="col-span-12 border-t border-rule pt-6 sm:col-span-6 lg:col-span-2"
              >
                <span className="type-eyebrow tabular-nums text-teal">
                  {s.n}
                </span>
                <h3 className="mt-4 text-[1.0625rem] font-medium leading-snug tracking-[-0.012em] text-ink">
                  {s.title}
                </h3>
                <p className="type-body-xs mt-3">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------- Areas of interest ---------- */}
      <Section className="border-t border-rule bg-ivory-deep">
        <Container>
          <div className="grid grid-cols-12 items-end gap-y-8">
            <div className="col-span-12 lg:col-span-7">
              <Reveal>
                <Eyebrow index="04">Areas of interest</Eyebrow>
              </Reveal>
              <Reveal delay={0.06}>
                <SectionHeading className="mt-7 max-w-[16ch]">
                  What we look for, and where we have looked.
                </SectionHeading>
              </Reveal>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <Reveal delay={0.12}>
                <BodyCopy className="max-w-[38ch] text-[0.9375rem]">
                  Expand an area to see the companies KOFA has backed in it.
                </BodyCopy>
              </Reveal>
            </div>
          </div>

          <div className="mt-14">
            <AreasAccordion />
          </div>
        </Container>
      </Section>

      <CTASection
        lines={["Building something", "we should know about?"]}
        body="We are always interested in meeting teams working on meaningful solutions to important clinical challenges."
        action={{ label: "Introduce your company", href: "/contact" }}
      />
    </>
  );
}
