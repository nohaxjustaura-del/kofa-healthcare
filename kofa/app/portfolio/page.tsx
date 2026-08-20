import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { PortfolioBrowser } from "@/components/portfolio/PortfolioBrowser";
import { CTASection } from "@/components/ui/CTASection";
import { activeCategories, portfolio } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: `The ${portfolio.length} companies KOFA Healthcare has backed across cardiovascular, women's health, diagnostics, orthopedics and digital health.`,
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio · KOFA Healthcare",
    description: `Companies advancing the future of health. ${portfolio.length} companies across ${activeCategories.length} areas of medicine.`,
    url: "/portfolio",
  },
};

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
