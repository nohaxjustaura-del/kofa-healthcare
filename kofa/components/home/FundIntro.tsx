import { Fragment } from "react";
import Image from "next/image";
import {
  BodyCopy,
  Container,
  Eyebrow,
  Meta,
  Section,
} from "@/components/ui/primitives";
import { TextLink } from "@/components/ui/Button";
import {
  AnimatedDivider,
  ImageReveal,
  Reveal,
  LineReveal,
} from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { site } from "@/data/site";

/* ---------------------------------------------------------------------------
   PURPOSE
   ---------------------------------------------------------------------------
   One compact editorial spread: image on the left, purpose and fund copy on
   the right. The two halves share a baseline and a visual height, so neither
   leaves an empty half-screen underneath it.

   THIS SECTION USED TO CARRY THE INVESTMENT AREAS. First as a hover list
   beside a sticky node panel that drew one cluster at a time, then as a
   six-card bento where all six clusters were on screen together. Both are
   gone: the areas are named in the paragraph beside the statement, spelled
   out at length on /fund (components/fund/AreasAccordion.tsx), and were being
   said a third time here, in a grid that cost most of a screen.

   The claim is KOFA's own copy; the image is a real laboratory scene rather
   than a decorative stock block. On desktop they sit together in one spread;
   on mobile the plate leads naturally into the statement.

   Still a server component. The entrance animations are client components
   imported into it, which is the normal arrangement and costs this file
   nothing.
--------------------------------------------------------------------------- */

export function FundIntro() {
  return (
    <Section
      space="tight"
      className="relative border-y border-rule bg-sage-bg"
      id="purpose"
    >
      <Container>
        <div className="grid grid-cols-12 gap-y-10 lg:items-stretch lg:gap-x-10 xl:gap-x-14">
          {/* The photograph now occupies the same row as the writing. The old
              layout put this seven-column plate on a second row, leaving the
              entire right half blank beneath the copy. This single change
              removes that false pause while preserving the asymmetric 7/5
              editorial measure. */}
          <figure className="col-span-12 flex flex-col lg:col-span-7">
            <ImageReveal className="relative aspect-[4/3] w-full flex-1 overflow-hidden rounded-[14px] border border-rule-soft lg:aspect-auto lg:min-h-[34rem]">
              <Parallax amount={0.08}>
                <Image
                  src="/media/home/researchers-lab.jpg"
                  alt="Two researchers at the bench in a clean laboratory."
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover object-center"
                />
              </Parallax>

              <div
                aria-hidden
                className="absolute left-5 top-5 z-10 rounded-full border border-white/40 bg-white/85 px-4 py-2 backdrop-blur-sm"
              >
                <span className="type-eyebrow text-teal">Science in practice</span>
              </div>
            </ImageReveal>

            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <Meta>Healthcare research</Meta>
              <Meta>Library photography, pending KOFA&rsquo;s own</Meta>
            </figcaption>
          </figure>

          <div className="col-span-12 flex flex-col lg:col-span-5 lg:py-2">
            <Reveal>
              <Eyebrow>Our purpose</Eyebrow>
            </Reveal>
            <p className="type-display-sm mt-7 max-w-[15ch] text-ink">
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

            <Reveal delay={0.12} className="mt-9">
              <AnimatedDivider />
              <BodyCopy className="mt-6" size="lg">
                {site.intro}
              </BodyCopy>
              <BodyCopy className="mt-4">{site.about}</BodyCopy>
              <div className="mt-7">
                <TextLink href="/fund">Read our approach</TextLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
