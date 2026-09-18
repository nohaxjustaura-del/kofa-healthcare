import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/primitives";
import { NewsBrowser } from "@/components/news/NewsBrowser";
import { PageHero } from "@/components/ui/PageHero";
import { CTASection } from "@/components/ui/CTASection";
import { pageMetadata } from "@/lib/metadata";

/* See lib/metadata.ts: a hand-written page-level `openGraph` replaces the root
   layout's wholesale, taking og:site_name, og:locale, og:type and the share
   card with it. The helper is the only place that block gets assembled. */
export const metadata: Metadata = pageMetadata({
  title: "News",
  description:
    "News from KOFA Healthcare and progress across its portfolio of medical device companies.",
  path: "/news",
  socialDescription:
    "News from KOFA Healthcare and progress across its portfolio companies.",
});

export default function NewsPage() {
  return (
    <>
      <PageHero eyebrow="News" lines={["News"]} intro="Updates from KOFA Healthcare and the companies in our portfolio." />

      <Section space="roomy" className="bg-white">
        <Container>
          <NewsBrowser />
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
