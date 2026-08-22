import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { TextLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Rise } from "@/components/motion/Rise";
import { NewsCard } from "@/components/news/NewsCard";
import { kofaNews, portfolioNews } from "@/data/news";

/* ---------------------------------------------------------------------------
   §12, PORTFOLIO NEWS
   One lead item on the left, three typographic rows on the right. The two
   halves are deliberately unequal in weight; a four-up grid of equal cards
   would flatten the hierarchy the section exists to create.
--------------------------------------------------------------------------- */

export function PortfolioNewsSection() {
  const [lead, ...rest] = portfolioNews.slice(0, 4);
  if (!lead) return null;

  return (
    <Section className="border-t border-rule bg-ivory" id="news">
      <Container>
        <div className="grid grid-cols-12 items-end gap-y-6">
          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <Eyebrow index="05">Portfolio news</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <SectionHeading className="mt-7">
                Progress across our portfolio.
              </SectionHeading>
            </Reveal>
          </div>
          <div className="col-span-12 lg:col-span-3 lg:col-start-10 lg:justify-self-end">
            <Reveal delay={0.12}>
              <TextLink href="/news?type=Portfolio+News">
                View portfolio news
              </TextLink>
            </Reveal>
          </div>
        </div>

        <div className="mt-[clamp(3rem,5vw,4.5rem)] grid grid-cols-12 gap-x-0 sm:gap-x-8 gap-y-12">
          {/* Lead from the left, the stack from the right: the 7/4 split is
              already asymmetric, and leaning the halves toward each other is
              what stops it reading as two unrelated blocks. */}
          <Rise from="left" as="div" className="col-span-12 lg:col-span-7">
            <NewsCard item={lead} variant="feature" />
          </Rise>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            {rest.map((item, i) => (
              <Rise
                key={item.slug}
                from="right"
                delay={0.06 + i * 0.08}
                as="div"
              >
                <NewsCard item={item} variant="stack" />
              </Rise>
            ))}
            <div className="h-px w-full bg-rule" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------------------
   §13, FROM KOFA
   Firm news kept visibly separate from portfolio news. Three items, laid out
   horizontally, no more.
--------------------------------------------------------------------------- */

export function KofaNewsSection() {
  const items = kofaNews.slice(0, 3);
  if (!items.length) return null;

  return (
    <Section space="tight" className="border-t border-rule bg-ivory pb-24">
      <Container>
        <div className="grid grid-cols-12 items-baseline gap-y-6">
          <div className="col-span-12 lg:col-span-5">
            <Reveal>
              <Eyebrow index="06">From KOFA</Eyebrow>
            </Reveal>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <Reveal delay={0.06}>
              <p className="type-body-sm max-w-[42ch]">
                Investments, fund news and where the firm has been active.
              </p>
            </Reveal>
          </div>
          <div className="col-span-12 lg:col-span-2 lg:justify-self-end">
            <Reveal delay={0.1}>
              <TextLink href="/news?type=KOFA+News">All KOFA news</TextLink>
            </Reveal>
          </div>
        </div>

        {/* A three-up row opens outward: the outer cards come in from their
            own side of the page and the middle one straight up, so the row
            spreads into place rather than sliding across as a unit. */}
        <div className="mt-12 grid grid-cols-1 gap-x-8 md:grid-cols-3">
          {items.map((item, i) => (
            <Rise
              key={item.slug}
              from={i === 0 ? "left" : i === items.length - 1 ? "right" : "up"}
              delay={i * 0.07}
              as="div"
            >
              <NewsCard item={item} variant="stack" />
            </Rise>
          ))}
        </div>
      </Container>
    </Section>
  );
}
