import Image from "next/image";
import {
  Container,
  Eyebrow,
  Meta,
  Section,
} from "@/components/ui/primitives";
import { TextLink } from "@/components/ui/Button";
import { ImageReveal } from "@/components/motion/Reveal";
import { Rise } from "@/components/motion/Rise";
import { Lag } from "@/components/motion/Lag";
import { Parallax } from "@/components/motion/Parallax";
import { CompanyVisual } from "@/components/portfolio/CompanyVisual";
import { getCompany } from "@/data/portfolio";

/* ---------------------------------------------------------------------------
   FEATURED PORTFOLIO STORY
   ---------------------------------------------------------------------------
   One company, given the space of a spread. The ground shifts to pale sage for
   the length of the section, which is what stops the page reading as a
   directory. Which company appears is a single CMS value.
--------------------------------------------------------------------------- */

export function PortfolioStory({ slug = "axena-health" }: { slug?: string }) {
  const company = getCompany(slug);
  if (!company) return null;

  return (
    <Section
      space="roomy"
      id="story"
      className="border-t border-rule bg-sage-bg-deep"
      aria-labelledby="story-heading"
    >
      <Container>
        <div className="grid grid-cols-12 items-center gap-x-0 sm:gap-x-8 gap-y-12">
          {/* --- visual --- */}
          <div className="col-span-12 lg:col-span-6">
            {/* The visual lags the copy beside it, the one place on the
                homepage where two columns move at different rates. */}
            <Lag amount={0.05}>
            <ImageReveal className="relative aspect-[5/4] w-full overflow-hidden rounded-[12px] border border-rule-soft">
              {/* Lag moves the tile within the layout; Parallax moves the
                  picture within the tile. The two different rates are the
                  point, and are the only place on the homepage where one
                  column has depth of its own. */}
              <Parallax amount={0.1}>
                <CompanyVisual
                  slug={company.slug}
                  category={company.category}
                  featuredImage={company.featuredImage}
                  name={company.name}
                  reactive={false}
                />
              </Parallax>
            </ImageReveal>
            </Lag>
            <div className="mt-4 flex items-center justify-between">
              <Meta>{company.focus}</Meta>
              <Meta>{company.category}</Meta>
            </div>
          </div>

          {/* --- editorial --- */}
          {/* The whole editorial column enters from the right, against the
              visual on the left, which is already lagging the scroll. Two
              columns, two different rates, leaning toward each other. */}
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <Rise from="right">
              <Eyebrow index="03">Portfolio story</Eyebrow>
            </Rise>

            <Rise from="right" delay={0.08}>
              <div className="relative mt-9 h-8 w-[150px]">
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  fill
                  sizes="150px"
                  className="logo-plate object-contain object-left"
                />
              </div>
            </Rise>

            <Rise from="right" delay={0.14}>
              <h2
                id="story-heading"
                className="type-statement mt-8 max-w-[20ch] text-ink"
              >
                {company.shortDescription}
              </h2>
            </Rise>

            <Rise from="right" delay={0.2}>
              <p className="type-body mt-7 max-w-[48ch]">
                {company.description}
              </p>
            </Rise>

            <Rise from="right" delay={0.26}>
              <div className="mt-10 h-px w-full bg-rule" />
              <div className="mt-7 flex flex-wrap items-center gap-x-10 gap-y-4">
                <TextLink href={`/portfolio/${company.slug}`}>
                  Explore {company.name}
                </TextLink>
                <TextLink
                  href={company.website}
                  external
                  dir="up-right"
                  tone="teal"
                >
                  Visit website
                </TextLink>
              </div>
            </Rise>
          </div>
        </div>
      </Container>
    </Section>
  );
}
