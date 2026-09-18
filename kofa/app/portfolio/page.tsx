import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/primitives";
import { PortfolioBrowser } from "@/components/portfolio/PortfolioBrowser";
import { PageHero } from "@/components/ui/PageHero";
import { CTASection } from "@/components/ui/CTASection";
import { pageMetadata } from "@/lib/metadata";
import { portfolio } from "@/data/portfolio";

/* See lib/metadata.ts: a hand-written page-level `openGraph` replaces the root
   layout's wholesale, taking og:site_name, og:locale, og:type and the share
   card with it. The helper is the only place that block gets assembled. */
export const metadata: Metadata = pageMetadata({
  title: "Portfolio",
  description: `The ${portfolio.length} companies KOFA Healthcare has backed across cardiovascular, women's health, diagnostics, orthopedics and digital health.`,
  path: "/portfolio",
  socialDescription: `Companies advancing the future of health. ${portfolio.length} companies across medicine.`,
});

export default function PortfolioPage() {
  return (
    <>
      <PageHero eyebrow="Portfolio" lines={["Portfolio"]} intro="We invest in early- to mid-stage medical device companies developing differentiated technologies for significant unmet clinical needs." />

      <Section space="roomy" className="bg-[#edf6f7]">
        <Container>
          <PortfolioBrowser />
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
