import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { imageCredits } from "@/data/credits";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/data/site";

/* The attributions the homepage imagery's licences require, in one public
   place. Creative Commons asks for credit "in any reasonable manner based on
   the medium"; for a website that is a page like this one, linked from the
   footer of every page, so the images themselves can stay clean of captions
   as the client asked. Noindex: it is a legal obligation, not a destination. */
export const metadata: Metadata = pageMetadata({
  title: "Image Credits",
  description: `Credits and licences for imagery used on the ${site.name} website.`,
  path: "/credits",
  robots: { index: false, follow: true },
});

const linkClass =
  "text-teal-deep underline decoration-teal/40 underline-offset-4 transition-colors hover:decoration-teal";

export default function CreditsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        lines={["Image Credits"]}
        intro="Historical and contemporary medical imagery is credited below. The final Future scene is an original AI-generated concept of precision surgery, rather than a real clinical setting."
      />

      <Section className="border-t border-rule">
        <Container>
          <div className="mx-auto max-w-[52rem]">
            <ol className="divide-y divide-rule border-y border-rule">
              {imageCredits.map((credit) => (
                <li key={credit.title} className="grid gap-3 py-8 sm:grid-cols-[13rem_1fr] sm:gap-10">
                  <div>
                    <p className="text-base font-medium text-ink">{credit.subject}</p>
                    <p className="type-body-xs mt-1">{credit.usedOn}</p>
                  </div>
                  <div className="type-body-sm space-y-2">
                    <p>
                      <span className="text-ink">“{credit.title}”</span> by {credit.author}, via{" "}
                      <a className={linkClass} href={credit.source.href} target="_blank" rel="noopener noreferrer">
                        {credit.source.label}
                      </a>
                      , licensed{" "}
                      <a className={linkClass} href={credit.license.href} target="_blank" rel="noopener noreferrer license">
                        {credit.license.label}
                      </a>
                      .
                    </p>
                    <p className="text-ink-mute">{credit.changes}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="type-body-sm mt-10 max-w-[60ch]">
              The homepage film is edited together from the footage and
              photographs credited above. Portfolio company logos and product
              imagery belong to their respective companies.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
