import { Container, Section } from "@/components/ui/primitives";
import { Button, TextLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { LineReveal } from "@/components/motion/Reveal";
import { Rise } from "@/components/motion/Rise";
import { ScientificBackground } from "@/components/motion/ScientificBackground";
import { site } from "@/data/site";

/* ---------------------------------------------------------------------------
   CLOSING CTA
   ---------------------------------------------------------------------------
   Pale sage ground, one very faint pass of the network, and almost nothing
   else. This is the quietest section on the page by design: the last thing
   the reader meets should feel like an open door, not a pitch.
--------------------------------------------------------------------------- */

export function CTASection({
  heading = (
    <>
      Building something that could <span className="accent-italic">change</span>{" "}
      healthcare?
    </>
  ),
  lines,
  body = "We are always interested in meeting teams working on meaningful solutions to important clinical challenges.",
  action = { label: "Start a conversation", href: "/contact" },
  id,
}: {
  heading?: React.ReactNode;
  lines?: React.ReactNode[];
  body?: string;
  action?: { label: string; href: string };
  /** Optional in-page anchor. Only the homepage sets one, for the chapter
   *  rail; the other five pages that use this section stay anchor-less. */
  id?: string;
}) {
  return (
    <Section
      space="roomy"
      id={id}
      className="relative overflow-hidden border-t border-rule bg-sage-bg"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <ScientificBackground
          density={0.55}
          intensity={0.65}
          linkDistance={190}
          interactive={false}
        />
      </div>

      <Container className="relative">
        <div className="grid grid-cols-12">
          <div className="col-span-12 lg:col-span-9 xl:col-span-8">
            <h2 className="type-display-sm max-w-[18ch] text-ink">
              {lines ? <LineReveal lines={lines} /> : heading}
            </h2>

            {/* Lateral entrance rather than a straight fade-up: the heading
                above arrives line by line from below, so the two elements that
                follow it come in from the left instead, and the block reads as
                one gesture assembling rather than three things fading. */}
            <Rise from="left" delay={0.14}>
              <p className="type-body-lg mt-9 max-w-[46ch]">{body}</p>
            </Rise>

            <Rise from="left" delay={0.24}>
              <div className="mt-11 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-9">
                <Magnetic>
                  <Button href={action.href}>{action.label}</Button>
                </Magnetic>
                <TextLink href={`mailto:${site.email}`} arrow={false}>
                  {site.email}
                </TextLink>
              </div>
            </Rise>
          </div>
        </div>
      </Container>
    </Section>
  );
}
