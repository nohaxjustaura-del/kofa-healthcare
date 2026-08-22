import type { Metadata } from "next";
import { ParallaxHero } from "@/components/hero/ParallaxHero";
import { FundIntro } from "@/components/home/FundIntro";
import { PartnerMarquee } from "@/components/portfolio/PartnerMarquee";
import { ProcessTrack } from "@/components/home/ProcessTrack";
import { Conviction } from "@/components/home/Conviction";
import { PortfolioStory } from "@/components/home/PortfolioStory";
import { FilmBand } from "@/components/home/FilmBand";
import { TeamNumbers } from "@/components/home/TeamNumbers";
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
     purpose         dense, statement, fund copy, one wide plate
     portfolio       every company, as a drifting run of plates
     approach        the one horizontal passage, pinned, scrubbed
     conviction      the one inverted moment, deep teal, quiet, assertive
     story           intimate, one company, ground shifts to sage
     film            a breath, the only moving picture on the page
     team            counted columns, the numerals are the artwork
     news            editorial, information-dense
     CTA             empty and calm

   WHAT LEFT, AND WHY
     · The thin logo strip and the six-card "Selected portfolio" grid were
       adjacent and were both introducing the same sixteen companies. Both are
       replaced by PartnerMarquee, which does the job of the two in a fifth of
       the height.
     · The investment-areas grid left components/home/FundIntro.tsx. The areas
       are named in the paragraph beside the statement and set out properly on
       /fund; a third telling in a bento was the most expensive of the three.
--------------------------------------------------------------------------- */

/* The chapter rail's single source of truth. Order here is the numbering
   (01…08) and must match the order the sections appear below. The hero gets no
   entry on purpose: you are already there, and it is not a chapter. The film
   band gets none either, for the same reason the logo strip never did, it is a
   breath between chapters rather than one of them. */
const chapters = [
  { id: "purpose", label: "Purpose" },
  { id: "portfolio-preview", label: "Portfolio" },
  { id: "approach", label: "Approach" },
  { id: "conviction", label: "Conviction" },
  { id: "story", label: "Story" },
  { id: "team", label: "Team" },
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
      <PartnerMarquee />
      <ProcessTrack />
      <Conviction />
      <PortfolioStory />
      <FilmBand />
      <TeamNumbers />
      <PortfolioNewsSection />
      <KofaNewsSection />
      <CTASection id="contact" />
    </>
  );
}
