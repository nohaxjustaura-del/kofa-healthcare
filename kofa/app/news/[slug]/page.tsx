import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow, Section } from "@/components/ui/primitives";
import { Button, TextLink } from "@/components/ui/Button";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/motion/Reveal";
import { Rise } from "@/components/motion/Rise";
import { NewsCard } from "@/components/news/NewsCard";
import { formatNewsDate, getNews, news, relatedNews } from "@/data/news";
import { getCompany } from "@/data/portfolio";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/data/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const item = getNews(slug);
  if (!item) return { title: "Not found" };

  /* socialTitle is the headline on its own, with no "· KOFA Healthcare"
     suffix: og:title is rendered as the card's headline, and an article
     already says whose site it is through og:site_name — which this route was
     losing, along with the image, by hand-writing its own openGraph. See
     lib/metadata.ts. */
  return pageMetadata({
    title: item.title,
    description: item.excerpt,
    path: `/news/${item.slug}`,
    socialTitle: item.title,
    type: "article",
    publishedTime: item.date,
  });
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const item = getNews(slug);
  if (!item) notFound();

  const company = item.company ? getCompany(item.company) : undefined;
  const related = relatedNews(item, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.excerpt,
    datePublished: item.date,
    publisher: { "@type": "Organization", name: item.source ?? site.name },
    ...(item.externalUrl ? { sameAs: item.externalUrl } : {}),
    ...(item.externalUrl
      ? { mainEntityOfPage: { "@type": "WebPage", "@id": item.externalUrl } }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <article>
        {/* ---------- masthead ---------- */}
        {/* Everything inside this section stays on Reveal. The section clips,
            it is overflow-hidden so the background grid can be masked off at
            its edges, and Rise's skew pushes the far corners outside the border
            box for the length of the flight, which a clipping ancestor shears.
            See hazard (1) at the top of components/motion/Rise.tsx. */}
        <section className="relative overflow-hidden pb-[clamp(2.5rem,4vw,3.5rem)] pt-[clamp(7rem,11vw,10rem)]">
          <div
            aria-hidden
            className="bg-grid absolute inset-0 -z-10 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]"
          />
          <Container>
            <Reveal>
              <Link
                href="/news"
                // -my-1.5/py-1.5 lifts the 19.5px line box past the 24px minimum.
              className="group/link -my-1.5 inline-flex items-center gap-2.5 py-1.5 text-[0.8125rem] font-medium text-ink-soft transition-colors duration-300 ease-kofa hover:text-teal"
              >
                <Arrow
                  size={14}
                  dir="left"
                  className="transition-transform duration-300 ease-kofa group-hover/link:-translate-x-1"
                />
                All news
              </Link>
            </Reveal>

            {/* Reading measure, 800px max, per §20 */}
            <div className="mx-auto mt-12 max-w-[50rem]">
              <Reveal>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Eyebrow>{item.type}</Eyebrow>
                  <span aria-hidden className="h-3 w-px bg-rule" />
                  <time
                    dateTime={item.date}
                    className="type-eyebrow text-ink-mute"
                  >
                    {formatNewsDate(item.date)}
                  </time>
                  {item.source && (
                    <>
                      <span aria-hidden className="h-3 w-px bg-rule" />
                      <span className="type-eyebrow text-ink-mute">
                        {item.source}
                      </span>
                    </>
                  )}
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <h1 className="type-display-sm mt-8 text-balance text-ink">
                  {item.title}
                </h1>
              </Reveal>

              {item.subheadline && (
                <Reveal delay={0.14}>
                  <p className="type-body-lg mt-7">{item.subheadline}</p>
                </Reveal>
              )}
            </div>
          </Container>
        </section>

        {/* ---------- body ---------- */}
        <Container>
          <div className="mx-auto max-w-[50rem]">
            <div className="h-px w-full bg-rule" />

            {/* The body keeps the neutral entrance. This is a reading page, and
                a column of paragraphs that travels sideways puts the motion in
                front of the sentence. Rise is for the furniture around it. */}
            <Reveal delay={0.1}>
              {item.body ? (
                <div className="mt-12 space-y-6 text-[1.0625rem] leading-[1.72] text-ink-soft">
                  {item.body.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <>
                  <p className="mt-12 text-[1.1875rem] leading-[1.66] text-ink">
                    {item.excerpt}
                  </p>

                  {item.externalUrl && (
                    <div className="mt-12 border-l-2 border-teal pl-6">
                      <p className="type-eyebrow text-ink-mute">
                        Published by {item.source}
                      </p>
                      <p className="type-body-sm mt-3 max-w-[52ch]">
                        KOFA links to the original report rather than
                        republishing it. The full article is available at the
                        source.
                      </p>
                      <div className="mt-7">
                        <Button href={item.externalUrl} external>
                          Read the full article
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Reveal>

            {/* ---------- related company ---------- */}
            {/* Furniture, not prose: a composed card sitting under the article,
                so it leans in from the left, the house default for a block in a
                single column. */}
            {company && (
              <Rise from="left" delay={0.14}>
                <div className="mt-16 border-t border-rule pt-10">
                  <Eyebrow tone="mute">Portfolio company</Eyebrow>
                  <Link
                    href={`/portfolio/${company.slug}`}
                    className="group/co mt-7 flex items-start justify-between gap-8"
                  >
                    <div className="min-w-0">
                      <div className="relative h-7 w-[132px]">
                        <Image
                          src={company.logo}
                          alt={`${company.name} logo`}
                          fill
                          sizes="132px"
                          className="logo-mono object-contain object-left"
                        />
                      </div>
                      <h2 className="mt-5 font-serif text-[1.375rem] tracking-[-0.017em] text-ink transition-colors duration-300 ease-kofa group-hover/co:text-teal">
                        {company.name}
                      </h2>
                      <p className="type-body-sm mt-2.5 max-w-[46ch]">
                        {company.shortDescription}
                      </p>
                    </div>
                    <span className="mt-1 shrink-0 text-ink-mute transition-all duration-300 ease-kofa group-hover/co:translate-x-1 group-hover/co:-translate-y-1 group-hover/co:text-teal">
                      <Arrow size={17} dir="up-right" />
                    </span>
                  </Link>
                </div>
              </Rise>
            )}
          </div>
        </Container>

        {/* ---------- related articles ---------- */}
        {related.length > 0 && (
          <Section className="mt-[clamp(4rem,8vw,7rem)] border-t border-rule bg-sage-bg">
            <Container>
              <div className="mx-auto max-w-[50rem]">
                <Eyebrow tone="mute">Related</Eyebrow>
                <h2 className="type-section mt-6 text-ink">Keep reading</h2>
                <div className="mt-10">
                  {/* A single-column stack of rows, so each one comes in from
                      the left, 0.06s apart, and the list assembles downward. */}
                  {related.map((r, i) => (
                    <Rise key={r.slug} from="left" delay={i * 0.06} as="div">
                      <NewsCard item={r} variant="row" />
                    </Rise>
                  ))}
                  <div className="h-px w-full bg-rule" />
                </div>
                <div className="mt-10">
                  <TextLink href="/news">All news</TextLink>
                </div>
              </div>
            </Container>
          </Section>
        )}
      </article>
    </>
  );
}
