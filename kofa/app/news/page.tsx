import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { NewsBrowser } from "@/components/news/NewsBrowser";
import { CTASection } from "@/components/ui/CTASection";
import { kofaNews, news, portfolioNews } from "@/data/news";

export const metadata: Metadata = {
  title: "News",
  description:
    "News from KOFA Healthcare and progress across its portfolio of healthcare and biotech companies.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "News · KOFA Healthcare",
    description:
      "News from KOFA Healthcare and progress across its portfolio companies.",
    url: "/news",
  },
};

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
