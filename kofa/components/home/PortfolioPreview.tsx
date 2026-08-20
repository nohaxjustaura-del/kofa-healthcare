import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { TextLink } from "@/components/ui/Button";
import { AnimatedDivider, Reveal } from "@/components/motion/Reveal";
import { Rise } from "@/components/motion/Rise";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { featuredPortfolio, portfolio } from "@/data/portfolio";

/* ---------------------------------------------------------------------------
   The editorial rhythm of this grid is deliberate: 7/5, then 5/7, then a
   half-empty final row. The alternating asymmetry keeps the eye moving, and
   the gap in the last row is where the section's exit link lives, whitespace
   doing work rather than whitespace left over.
--------------------------------------------------------------------------- */

const LAYOUT = [
  { span: "lg:col-span-7", size: "feature", offset: "", lean: "left" },
  { span: "lg:col-span-5", size: "standard", offset: "lg:mt-24", lean: "right" },
  { span: "lg:col-span-5", size: "standard", offset: "", lean: "left" },
  { span: "lg:col-span-7", size: "feature", offset: "lg:mt-24", lean: "right" },
  { span: "lg:col-span-4", size: "compact", offset: "", lean: "left" },
  { span: "lg:col-span-4", size: "compact", offset: "lg:mt-14", lean: "right" },
] as const;

export function PortfolioPreview() {
  const companies = featuredPortfolio.slice(0, 6);

  return (
    <Section
      space="roomy"
      className="border-t border-rule bg-sage-bg"
      id="portfolio-preview"
    >
      <Container>
        <div className="grid grid-cols-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <Eyebrow index="01">Selected portfolio</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <SectionHeading className="mt-7 max-w-[16ch]">
                Backing the next generation of healthcare innovation.
              </SectionHeading>
            </Reveal>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.12}>
              <p className="type-body-sm max-w-[38ch]">
                {portfolio.length} companies across cardiovascular, women's
                health, diagnostics, orthopedics and digital health, from seed
                stage through commercial.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-[clamp(3rem,6vw,5.5rem)] grid grid-cols-12 gap-x-0 sm:gap-x-8 gap-y-[clamp(3.5rem,6vw,6rem)]">
          {companies.map((company, i) => {
            const l = LAYOUT[i];
            return (
              <Rise
                key={company.slug}
                as="div"
                from={l.lean}
                delay={i % 2 === 0 ? 0 : 0.08}
                className={`col-span-12 sm:col-span-6 ${l.span} ${l.offset}`}
              >
                <PortfolioCard company={company} size={l.size} />
              </Rise>
            );
          })}

          {/* Exit link sits in the deliberate gap of the final row */}
          <div className="col-span-12 flex items-end lg:col-span-3 lg:col-start-10">
            <Reveal delay={0.1} className="w-full">
              <AnimatedDivider />
              <div className="mt-7">
                <TextLink href="/portfolio">
                  View all {portfolio.length} companies
                </TextLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
