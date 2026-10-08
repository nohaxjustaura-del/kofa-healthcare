import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/primitives";
import { NewsBrowser } from "@/components/news/NewsBrowser";
import { NewsRow } from "@/components/news/NewsRow";
import { PageHero } from "@/components/ui/PageHero";
import { CTASection } from "@/components/ui/CTASection";
import { pageMetadata } from "@/lib/metadata";
import { currentNews } from "@/data/news";

/* Re-rendered daily so Portfolio News older than the window in
   data/news.ts drops off without a new deploy. */
export const revalidate = 86400;


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
  const newsSorted = currentNews();
  const kofaCount = newsSorted.filter((n) => n.type === "KOFA News").length;
  return (
    <>
      <PageHero eyebrow="News" lines={["News"]} intro="Updates from KOFA Healthcare and the companies in our portfolio." />

      <Section space="roomy" className="bg-white">
        <Container>
          {/* The rows are rendered here, on the server, and handed to the
              filter as children; see the note in NewsBrowser.tsx. */}
          <NewsBrowser
            counts={{
              all: newsSorted.length,
              kofa: kofaCount,
              portfolio: newsSorted.length - kofaCount,
            }}
          >
            {newsSorted.map((item) => (
              <NewsRow key={item.slug} item={item} />
            ))}
          </NewsBrowser>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
