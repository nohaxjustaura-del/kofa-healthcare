import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { NewsBrowser } from "@/components/news/NewsBrowser";
import { CTASection } from "@/components/ui/CTASection";
import { pageMetadata } from "@/lib/metadata";
import { kofaNews, news, portfolioNews } from "@/data/news";

/* See lib/metadata.ts: a hand-written page-level `openGraph` replaces the root
   layout's wholesale, taking og:site_name, og:locale, og:type and the share
   card with it. The helper is the only place that block gets assembled. */
export const metadata: Metadata = pageMetadata({
  title: "News",
  description:
    "News from KOFA Healthcare and progress across its portfolio of healthcare and biotech companies.",
  path: "/news",
  socialDescription:
    "News from KOFA Healthcare and progress across its portfolio companies.",
});

export default function NewsPage() {
  return (
    <>
      <PageHero
        eyebrow="News"
        lines={["Progress, in the", "open."]}
        intro="Firm news and portfolio news, kept separate. Every item links to its original source."
        meta={[
          { k: "Total", v: String(news.length) },
          { k: "From KOFA", v: String(kofaNews.length) },
          { k: "Portfolio", v: String(portfolioNews.length) },
        ]}
      />

      <Section space="tight" className="pt-0">
        <Container>
          {/* No Suspense boundary: the list is server-rendered now. */}
          <NewsBrowser />
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
