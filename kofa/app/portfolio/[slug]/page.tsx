import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BodyCopy,
  Container,
  Eyebrow,
  Meta,
  Section,
} from "@/components/ui/primitives";
import { TextLink } from "@/components/ui/Button";
import { Arrow } from "@/components/ui/Arrow";
import { CompanyLogo } from "@/components/portfolio/CompanyLogo";
import { CompanyVisual } from "@/components/portfolio/CompanyVisual";
import { NewsCard } from "@/components/news/NewsCard";
import { CTASection } from "@/components/ui/CTASection";
import {
  companyNeighbours,
  getCompany,
  portfolio,
  portfolioSorted,
} from "@/data/portfolio";
import { newsForCompany } from "@/data/news";
import { pageMetadata, siteUrl } from "@/lib/metadata";
import { site } from "@/data/site";

type Params = { params: Promise<{ slug: string }> };

/* Re-rendered daily so news older than the window in data/news.ts drops
   out of the "Latest from" list without a new deploy. */
export const revalidate = 86400;

export function generateStaticParams() {
  return portfolio.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) return { title: "Not found" };

  /* Company pages are the ones that actually get forwarded, a partner sends
     one round rather than the fund's homepage, so this is the route where a
     blank card cost the most. It is also the route the shared helper matters
     most on: there are as many of these as there are portfolio companies, and
     the hand-written openGraph here was silently dropping og:site_name,
     og:locale and the image from all of them at once. See lib/metadata.ts. */
  return pageMetadata({
    title: company.name,
    description: company.shortDescription,
    path: `/portfolio/${company.slug}`,
    socialTitle: `${company.name} · KOFA Healthcare portfolio`,
    type: "profile",
  });
}

export default async function CompanyPage({ params }: Params) {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) notFound();

  const related = newsForCompany(company.slug);
  const { prev, next } = companyNeighbours(company.slug);
  const position = portfolioSorted.findIndex((c) => c.slug === company.slug) + 1;

  const facts = [
    company.status && { k: "Status", v: company.status },
    company.location && { k: "Location", v: company.location },
    company.investmentYear && {
      k: "Invested",
      v: String(company.investmentYear),
    },
    { k: "Category", v: company.category },
    { k: "Focus", v: company.focus },
  ].filter(Boolean) as { k: string; v: string }[];

  /* Crawlable description: the page never depends on JS for its content. */
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: company.description,
    url: company.website,
    funder: { "@type": "Organization", name: site.name, url: siteUrl },
  };

  /** Never let a malformed CMS URL take the whole page down. */
  const displayHost = (() => {
    try {
      return new URL(company.website).hostname.replace(/^www\./, "");
    } catch {
      return "company website";
    }
  })();

  /* An acquired company's link points at the acquisition announcement rather
     than a live site, so labelling it "Visit …" would misdescribe it. */
  const acquired = company.status?.toLowerCase().startsWith("acquired");
  const linkLabel = acquired
    ? "Read the acquisition announcement"
    : `Visit ${displayHost}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="relative overflow-hidden pb-[clamp(2.5rem,4vw,4rem)] pt-[clamp(9rem,13vw,12rem)]">
        <Container>

          <div>
            <Link
              href="/portfolio"
              className="group/link -my-1.5 inline-flex items-center gap-2.5 py-1.5 text-[0.8125rem] font-medium text-ink-soft transition-colors duration-300 ease-kofa hover:text-teal-deep"
            >
              <Arrow
                size={14}
                dir="left"
                className="transition-transform duration-300 ease-kofa group-hover/link:-translate-x-1"
              />
              All portfolio
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-12 gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              {/* A fixed-height row, logos sitting on its floor, so the name
                  below starts at the same height on every company's page
                  whatever the shape of its logo. */}
              <div className="flex h-16 items-end [--logo-base:4.5rem] [--logo-max-h:4rem] [--logo-max-w:13rem]">
                <CompanyLogo company={company} priority className="logo-plate" />
              </div>

              <div>
                <h1 className="type-display mt-9 text-ink">{company.name}</h1>
              </div>

              <div>
                <p className="type-statement mt-7 max-w-[24ch] text-ink-soft">
                  {company.shortDescription}
                </p>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:self-end">
              <div>
                <dl className="border-t border-rule">
                  {facts.map((f) => (
                    <div
                      key={f.k}
                      className="flex items-baseline justify-between gap-6 border-b border-rule py-4"
                    >
                      <dt className="type-eyebrow text-ink-soft">{f.k}</dt>
                      <dd className="text-right text-[0.875rem] text-ink">
                        {f.v}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8">
                  <TextLink
                    href={company.website}
                    external
                    dir="up-right"
                    tone="teal"
                  >
                    {linkLabel}
                  </TextLink>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <div>
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[12px] border border-rule-soft">
          <CompanyVisual
            slug={company.slug}
            category={company.category}
            media={company.media}
            featuredImage={company.featuredImage}
            name={company.name}
            reactive={false}
            playable
            priority
            sizes="(max-width: 1280px) 100vw, 1200px"
          />
        </div>
        </div>
        {!company.media && !company.featuredImage && (
          <p className="type-meta mt-3 text-ink-soft">
            Abstract visualisation. Company imagery renders here when supplied.
          </p>
        )}
      </Container>

      <Section className="border-t border-rule mt-[clamp(4rem,7vw,6.5rem)]">
        <Container>

          <div className="grid grid-cols-12 gap-y-10">
            <div className="col-span-12 lg:col-span-3">
              <div>
                <Eyebrow index={String(position).padStart(2, "0")}>
                  {company.category}
                </Eyebrow>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7 lg:col-start-5">
              <div>
                <BodyCopy size="lg" className="max-w-[62ch] text-ink">
                  {company.description}
                </BodyCopy>
              </div>
              <div>
                <div className="mt-10">
                  <TextLink href={company.website} external dir="up-right">
                    {acquired ? "Read the acquisition announcement" : "Visit company website"}
                  </TextLink>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section className="border-t border-rule bg-sage-bg">
          <Container>

            <div className="grid grid-cols-12 items-baseline gap-y-6">
              <div className="col-span-12 lg:col-span-8">
                <div>
                  <Eyebrow tone="mute">Latest</Eyebrow>
                </div>
                <div>
                  <h2 className="type-section mt-6 text-ink">
                    Latest from {company.name}
                  </h2>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-3 lg:col-start-10 lg:justify-self-end">
                <div>
                  <Meta>
                    {related.length} {related.length === 1 ? "item" : "items"}
                  </Meta>
                </div>
              </div>
            </div>

            <div className="mt-12">

              {related.map((item) => (
                <div key={item.slug}>
                  <NewsCard item={item} variant="row" />
                </div>
              ))}
              <div className="h-px w-full bg-rule" />
            </div>
          </Container>
        </Section>
      )}

      <Section space="tight" className="border-t border-rule">
        <Container>

          <nav
            aria-label="Portfolio navigation"
            className="grid grid-cols-1 items-center gap-8 md:grid-cols-3"
          >
            {prev ? (
              <div className="min-w-0">
                <Link
                  href={`/portfolio/${prev.slug}`}
                  className="group/link block min-w-0"
                >
                  <span className="type-eyebrow text-ink-soft">Previous</span>
                  <span className="mt-2.5 flex items-center gap-3 text-[1.0625rem] font-sans text-ink transition-colors duration-300 ease-kofa group-hover/link:text-teal-deep">
                    <Arrow
                      size={15}
                      dir="left"
                      className="shrink-0 transition-transform duration-300 ease-kofa group-hover/link:-translate-x-1"
                    />
                    <span className="truncate">{prev.name}</span>
                  </span>
                </Link>
              </div>
            ) : (
              <span />
            )}

            <div>
              <div className="md:text-center">
                <TextLink href="/portfolio" arrow={false} tone="teal">
                  All portfolio
                </TextLink>
              </div>
            </div>

            {next ? (
              <div className="min-w-0">
                <Link
                  href={`/portfolio/${next.slug}`}
                  className="group/link block min-w-0 md:text-right"
                >
                  <span className="type-eyebrow text-ink-soft">Next</span>
                  <span className="mt-2.5 flex items-center gap-3 text-[1.0625rem] font-sans text-ink transition-colors duration-300 ease-kofa group-hover/link:text-teal-deep md:justify-end">
                    <span className="truncate">{next.name}</span>
                    <Arrow
                      size={15}
                      className="shrink-0 transition-transform duration-300 ease-kofa group-hover/link:translate-x-1"
                    />
                  </span>
                </Link>
              </div>
            ) : (
              <span />
            )}
          </nav>
        </Container>
      </Section>

      <CTASection
        lines={["Working on something", "in this field?"]}
        body="We are always interested in meeting teams working on meaningful solutions to important clinical challenges."
        action={{ label: "Introduce your company", href: "/contact" }}
      />
    </>
  );
}
