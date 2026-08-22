"use client";

import { Fragment, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { Button, TextLink } from "@/components/ui/Button";
import { ScientificBackground } from "@/components/motion/ScientificBackground";
import { CellularForm } from "@/components/motion/CellularForm";
import { LineReveal } from "@/components/motion/Reveal";
import { ParallaxLayers } from "@/components/ui/parallax-scrolling";

/* ===========================================================================
   PARALLAX HERO
   ---------------------------------------------------------------------------
   The same hero, given depth. Four planes separate as the section scrolls
   past, driven by the scrubbed stage in components/ui/parallax-scrolling.tsx:

     1  the scientific grid              farthest, barely moves
     2  the network field + the far cell
     3  the copy                         the reader's plane
     4  a near cell, rising from the     nearest, overtakes everything
        bottom-left corner

   The effect the whole thing exists for is layer 4 passing IN FRONT of layer 3
   on the way out. A near object crossing the reader's plane is the one cue
   that cannot be faked with a fade, and it is what makes the hero read as a
   space the page is moving through rather than a picture that scrolls away.

   WHY THE COPY IS ON A MIDDLE PLANE. The obvious arrangement puts the copy in
   front, but then nothing ever crosses it and the section is just three
   backgrounds moving at three speeds. Sitting the copy at 14 and the near cell
   at -16 gives 30 points of relative travel, which is enough for the crossing
   to be legible without the copy itself appearing to slide.

   DIVISION OF LABOUR WITH FRAMER MOTION. GSAP owns `transform` on the four
   layer elements and nothing else. The copy's scroll fade and every entrance
   animation stay with framer-motion, on DIFFERENT elements: the fade lives on
   a wrapper INSIDE layer 3, never on the layer element itself, so the two
   libraries never write the same property on the same node. Keep it that way.

   This is a drop-in replacement for components/hero/Hero.tsx: same copy, same
   metadata rail, same CTAs, same entrance choreography. Swap the import in
   app/page.tsx to go back.
=========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

/* Far to near. Tuned against a 92svh hero: at these values the near cell
   clears the headline about two thirds of the way through the section, which
   is where the reader's attention has already moved on. */
const DEPTHS = [52, 34, 14, -16] as const;

/** Small, factual, checkable. Not a statistic counter. */
const RAIL = [
  { k: "Established", v: "2016" },
  { k: "Structure", v: "Evergreen fund" },
  { k: "Portfolio", v: "16 companies" },
];

export function ParallaxHero() {
  const reduced = useMotionOff();
  const ref = useRef<HTMLElement>(null);

  /* Opacity only. The travel is GSAP's job now; this is the one thing left
     that has to be a MotionValue, because it is read by two different
     elements at two different rates.

     Reduced motion flattens the ranges rather than dropping the `style` prop.
     Both variants evaluate identically at scroll progress 0, so the server and
     the client emit the same markup: see the hydration note in
     components/motion/Reveal.tsx. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const copyOpacity = useTransform(
    scrollYProgress,
    [0, 0.72],
    reduced ? [1, 1] : [1, 0],
  );
  return (
    <ParallaxLayers depths={DEPTHS}>
      <section
        ref={ref}
        /* FULL FIRST FRAME. This was 92svh, which left a sliver of the next
           section showing under the metadata rail — enough to read as the page
           having started scrolling before you touched it, and not enough to
           show anything useful. A hero either fills the frame or it clearly
           does not; 92% is the one value that looks like neither.

           `svh` rather than `vh` or `dvh`, deliberately. On mobile `vh` is the
           LARGEST viewport (browser chrome hidden), so a 100vh hero overflows
           by the height of the chrome on first paint and the page starts life
           scrollable-by-a-toolbar. `dvh` resolves correctly but CHANGES as the
           chrome hides and shows, resizing the hero mid-scroll. `svh` is the
           smallest viewport: the hero always fits, and never resizes.

           The metadata rail is absolutely positioned at the bottom, so it is
           outside the flow the centred copy is balanced in and the two can
           collide. `pb` reserves the rail's own height plus clearance, which
           pushes the optical centre of the copy up and puts real air between
           the buttons and the rule. */
        className="relative flex min-h-svh items-center overflow-hidden pb-[clamp(6.5rem,9vw,8.5rem)] pt-[84px]"
      >
        {/* --- layer 1, farthest: the graph-paper substrate ----------------- */}
        {/* Oversized and offset upward so the plane can travel its full 52%
            without ever pulling its own bottom edge into frame. */}
        <div
          data-parallax-layer="1"
          data-lag
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-[30%] -z-30 h-[160%]"
        >
          <div className="bg-grid absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,transparent_0%,black_22%,black_78%,transparent_96%)]" />
        </div>

        {/* --- layer 2: the living network, and the far cell ---------------- */}
        <div
          data-parallax-layer="2"
          data-lag
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-[18%] -z-20 h-[136%]"
        >
          <div className="absolute inset-0">
            <ScientificBackground />
          </div>
          <CellularForm className="absolute -right-[38%] top-1/2 hidden h-[132vh] w-[132vh] -translate-y-1/2 md:block lg:-right-[26%]" />
        </div>

        {/* Keeps text contrast honest over the animation. Deliberately NOT a
            parallax layer: it is a correction applied to the viewport, not an
            object in the scene, so it must not move with anything. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(247,248,244,0.92)_0%,rgba(247,248,244,0.62)_46%,rgba(247,248,244,0)_78%)]"
        />

        {/* --- layer 3: the reader's plane ---------------------------------- */}
        <div data-parallax-layer="3" data-lag className="relative w-full">
          <Container>
            {/* The fade sits here, one level inside the layer element, so
                framer-motion writes `opacity` on a node GSAP never touches. */}
            <motion.div
              style={{ opacity: copyOpacity }}
              className="grid grid-cols-12 gap-y-10"
            >
              <div className="col-span-12 lg:col-span-10 xl:col-span-9">
                <motion.div
                  data-reveal
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={
                    reduced ? { duration: 0 } : { duration: 0.8, ease: EASE }
                  }
                >
                  <Eyebrow>Evergreen healthcare venture fund</Eyebrow>
                </motion.div>

                <h1 className="type-display mt-7 text-ink">
                  <LineReveal
                    delay={0.12}
                    lines={[
                      "Investing in innovation",
                      <Fragment key="moves">
                        that <span className="accent-italic">moves</span>{" "}
                        healthcare
                      </Fragment>,
                      "forward.",
                    ]}
                  />
                </h1>

                {/* Flush left, with the headline and the buttons. The original
                    indented this to column 4 as a deliberate asymmetry, but the
                    headline above it and the CTAs below it both start at the
                    margin, so the paragraph was the only element in the hero
                    off that line and read as a mistake rather than as a
                    composition. One left edge for the whole block. */}
                <div className="mt-10 grid grid-cols-12 lg:mt-14">
                  <motion.p
                    data-reveal
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.8, delay: 0.5, ease: EASE }
                    }
                    className="type-body-lg col-span-12 max-w-[52ch] sm:col-span-11 lg:col-span-7"
                  >
                    KOFA Healthcare partners with innovators developing
                    meaningful technologies for unmet clinical needs, from seed
                    stage startups to commercial stage corporations.
                  </motion.p>
                </div>

                <motion.div
                  data-reveal
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: 0.8, delay: 0.62, ease: EASE }
                  }
                  className="mt-11 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-9"
                >
                  <Button href="/portfolio">Explore our portfolio</Button>
                  <TextLink href="/fund">Our investment approach</TextLink>
                </motion.div>
              </div>
            </motion.div>
          </Container>
        </div>

        {/* --- layer 4, nearest: the cell that crosses the copy -------------- */}
        {/* Seated low and left, mostly outside the frame, so at rest it reads
            as a soft weight in the corner rather than as an object. It becomes
            an object only once it starts moving. `pointer-events-none` because
            it passes directly over the CTAs. */}
        <div
          data-parallax-layer="4"
          data-lag
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
        >
          <CellularForm className="absolute -bottom-[58%] -left-[34%] h-[105vh] w-[105vh] opacity-[0.55] sm:-left-[24%] lg:-bottom-[52%] lg:-left-[12%]" />
        </div>

        {/* --- metadata rail ------------------------------------------------ */}
        {/* Outside the parallax entirely: it is chrome for the section, and a
            rail that drifted against its own rule would read as a mistake. */}
        <motion.div
          data-reveal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            reduced ? { duration: 0 } : { duration: 1, delay: 0.85, ease: EASE }
          }
          className="absolute inset-x-0 bottom-0 z-20"
        >
          <Container>
            <div className="h-px w-full bg-rule" />
            {/* A "Scroll" cue with an animated teal tick used to sit at the
                right end of this row. It is gone: the hero now fills the frame
                exactly, so the one thing a reader can do on arrival is scroll,
                and a label telling them so is an instruction nobody needed.
                It also cost a MotionValue and a permanently-repeating
                animation for the privilege. */}
            <div className="flex items-center py-5">
              <dl className="flex flex-wrap items-center gap-x-9 gap-y-2 sm:gap-x-14">
                {RAIL.map((item, i) => (
                  <motion.div
                    key={item.k}
                    data-reveal
                    className="flex items-baseline gap-2.5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.7, delay: 0.95 + i * 0.09, ease: EASE }
                    }
                  >
                    <dt className="type-eyebrow text-ink-mute">{item.k}</dt>
                    <dd className="type-eyebrow text-ink">{item.v}</dd>
                  </motion.div>
                ))}
              </dl>

            </div>
          </Container>
        </motion.div>
      </section>
    </ParallaxLayers>
  );
}
