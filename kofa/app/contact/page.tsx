import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/primitives";
import { ContactForm } from "@/components/ui/ContactForm";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/data/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with KOFA Healthcare about differentiated medical devices addressing significant unmet clinical needs.",
  path: "/contact",
  socialDescription: "Start a conversation with KOFA Healthcare.",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        lines={["Building the Next Breakthrough in MedTech?"]}
        intro="If you are developing a differentiated medical device for a significant unmet clinical need, let’s start a conversation."
      />

      <Section className="border-t border-rule bg-white">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <div>
              {/* teal-deep, not teal. .type-eyebrow is 11px, so it is small
                  text and needs 4.5:1 under WCAG 1.4.3. --color-teal
                  (#008E95) on white measures 3.96:1 and fails; --color-teal-deep
                  (#006A70) makes 6.36:1. Every other eyebrow on the site
                  already uses teal-deep — these were the two stragglers. */}
              <p className="type-eyebrow text-teal-deep">
                Connect With KOFA Healthcare
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-5 inline-block text-xl font-medium text-ink underline decoration-teal/40 underline-offset-8 transition-colors hover:text-teal"
              >
                {site.email}
              </a>
              <p className="type-body mt-8 max-w-[34ch]">
                Tell us about the clinical need, the device and the team building it.
              </p>
            </div>
            <ContactForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
