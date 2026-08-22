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

/* The chapter rail's single source of truth. Order here must match the order
   the sections appear below. The hero gets no entry on purpose: you are
   already there, and it is not a chapter. The film band gets none either, for
   the same reason the logo strip never did — it is a breath between chapters
   rather than one of them.

   `index` IS THE NUMBER THE SECTION ITSELF PRINTS, not the row's position.
   The rail used to count its own rows 01..08 while the sections printed a
   separate 01..06 in their eyebrows, and above 1280px both are on screen
   together: the Portfolio section said 01 on the page and 02 in the gutter,
   and every numbered row disagreed the same way. Now the gutter quotes the
   page.

   Purpose, Conviction and Contact carry no numeral, because their eyebrows
   carry none either — the numbering is selective by design (see the note on
   `index` in components/ui/primitives.tsx), and those rows render as a dash
   plus their hover label. If you add a numeral to a section's Eyebrow, add
   the matching one here; if the two ever drift apart again, this comment is
   the reason they must not. */
const chapters = [
  { id: "purpose", label: "Purpose" },
  { id: "portfolio-preview", label: "Portfolio", index: "01" },
  { id: "approach", label: "Approach", index: "02" },
  { id: "conviction", label: "Conviction" },
  { id: "story", label: "Story", index: "03" },
  { id: "team", label: "Team", index: "04" },
  { id: "news", label: "News", index: "05" },
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
