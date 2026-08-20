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
import { LineReveal } from "@/components/motion/Reveal";
import { Rise, RiseGroup, RiseItem } from "@/components/motion/Rise";
import { pageMetadata } from "@/lib/metadata";
import { investmentProcess, site } from "@/data/site";
import { activeCategories, portfolio } from "@/data/portfolio";

/* Built through the shared helper rather than hand-written. A page-level
   `openGraph` object replaces the root layout's outright instead of merging
   into it, so writing one by hand here is what dropped og:site_name, og:locale,
   og:type and the card image from this page. See lib/metadata.ts. */
export const metadata: Metadata = pageMetadata({
  title: "The Fund",
  description:
    "KOFA Healthcare is an evergreen family office venture fund supporting biotech and healthcare innovations, investing from seed stage through commercial stage.",
  path: "/fund",
  socialDescription:
    "Long-term capital for healthcare innovation. An evergreen family office venture fund.",
});

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
          {/* The page's recurring shape: a narrow label column against a wide
              copy column. The two lean toward each other, label in from the
              left, copy in from the right, so each pair closes on its own
              centre line rather than sliding across as a unit. The rule is set
              out at the top of components/motion/Rise.tsx and it governs every
              grid on this page. */}
          <div className="grid grid-cols-12 gap-y-10">
            <div className="col-span-12 lg:col-span-3">
              <Rise from="left">
                <Eyebrow index="01">Who we are</Eyebrow>
              </Rise>
            </div>
            <div className="col-span-12 lg:col-span-8 lg:col-start-5">
              <Rise from="right" delay={0.06}>
                <p className="type-statement max-w-[26ch] text-ink">
                  KOFA is an evergreen family office venture fund. There is no
                  fund clock, so we can hold a position for as long as the{" "}
                  <span className="accent-italic">science</span> requires.
                </p>
              </Rise>
              <Rise from="right" delay={0.12}>
                <BodyCopy className="mt-9 max-w-[58ch]" size="lg">
                  {site.about}
                </BodyCopy>
              </Rise>
              <Rise from="right" delay={0.16}>
                <BodyCopy className="mt-5 max-w-[58ch]">
                  The firm invests in groundbreaking technologies that address
                  clinical unmet needs: medical devices, diagnostics and
                  biologics that change what clinicians are able to do, rather
                  than incremental improvements on what already exists.
                </BodyCopy>
              </Rise>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------- Where we invest ---------- */}
      <Section className="border-t border-rule bg-sage-bg">
        <Container>
          <div className="grid grid-cols-12 gap-y-10">
            <div className="col-span-12 lg:col-span-5">
              <Rise from="left">
                <Eyebrow index="02">Where we invest</Eyebrow>
              </Rise>
              <Rise from="left" delay={0.06}>
                <SectionHeading className="mt-7 max-w-[14ch]">
                  What we look for.
                </SectionHeading>
              </Rise>
              <Rise from="left" delay={0.12}>
                {/* This paragraph used to explain the "CMS field" badges that
                    sat beside the unpublished rows. Those rows no longer
                    render (see the filter below), so the explanation went with
                    them; a page that no longer shows gaps should not open by
                    drawing attention to them. */}
                <BodyCopy className="mt-7 max-w-[38ch] text-[0.9375rem]">
                  Drawn from KOFA's own published material, in the firm's own
                  terms.
                </BodyCopy>
              </Rise>
            </div>

            {/* The criteria read as one list, not six blocks that happen to be
                adjacent, so a group drives them off a single viewport trigger
                rather than six hand-written delays that fire independently of
                where the reader actually is. Rows come in from the right,
                because the list is the right half of the pair.

                The group takes the column's own classes instead of nesting
                inside it: RiseGroup renders a div either way, so this is the
                same element, not an extra one. */}
            <RiseGroup
              as="div"
              className="col-span-12 lg:col-span-6 lg:col-start-7"
            >
              {/* Only the confirmed rows render.
                  This list previously showed all six, so half the section was
                  three rows reading "To be confirmed" in grey italic beside a
                  dashed "CMS field" badge. That is scaffolding — a note from
                  the build to the client — and it was shipping to anyone
                  reading the fund page, where it made KOFA look like it had not
                  decided what it invests in.

                  The unconfirmed entries stay in CRITERIA above with
                  `confirmed: false`, so the moment KOFA supplies a geography,
                  a check size or an ownership target, filling the value and
                  flipping the flag puts the row back with no code change. */}
              <dl className="border-t border-rule">
                {CRITERIA.filter((c) => c.confirmed).map((c) => (
                  <RiseItem key={c.k} from="right" as="div">
                    <div className="border-b border-rule py-7">
                      <dt className="type-eyebrow text-ink-mute">{c.k}</dt>
                      <dd className="mt-3 max-w-[40ch] text-[1.0625rem] leading-snug text-ink">
                        {c.v}
                      </dd>
                      <p className="type-meta mt-2.5 max-w-[46ch] text-ink-mute">
                        {c.note}
                      </p>
                    </div>
                  </RiseItem>
                ))}
              </dl>
            </RiseGroup>
          </div>
        </Container>
      </Section>

      {/* ---------- Our perspective ---------- */}
      <Section space="roomy" className="border-t border-rule">
        <Container>
          {/* Nothing sits beside this one, so it takes the house default for a
              single-column stack and comes in from the left. */}
          <Rise from="left">
            <Eyebrow index="03">Our perspective</Eyebrow>
          </Rise>
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

          {/* A row of five, so it opens outward the same way the three-up rows
              do: the ends come in from their own side of the page and
              everything between them straight up, which spreads the process
              into place instead of sliding it across. */}
          <div className="mt-16 grid grid-cols-12 gap-x-0 sm:gap-x-8 gap-y-10">
            {investmentProcess.map((s, i) => (
              <Rise
                key={s.n}
                from={
                  i === 0
                    ? "left"
                    : i === investmentProcess.length - 1
                      ? "right"
                      : "up"
                }
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
              </Rise>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------- Areas of interest ---------- */}
      <Section className="border-t border-rule bg-ivory-deep">
        <Container>
          <div className="grid grid-cols-12 items-end gap-y-8">
            <div className="col-span-12 lg:col-span-7">
              <Rise from="left">
                <Eyebrow index="04">Areas of interest</Eyebrow>
              </Rise>
              <Rise from="left" delay={0.06}>
                <SectionHeading className="mt-7 max-w-[16ch]">
                  What we look for, and where we have looked.
                </SectionHeading>
              </Rise>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <Rise from="right" delay={0.12}>
                <BodyCopy className="max-w-[38ch] text-[0.9375rem]">
                  Expand an area to see the companies KOFA has backed in it.
                </BodyCopy>
              </Rise>
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
