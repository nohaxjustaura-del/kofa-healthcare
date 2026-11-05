import { getSiteContent } from "@/lib/site-content";
import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { TeamGrid } from "@/components/team/TeamGrid";
import { CTASection } from "@/components/ui/CTASection";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 60;

/* See lib/metadata.ts: a hand-written page-level `openGraph` replaces the root
   layout's wholesale, taking og:site_name, og:locale, og:type and the share
   card with it. The helper is the only place that block gets assembled. */
export const metadata: Metadata = pageMetadata({
  title: "Team",
  description:
    "Meet the KOFA Healthcare team investing in early- to mid-stage medical device companies.",
  path: "/team",
  socialDescription: "The people behind KOFA Healthcare.",
});

export default async function TeamPage() {
  const { team } = await getSiteContent();
  return (
    <>
      <PageHero
        eyebrow="Team"
        lines={["Our Team"]}
        intro="KOFA Healthcare’s investment team is supported by an accomplished network of clinical advisors and industry experts."
      />

      <Section space="tight" className="border-t border-rule pt-[clamp(3rem,5vw,4.5rem)]">
        <Container>
          <TeamGrid members={team} />
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
