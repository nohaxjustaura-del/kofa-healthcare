import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { PortfolioBrowser } from "@/components/portfolio/PortfolioBrowser";
import { CTASection } from "@/components/ui/CTASection";
import { pageMetadata } from "@/lib/metadata";
import { activeCategories, portfolio } from "@/data/portfolio";

/* See lib/metadata.ts: a hand-written page-level `openGraph` replaces the root
   layout's wholesale, taking og:site_name, og:locale, og:type and the share
   card with it. The helper is the only place that block gets assembled. */
export const metadata: Metadata = pageMetadata({
  title: "Portfolio",
  description: `The ${portfolio.length} companies KOFA Healthcare has backed across cardiovascular, women's health, diagnostics, orthopedics and digital health.`,
  path: "/portfolio",
  socialDescription: `Companies advancing the future of health. ${portfolio.length} companies across ${activeCategories.length} areas of medicine.`,
});

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        lines={["Companies advancing", "the future of health."]}
        intro="From seed stage startups to commercial stage corporations, developing technologies for needs that clinical medicine has not yet met."
        meta={[
          { k: "Companies", v: String(portfolio.length) },
          { k: "Areas", v: String(activeCategories.length) },
          { k: "Stage", v: "Seed to commercial" },
        ]}
      />

      <Section space="tight" className="pt-0">
        <Container>
          {/* No Suspense boundary: the grid is server-rendered now. */}
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
