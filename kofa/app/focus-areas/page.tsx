import type { Metadata } from "next";
import { BodyCopy, Container, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { CTASection } from "@/components/ui/CTASection";
import { FocusGlyph } from "@/components/visuals/plates";
import { focusAreas } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";

/* The three areas and their copy come from data/site.ts, which the homepage
   reads too, so the two cannot drift. Everything there is verbatim from the
   supplied content document; nothing on this page says anything the document
   does not. The drawn mark on each card is selected by that record's `glyph`
   field and carries no claim of its own. */

export const metadata: Metadata = pageMetadata({
  title: "Focus Areas",
  description: focusAreas[0].body,
  path: "/focus-areas",
});

export default function FocusAreasPage() {
  return (
    <>
      {/* Headline is the supplied section title, unchanged. */}
      <PageHero eyebrow="Focus Areas" lines={["Focus Areas"]} />

      <Section className="border-t border-rule bg-white">
        <Container>
          {/* gap-px over a rule-coloured ground draws the dividers, so the
              three cards share one hairline grid instead of each carrying its
              own border and doubling up where they meet. */}
          <div className="grid grid-cols-1 gap-px bg-rule lg:grid-cols-3">
            {focusAreas.map((area, index) => (
              <article
                key={area.title}
                className="group relative flex min-h-[23rem] flex-col bg-white pb-10 pt-9 lg:px-9 lg:pt-11 lg:first:pl-0 lg:last:pr-0"
              >
                <div className="flex items-start justify-between gap-6">
                  <FocusGlyph
                    kind={area.glyph}
                    className="h-24 w-24 text-teal transition-colors duration-500 group-hover:text-teal-deep"
                  />
                  <span
                    aria-hidden
                    className="text-xs font-medium tabular-nums tracking-[0.16em] text-ink-mute"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <span aria-hidden className="mt-9 block h-px w-10 bg-teal" />

                <h2 className="mt-6 max-w-[17ch] text-[1.6rem] font-normal leading-[1.2] tracking-[-0.022em] text-ink">
                  {area.title}
                </h2>
                <BodyCopy className="mt-5 max-w-[38ch]">{area.body}</BodyCopy>
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
