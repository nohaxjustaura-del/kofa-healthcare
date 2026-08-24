import type { Metadata } from "next";
import Image from "next/image";
import { Container, Meta, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { ImageReveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
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
          {/* A restrained editorial plate gives the portfolio landing page a
              human, scientific point of entry before it becomes a catalogue.
              The shallow desktop crop preserves the page's whitespace; on
              mobile it opens up enough to keep both researchers visible. */}
          <figure className="mb-[clamp(3.5rem,6vw,6rem)]">
            <ImageReveal className="relative aspect-[16/9] max-h-[32rem] overflow-hidden bg-sage-bg lg:aspect-[21/7]">
              <Parallax amount={0.08}>
                <Image
                  src="/media/home/researchers-lab.jpg"
                  alt="Two healthcare researchers working together at a laboratory bench."
                  fill
                  priority
                  sizes="(max-width: 1600px) 100vw, 1600px"
                  className="object-cover object-center"
                />
              </Parallax>
            </ImageReveal>
            <figcaption className="mt-4 flex flex-wrap justify-between gap-2">
              <Meta>Science into practice</Meta>
              <Meta>Across devices, diagnostics and digital health</Meta>
            </figcaption>
          </figure>

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
