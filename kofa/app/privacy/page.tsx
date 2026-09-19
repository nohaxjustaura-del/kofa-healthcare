import type { Metadata } from "next";
import { Container, Eyebrow, Section } from "@/components/ui/primitives";
import { PageHero } from "@/components/ui/PageHero";
import { TextLink } from "@/components/ui/Button";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/data/site";

/* Noindex, but still built through the shared helper. This page declared no
   openGraph at all, so it inherited the root layout's, meaning a pasted
   /privacy link rendered a card titled "KOFA Healthcare · Empower Innovations
   …" and pointing at the homepage. Inheriting the wrong card is quieter than
   having none, and no less wrong. */
export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `Privacy policy for ${site.name}.`,
  path: "/privacy",
  robots: { index: false, follow: true },
});

/**
 * Deliberately not drafted here. A privacy policy is a legal document; writing
 * one on KOFA's behalf would be inventing commitments the firm has not made.
 * The page, its typography and its reading measure are ready, the text comes
 * from the CMS or from KOFA's counsel.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        lines={["Privacy Policy"]}
        intro="How KOFA Healthcare handles information collected through this website."
      />

      <Section className="border-t border-rule">
        <Container>
          <div className="mx-auto max-w-[46rem]">
            <div className="border-l-2 border-dashed border-sage pl-6">
              <Eyebrow tone="mute">Awaiting content</Eyebrow>
              <p className="type-body mt-4 max-w-[52ch]">
                This page is wired to the CMS but intentionally left unwritten.
                A privacy policy is a legal document, and its wording needs to
                come from KOFA, or KOFA&rsquo;s counsel, rather than from a
                template.
              </p>
              <p className="type-body mt-4 max-w-[52ch]">
                The existing policy published on kofahealthcare.com can be
                pasted in as-is. Headings, lists and links are all styled
                already; nothing further is needed on the design side.
              </p>
            </div>

            <div className="mt-12 h-px w-full bg-rule" />
            <div className="mt-8">
              <TextLink href={`mailto:${site.email}`} arrow={false}>
                Questions about privacy? {site.email}
              </TextLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
