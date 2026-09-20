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
 * KOFA has not supplied approved privacy-policy copy. Until it does, this page
 * offers a truthful contact path without making legal promises on its behalf.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        lines={["Privacy Policy"]}
        intro="Contact KOFA Healthcare with questions about privacy or information submitted through this website."
      />

      <Section className="border-t border-rule">
        <Container>
          <div className="mx-auto max-w-[46rem]">
            <div className="border-l-2 border-dashed border-sage pl-6">
              <Eyebrow tone="mute">Privacy questions</Eyebrow>
              <p className="type-body mt-4 max-w-[52ch]">
                Questions about privacy or information submitted through this
                website can be sent to KOFA Healthcare at the address below.
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
