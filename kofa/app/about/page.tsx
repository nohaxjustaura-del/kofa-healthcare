import type { Metadata } from "next";
import { BodyCopy, Container, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { CTASection } from "@/components/ui/CTASection";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Founded in 2016 in West Lafayette, Indiana, KOFA Healthcare is a U.S.-based medtech fund investing globally in transformative medical devices.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        lines={["One Fund. A Long Horizon. An Enduring Commitment."]}
      />

      <Section className="border-t border-rule bg-white">
        <Container>
          <div className="grid grid-cols-12 gap-y-10">
            <p className="type-statement col-span-12 max-w-[29ch] text-ink lg:col-span-8">
              Founded in 2016 in West Lafayette, Indiana, KOFA Healthcare is a
              U.S.-based medtech fund investing globally in transformative
              medical devices.
            </p>
            <div className="col-span-12 border-l border-rule pl-6 lg:col-span-7 lg:col-start-5 lg:pl-9">
              <BodyCopy size="lg" className="max-w-[51ch]">
                With a presence in Boston and the San Francisco Bay Area, our
                investment team is supported by an accomplished network of
                clinical advisors and industry experts.
              </BodyCopy>
              <BodyCopy className="mt-7 max-w-[58ch]">
                As an evergreen fund backed by a family office, we are not
                constrained by traditional fundraising cycles or predetermined
                exit timelines. We invest based on conviction in the
                technology, clinical need and management team, and remain
                committed for the journey ahead.
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
