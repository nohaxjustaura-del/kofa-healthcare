import type { Metadata } from "next";
import { BodyCopy, Container, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { CTASection } from "@/components/ui/CTASection";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Our Approach",
  description:
    "Backed by permanent family-office capital, we take a patient, founder-aligned approach: investing in exceptional technologies, clinical needs and teams rather than fixed fund timelines.",
  path: "/our-approach",
});

export default function OurApproachPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Approach"
        lines={["We Invest When Conviction Matters Most"]}
      />

      <Section className="border-t border-rule bg-white">
        <Container>
          <div className="grid grid-cols-12 gap-y-12">
            <p className="type-statement col-span-12 max-w-[30ch] text-ink lg:col-span-7">
              Backed by permanent family-office capital, we take a patient,
              founder-aligned approach: investing in exceptional technologies,
              clinical needs and teams rather than fixed fund timelines.
            </p>
            <div className="col-span-12 border-l border-rule pl-6 lg:col-span-6 lg:col-start-7 lg:pl-9">
              <BodyCopy size="lg" className="max-w-[47ch]">
                We partner early, often before the technology or regulatory
                pathway is fully de-risked. We look for clinical evidence that
                supports the mechanism of action and establishes a credible
                path forward.
              </BodyCopy>
              <BodyCopy className="mt-7 max-w-[53ch]">
                Beyond capital, we help founders shape clinical strategy,
                design first-in-human studies, engage with the FDA and build
                strong investor syndicates. Our medtech operating experience
                and U.S. to China network can also connect portfolio companies
                with clinical, manufacturing and commercial partners.
              </BodyCopy>
            </div>
          </div>
        </Container>
      </Section>

      <CTASection
        lines={["Building the Next Breakthrough in MedTech?"]}
        body="If you are developing a differentiated medical device for a significant unmet clinical need, let’s start a conversation."
        action={{ label: "Connect With KOFA Healthcare", href: "/contact" }}
      />
    </>
  );
}
