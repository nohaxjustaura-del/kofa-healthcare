import type { Metadata } from "next";
import { ParallaxHero } from "@/components/hero/ParallaxHero";
import { FundIntro } from "@/components/home/FundIntro";
import { LogoStrip } from "@/components/portfolio/LogoStrip";
import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { ProcessTrack } from "@/components/home/ProcessTrack";
import { Conviction } from "@/components/home/Conviction";
import { PortfolioStory } from "@/components/home/PortfolioStory";
import {
  KofaNewsSection,
  PortfolioNewsSection,
} from "@/components/home/HomeNews";
import { CTASection } from "@/components/ui/CTASection";
import { ChapterRail } from "@/components/ui/ChapterRail";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} · ${site.tagline}`,
  description: site.intro,
  alternates: { canonical: "/" },
};

/* ---------------------------------------------------------------------------
   Homepage pacing, in order of density:
     hero            expansive, quiet
     purpose         dense, statement, fund copy, investment areas
     logo strip      a breath
     portfolio       the heart of the page, roomy
     approach        the one horizontal passage, pinned, scrubbed
     conviction      the one inverted moment, deep teal, quiet, assertive
     story           intimate, one company, ground shifts to sage
     news            editorial, information-dense
     CTA             empty and calm
--------------------------------------------------------------------------- */

/* The chapter rail's single source of truth. Order here is the numbering
   (01…07) and must match the order the sections appear below. The hero gets no
   entry on purpose: you are already there, and it is not a chapter. */
const chapters = [
  { id: "purpose", label: "Purpose" },
  { id: "portfolio-preview", label: "Portfolio" },
  { id: "approach", label: "Approach" },
  { id: "conviction", label: "Conviction" },
  { id: "story", label: "Story" },
  { id: "news", label: "News" },
  { id: "contact", label: "Contact" },
];

export default function Home() {
  return (
    <>
      <ChapterRail sections={chapters} />
      {/* The depth-layered hero. components/hero/Hero.tsx is the flat original
          and is still a one-line swap back. */}
      <ParallaxHero />
      <FundIntro />
      <LogoStrip />
      <PortfolioPreview />
      <ProcessTrack />
      <Conviction />
      <PortfolioStory />
      <PortfolioNewsSection />
      <KofaNewsSection />
      <CTASection id="contact" />
    </>
  );
}
