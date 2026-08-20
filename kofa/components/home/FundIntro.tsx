import { Fragment } from "react";
import {
  BodyCopy,
  Container,
  Eyebrow,
  Section,
} from "@/components/ui/primitives";
import { TextLink } from "@/components/ui/Button";
import { AnimatedDivider, Reveal, LineReveal } from "@/components/motion/Reveal";
import { AreasBento } from "@/components/home/AreasBento";
import { site } from "@/data/site";

/* ---------------------------------------------------------------------------
   PURPOSE
   ---------------------------------------------------------------------------
   The statement, then where the money goes.

   The areas used to be a hover list beside a sticky node panel that drew one
   cluster at a time. It read well and showed one sixth of itself at once; the
   five clusters you were not pointing at were the interesting part. The list
   is now components/home/AreasBento.tsx, where all six are on screen together
   and the card sizes carry the distinction the list could not: the four areas
   KOFA names verbatim are wide, the two its portfolio merely implies are
   narrow.

   No client state survives that change, so this is a server component again.
   The entrance animations are client components imported into it, which is
   the normal arrangement and costs this file nothing.
--------------------------------------------------------------------------- */

export function FundIntro() {
  return (
    <Section className="relative border-t border-rule bg-ivory" id="purpose">
      <Container>
        {/* --- statement / description --- */}
        <div className="grid grid-cols-12 gap-y-12">
          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <Eyebrow>Our purpose</Eyebrow>
            </Reveal>
            <p className="type-display-sm mt-8 max-w-[19ch] text-ink">
              <LineReveal
                lines={[
                  "We back healthcare",
                  "innovators solving",
                  <Fragment key="difficult">
                    <span className="accent-italic">difficult</span> clinical
                  </Fragment>,
                  "problems.",
                ]}
              />
            </p>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.12} className="lg:pt-[6.5rem]">
              <AnimatedDivider />
              <BodyCopy className="mt-7" size="lg">
                {site.intro}
              </BodyCopy>
              <BodyCopy className="mt-5">{site.about}</BodyCopy>
              <div className="mt-8">
                <TextLink href="/fund">Read our approach</TextLink>
              </div>
            </Reveal>
          </div>
        </div>

        {/* --- investment areas --- */}
        <div className="mt-[clamp(4.5rem,8vw,8rem)]">
          <div className="grid grid-cols-12 items-end gap-y-6">
            <div className="col-span-12 lg:col-span-7">
              <Reveal>
                <Eyebrow tone="mute">Where we invest</Eyebrow>
              </Reveal>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <Reveal delay={0.08}>
                <p className="type-body-sm max-w-[38ch] text-ink-soft">
                  Counts reflect companies currently published in the
                  portfolio.
                </p>
              </Reveal>
            </div>
          </div>

          <div className="mt-10">
            <AreasBento />
          </div>
        </div>
      </Container>
    </Section>
  );
}
