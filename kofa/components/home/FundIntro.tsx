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
   The statement, and then a picture.

   THIS SECTION USED TO CARRY THE INVESTMENT AREAS. First as a hover list
   beside a sticky node panel that drew one cluster at a time, then as a
   six-card bento where all six clusters were on screen together. Both are
   gone: the areas are named in the paragraph beside the statement, spelled
   out at length on /fund (components/fund/AreasAccordion.tsx), and were being
   said a third time here, in a grid that cost most of a screen.

   What is left is the shape the section always wanted, a claim and an image.
   The claim is KOFA's own copy; the image is a plate, deliberately shallow,
   sitting where the grid was. See the note at the plate itself.

   Still a server component. The entrance animations are client components
   imported into it, which is the normal arrangement and costs this file
   nothing.
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

        {/* --- the plate ---
            What closes the section now that the areas grid has gone. A wide,
            shallow crop rather than a square: this section's argument is the
            sentence at the top, and a tall frame under it would turn the
            sentence into a caption.

            SEVEN COLUMNS, NOT TWELVE, AND THAT IS A RESOLUTION DECISION AS
            MUCH AS A COMPOSITIONAL ONE. The source is 960px on its longest
            edge, which is all the licence-free original offers. Across the
            full measure it would be upscaled about 1.5x and would visibly
            soften on a large display; at seven columns the 16:9 crop is being
            scaled DOWN on every screen this site is designed for. The empty
            columns beside it are the same device the portfolio grid uses,
            whitespace doing work rather than whitespace left over.

            ImageReveal uncovers it; Parallax moves the photograph inside the
            frame as the page scrolls, so the plate has a rate of its own. The
            nesting order matters: ImageReveal owns the clip, Parallax owns the
            transform, and swapping them puts a travelling element inside a
            static mask. */}
        {/* The credit is a CAPTION, so it sits under the plate rather than in
            a column of its own.

            It used to occupy columns 9-11 with `self-end`, which aligned its
            baseline to the bottom of a 525px-tall image four columns away. The
            result was a 178px scrap of grey type stranded at the far right of
            the row with ~355px of empty ivory between it and the picture it
            described, and the eye read that gap as the section having ended.
            A caption belongs to its image; the grid was separating the two to
            satisfy a column rule that has no business overriding that. */}
        <figure className="mt-[clamp(3rem,5vw,5rem)] grid grid-cols-12">
          <div className="col-span-12 lg:col-span-7">
            <ImageReveal className="relative aspect-[16/10] w-full overflow-hidden rounded-[12px] border border-rule-soft">
              <Parallax amount={0.1}>
                <Image
                  src="/media/operating-theatre.jpg"
                  alt="A surgical team at work under an operating theatre light."
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              </Parallax>
            </ImageReveal>

            {/* Printed rather than assumed: a CC0 photograph needs no
                attribution, but a reader is entitled to know that this is
                library material and not KOFA's own theatre. Same reasoning as
                the caption under the film band. See public/media/CREDITS.md. */}
            <figcaption className="mt-4">
              <Meta>
                Operating theatre. Public-domain photography, CC0, pending
                KOFA's own.
              </Meta>
            </figcaption>
          </div>
        </figure>
      </Container>
    </Section>
  );
}
