import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { TeamGrid } from "@/components/team/TeamGrid";
import { CTASection } from "@/components/ui/CTASection";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Team",
  description:
    "The people behind KOFA Healthcare, an evergreen family office venture fund backing biotech and healthcare innovation since 2016.",
  alternates: { canonical: "/team" },
  openGraph: {
    title: "Team · KOFA Healthcare",
    description: "The people behind KOFA Healthcare.",
    url: "/team",
  },
};

export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Team"
        lines={["Built around healthcare,", "entrepreneurship and", "long-term partnership."]}
        intro="KOFA is a family office fund. That structure lets the firm hold positions for as long as the science requires."
        meta={[
          { k: "Founded", v: String(site.founded) },
          { k: "Structure", v: "Evergreen family office" },
        ]}
      />

      <Section space="tight" className="border-t border-rule pt-[clamp(3rem,5vw,4.5rem)]">
        <Container>
          <TeamGrid />
        </Container>
      </Section>

      <CTASection
        lines={["Want to talk to", "someone here?"]}
        body="We are always interested in meeting teams working on meaningful solutions to important clinical challenges."
        action={{ label: "Get in touch", href: "/contact" }}
      />
    </>
  );
}
