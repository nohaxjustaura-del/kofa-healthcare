import type { Metadata } from "next";
import Image from "next/image";
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
import { ImageReveal, Reveal } from "@/components/motion/Reveal";
import { Rise } from "@/components/motion/Rise";
import { Lag } from "@/components/motion/Lag";
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
import { site } from "@/data/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return portfolio.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) return { title: "Not found" };

  return {
    title: company.name,
    description: company.shortDescription,
    alternates: { canonical: `/portfolio/${company.slug}` },
    openGraph: {
      type: "profile",
      title: `${company.name} · KOFA Healthcare portfolio`,
      description: company.shortDescription,
      url: `/portfolio/${company.slug}`,
    },
  };
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
    funder: { "@type": "Organization", name: site.name, url: site.url },
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

      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden pb-[clamp(2.5rem,4vw,4rem)] pt-[clamp(7rem,11vw,10rem)]">
        <div
          aria-hidden
          className="bg-grid absolute inset-0 -z-10 opacity-55 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]"
        />
        <Container>
          {/* First mark on the page, with nothing above it to answer to, so
              it takes the house default and leads in from the left. */}
          <Rise from="left">
            <Link
              href="/portfolio"
              // -my-1.5/py-1.5 lifts the 19.5px line box past the 24px minimum.
              className="group/link -my-1.5 inline-flex items-center gap-2.5 py-1.5 text-[0.8125rem] font-medium text-ink-soft transition-colors duration-300 ease-kofa hover:text-teal"
            >
              <Arrow
                size={14}
                dir="left"
                className="transition-transform duration-300 ease-kofa group-hover/link:-translate-x-1"
              />
              All portfolio
            </Link>
          </Rise>

          {/* The 7/4 split closes on its own centre line: the identity column
              in from the left, the facts rail opposite it at col-start-9 from
              the right. The rule is at the top of components/motion/Rise.tsx.
              The three pieces of the left column arrive 60ms apart, so the
              column reads top to bottom rather than as one slab. */}
          <div className="mt-12 grid grid-cols-12 gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              <Rise from="left">
                <div className="relative h-9 w-[168px]">
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    fill
                    priority
                    sizes="168px"
                    className="logo-plate object-contain object-left"
                  />
                </div>
              </Rise>

              <Rise from="left" delay={0.06}>
                <h1 className="type-display mt-9 text-ink">{company.name}</h1>
              </Rise>

              <Rise from="left" delay={0.12}>
                <p className="type-statement mt-7 max-w-[24ch] text-ink-soft">
                  {company.shortDescription}
                </p>
              </Rise>
            </div>

            <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:self-end">
              <Rise from="right" delay={0.18}>
                <dl className="border-t border-rule">
                  {facts.map((f) => (
                    <div
                      key={f.k}
                      className="flex items-baseline justify-between gap-6 border-b border-rule py-4"
                    >
                      <dt className="type-eyebrow text-ink-mute">{f.k}</dt>
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
              </Rise>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------- visual ---------- */}
      <Container>
        <Lag amount={0.035}>
        <ImageReveal className="relative aspect-[21/9] w-full overflow-hidden rounded-[12px] border border-rule-soft">
          <CompanyVisual
            slug={company.slug}
            category={company.category}
            featuredImage={company.featuredImage}
            name={company.name}
            reactive={false}
          />
        </ImageReveal>
        </Lag>
        {!company.featuredImage && (
          <p className="type-meta mt-3 text-ink-mute">
            Abstract visualisation. Company imagery renders here when supplied.
          </p>
        )}
      </Container>

      {/* ---------- description, 60/40 ---------- */}
      <Section className="border-t border-rule mt-[clamp(4rem,7vw,6.5rem)]">
        <Container>
          {/* The label at column 1 and the prose at column 5 are the section's
              two halves, not a heading over a body, so they lean toward each
              other the same way the hero's do. */}
          <div className="grid grid-cols-12 gap-y-10">
            <div className="col-span-12 lg:col-span-3">
              <Rise from="left">
                <Eyebrow index={String(position).padStart(2, "0")}>
                  {company.category}
                </Eyebrow>
              </Rise>
            </div>

            <div className="col-span-12 lg:col-span-7 lg:col-start-5">
              <Rise from="right" delay={0.06}>
                <BodyCopy size="lg" className="max-w-[62ch] text-ink">
                  {company.description}
                </BodyCopy>
              </Rise>
              <Rise from="right" delay={0.12}>
                <div className="mt-10">
                  <TextLink href={company.website} external dir="up-right">
                    {acquired ? "Read the acquisition announcement" : "Visit company website"}
                  </TextLink>
                </div>
              </Rise>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------- related news ---------- */}
      {related.length > 0 && (
        <Section className="border-t border-rule bg-sage-bg">
          <Container>
            {/* This row stays on the neutral Reveal on purpose. It is a
                heading over content rather than a half of it, and the section
                only has one arrival worth spending: if the header leans in
                too, the rows below stop being the thing that happens. Same
                call as the section headers on the homepage. */}
            <div className="grid grid-cols-12 items-baseline gap-y-6">
              <div className="col-span-12 lg:col-span-8">
                <Reveal>
                  <Eyebrow tone="mute">Latest</Eyebrow>
                </Reveal>
                <Reveal delay={0.06}>
                  <h2 className="type-section mt-6 text-ink">
                    Latest from {company.name}
                  </h2>
                </Reveal>
              </div>
              <div className="col-span-12 lg:col-span-3 lg:col-start-10 lg:justify-self-end">
                <Reveal delay={0.1}>
                  <Meta>
                    {related.length} {related.length === 1 ? "item" : "items"}
                  </Meta>
                </Reveal>
              </div>
            </div>

            <div className="mt-12">
              {/* A single-column stack of rows, so every one of them takes the
                  house default and leads in from the left. 70ms apart, and
                  capped, so a long list still finishes arriving while the
                  reader is still near the top of it. */}
              {related.map((item, i) => (
                <Rise
                  key={item.slug}
                  from="left"
                  delay={Math.min(i * 0.07, 0.21)}
                  as="div"
                >
                  <NewsCard item={item} variant="row" />
                </Rise>
              ))}
              <div className="h-px w-full bg-rule" />
            </div>
          </Container>
        </Section>
      )}

      {/* ---------- prev / all / next ---------- */}
      <Section space="tight" className="border-t border-rule">
        <Container>
          {/* A three-up row, and the only place on the page where the lean says
              something the layout cannot: previous is hung on the left edge and
              enters from the left, next is hung on the right and enters from
              the right, so the two ends close on the "All portfolio" link
              between them. The middle takes "up", which carries no skew, being
              a centred line with no side to come from. */}
          <nav
            aria-label="Portfolio navigation"
            className="grid grid-cols-1 items-center gap-8 md:grid-cols-3"
          >
            {prev ? (
              // The Rise div is the grid child now, so min-w-0 moves onto it or
              // the name below stops truncating, and the anchor needs an
              // explicit `block`: it was only ever a block box because grid
              // blockified it, and left inline it fragments around the flex row
              // and its hover target shrinks to the width of the word. That is
              // why NewsCard's Link carries one too.
              <Rise from="left" className="min-w-0">
                <Link
                  href={`/portfolio/${prev.slug}`}
                  className="group/link block min-w-0"
                >
                  <span className="type-eyebrow text-ink-mute">Previous</span>
                  <span className="mt-2.5 flex items-center gap-3 text-[1.0625rem] font-serif text-ink transition-colors duration-300 ease-kofa group-hover/link:text-teal">
                    <Arrow
                      size={15}
                      dir="left"
                      className="shrink-0 transition-transform duration-300 ease-kofa group-hover/link:-translate-x-1"
                    />
                    <span className="truncate">{prev.name}</span>
                  </span>
                </Link>
              </Rise>
            ) : (
              <span />
            )}

            <Rise from="up" delay={0.07}>
              <div className="md:text-center">
                <TextLink href="/portfolio" arrow={false} tone="teal">
                  All portfolio
                </TextLink>
              </div>
            </Rise>

            {next ? (
              // As above. The anchor keeps its own md:text-right, which works
              // again once `block` makes it a block box, so the wrapper carries
              // nothing but the grid child's min-w-0.
              <Rise from="right" delay={0.14} className="min-w-0">
                <Link
                  href={`/portfolio/${next.slug}`}
                  className="group/link block min-w-0 md:text-right"
                >
                  <span className="type-eyebrow text-ink-mute">Next</span>
                  <span className="mt-2.5 flex items-center gap-3 text-[1.0625rem] font-serif text-ink transition-colors duration-300 ease-kofa group-hover/link:text-teal md:justify-end">
                    <span className="truncate">{next.name}</span>
                    <Arrow
                      size={15}
                      className="shrink-0 transition-transform duration-300 ease-kofa group-hover/link:translate-x-1"
                    />
                  </span>
                </Link>
              </Rise>
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
