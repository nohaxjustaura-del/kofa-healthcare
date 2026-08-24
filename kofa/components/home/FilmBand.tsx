import Image from "next/image";
import { Container, Eyebrow, Meta, Section } from "@/components/ui/primitives";
import { ImageReveal, Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";

/* ===========================================================================
   VISUAL BREAK
   ---------------------------------------------------------------------------
   A single wide plate between the portfolio story and the team: a fetal
   ultrasound, held as a still. It is the page's quiet "medicine, broadly"
   moment — imaging rather than a device, monochrome rather than colour — and
   it deliberately keeps the homepage to ONE moving picture, the hero. This
   band used to carry a looping lab clip; the hero now owns the page's motion,
   so a second autoplaying video here only competed with it for attention (and
   for bandwidth). A still reads as a plate in a book, which is what a break
   between two dense sections wants to be.

   WHY IT IS NOT A DARK SECTION. The obvious build is full-bleed imagery under
   a teal wash with a headline over it. That is what components/home/Conviction
   already does, and its whole argument is that it is the page's one inverted
   moment. So this band stays on ivory and behaves like a letterbox plate: an
   eyebrow, a line, a caption, a rule.

   PROVENANCE. The image is library material, not KOFA's own scan, and the
   caption says so — the same honest reading the rest of the site takes with
   unapproved content. See public/media/CREDITS.md; swap the file and the
   credit follows.
=========================================================================== */

export function FilmBand() {
  return (
    <Section
      space="default"
      aria-labelledby="visual-break-caption"
      className="border-t border-rule bg-ivory"
    >
      <Container>
        <div className="grid grid-cols-12 items-end gap-y-6">
          <div className="col-span-12 lg:col-span-6">
            <Reveal>
              <Eyebrow tone="mute">Medicine, broadly</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <p
                id="visual-break-caption"
                className="type-statement mt-6 max-w-[24ch] text-ink"
              >
                From the first scan to the last mile of care.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>

      {/* --- the letterbox ---
          Full bleed and deliberately shallow: 21:9 on a wide screen crops the
          image to a band rather than a screen, which keeps it a plate in the
          page instead of a second hero. It opens to 16:9 on phones, where 21:9
          would be a stripe. Parallax moves the picture inside the frame as the
          page scrolls, so the plate has a rate of its own; ImageReveal owns the
          clip, Parallax owns the transform. */}
      <Reveal delay={0.1} y={28}>
        <figure className="mt-[clamp(2rem,3.5vw,3rem)]">
          <ImageReveal className="relative aspect-[16/9] max-h-[62svh] w-full overflow-hidden bg-[#0B2220] lg:aspect-[21/9]">
            <Parallax amount={0.08}>
              <Image
                src="/media/home/fetal-ultrasound.jpg"
                alt="A fetal ultrasound scan."
                fill
                sizes="100vw"
                className="object-cover"
              />
            </Parallax>
          </ImageReveal>

          <figcaption>
            <Container>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
                <Meta>Fetal ultrasound</Meta>
                <Meta>Library photography, pending KOFA&rsquo;s own</Meta>
              </div>
            </Container>
          </figcaption>
        </figure>
      </Reveal>
    </Section>
  );
}
