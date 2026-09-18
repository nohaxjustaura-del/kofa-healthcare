import type { Metadata } from "next";
import { BodyCopy, Container, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { CTASection } from "@/components/ui/CTASection";
import { pageMetadata } from "@/lib/metadata";

const FOCUS_AREAS = [
  {
    title: "Cardiovascular Innovation",
    body: "We invest in differentiated technologies across structural heart, electrophysiology, minimally invasive intervention and other high-growth areas.",
  },
  {
    title: "Advancing Women’s Health",
    body: "We invest across gynecology, maternal health, reproductive care and conditions that uniquely or disproportionately affect women.",
  },
  {
    title: "Beyond Our Core",
    body: "The most important innovations do not always fit neatly into a category. We remain open to exceptional opportunities across other clinical specialties.",
  },
] as const;

export const metadata: Metadata = pageMetadata({
  title: "Focus Areas",
  description:
    "We invest in differentiated technologies across structural heart, electrophysiology, minimally invasive intervention and other high-growth areas.",
  path: "/focus-areas",
});

export default function FocusAreasPage() {
  return (
    <>
      <PageHero eyebrow="Focus Areas" lines={["Focus Areas"]} />

      <Section className="border-t border-rule bg-white">
        <Container>
          <div className="grid grid-cols-1 border-t border-rule lg:grid-cols-3">
            {FOCUS_AREAS.map((area, index) => (
              <article
                key={area.title}
                className={`min-h-[17rem] border-b border-rule py-9 lg:border-b-0 lg:py-11 ${
                  index === 0 ? "" : "lg:border-l lg:pl-9"
                } ${index === FOCUS_AREAS.length - 1 ? "lg:pr-0" : "lg:pr-9"}`}
              >
                <h2 className="type-statement max-w-[17ch] text-ink">
                  {area.title}
                </h2>
                <BodyCopy className="mt-6 max-w-[37ch]">{area.body}</BodyCopy>
              </article>
            ))}
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
