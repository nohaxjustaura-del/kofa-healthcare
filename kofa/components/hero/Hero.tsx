"use client";

import { Fragment, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { Button, TextLink } from "@/components/ui/Button";
import { ScientificBackground } from "@/components/motion/ScientificBackground";
import { CellularForm } from "@/components/motion/CellularForm";
import { LineReveal } from "@/components/motion/Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Small, factual, checkable. Not a statistic counter. */
const RAIL = [
  { k: "Established", v: "2016" },
  { k: "Structure", v: "Evergreen fund" },
  { k: "Portfolio", v: "16 companies" },
];

export function Hero() {
  const reduced = useMotionOff();
  const ref = useRef<HTMLElement>(null);

  /* Depth on exit. Three layers leave the frame at different rates, the
     copy rises fastest, the cell sinks slightly against it, the grid barely
     moves. Small numbers on purpose: the reader should register depth
     without noticing a parallax effect. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  /* Reduced motion flattens the ranges rather than dropping the `style` prop.
     Both variants evaluate identically at scroll progress 0, so the server and
     the client emit the same markup, see the hydration note in
     components/motion/Reveal.tsx. */
  const copyY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -72]);
  const copyOpacity = useTransform(
    scrollYProgress,
    [0, 0.72],
    reduced ? [1, 1] : [1, 0],
  );
  const cellY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 56]);
  const gridY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -22]);
  /** The scroll cue fades out over the first fifth of the hero. */
  const cueOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[92svh] items-center overflow-hidden pt-[84px]"
    >
      {/* --- background stack, back to front --- */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* A faint scientific grid, fading out toward the bottom */}
        <motion.div
          style={{ y: gridY }}
          className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_88%)] opacity-70"
        />

        {/* The living network */}
        <div className="absolute inset-0">
          <ScientificBackground />
        </div>

        {/* One large cell, mostly outside the frame on the right */}
        <motion.div
          style={{ y: cellY }}
          className="absolute inset-0"
        >
          <CellularForm className="absolute -right-[38%] top-1/2 hidden h-[132vh] w-[132vh] -translate-y-1/2 md:block lg:-right-[26%]" />
        </motion.div>

        {/* Keeps text contrast honest over the animation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(247,248,244,0.92)_0%,rgba(247,248,244,0.62)_46%,rgba(247,248,244,0)_78%)]" />
      </div>

      <Container className="relative">
        <motion.div
          style={{ y: copyY, opacity: copyOpacity }}
          className="grid grid-cols-12 gap-y-10"
        >
          <div className="col-span-12 lg:col-span-10 xl:col-span-9">
            <motion.div
              data-reveal
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduced ? { duration: 0 } : { duration: 0.8, ease: EASE }}
            >
              {/* The logo lockup two inches above already says "KOFA
                  Healthcare". Repeating it here spent the most valuable line
                  on the page saying nothing, so this states what the firm
                  actually is, in its own published words. */}
              <Eyebrow>Evergreen healthcare venture fund</Eyebrow>
            </motion.div>

            <h1 className="type-display mt-7 text-ink">
              <LineReveal
                delay={0.12}
                lines={[
                  "Investing in innovation",
                  <Fragment key="moves">
                    that <span className="accent-italic">moves</span> healthcare
                  </Fragment>,
                  "forward.",
                ]}
              />
            </h1>

            {/* Offset to column 4, the asymmetry is deliberate. */}
            <div className="mt-10 grid grid-cols-12 lg:mt-14">
              <motion.p
                data-reveal
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.8, delay: 0.5, ease: EASE }}
                className="type-body-lg col-span-12 max-w-[46ch] sm:col-span-11 lg:col-span-8 lg:col-start-4"
              >
                KOFA Healthcare partners with innovators developing meaningful
                technologies for unmet clinical needs, from seed stage
                startups to commercial stage corporations.
              </motion.p>
            </div>

            <motion.div
              data-reveal
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.8, delay: 0.62, ease: EASE }}
              className="mt-11 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-9"
            >
              <Button href="/portfolio">Explore our portfolio</Button>
              <TextLink href="/fund">Our investment approach</TextLink>
            </motion.div>
          </div>
        </motion.div>
      </Container>

      {/* --- metadata rail --- */}
      <motion.div
        data-reveal
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 1, delay: 0.85, ease: EASE }}
        className="absolute inset-x-0 bottom-0"
      >
        <Container>
          <div className="h-px w-full bg-rule" />
          <div className="flex items-center justify-between py-5">
            {/* The three facts arrive in sequence rather than as one block,
                so the rail reads left to right the way it is meant to be
                read. 90ms apart: enough to register, too quick to wait for. */}
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

            {/* The cue exists to say "there is more below". Once the reader
                has started, it has been answered, so it retires instead of
                looping at them for the rest of the page. */}
            <motion.div
              className="hidden items-center gap-3 md:flex"
              style={{ opacity: cueOpacity }}
            >
              <span className="type-eyebrow text-ink-mute">Scroll</span>
              <span aria-hidden className="relative block h-8 w-px overflow-hidden bg-rule">
                {/* Always rendered so SSR and client agree; the loop itself
                    is what reduced motion switches off. */}
                <motion.span
                  className="absolute inset-x-0 top-0 block h-3 bg-teal"
                  animate={reduced ? undefined : { y: ["-100%", "320%"] }}
                  transition={{
                    duration: 2.6,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 0.6,
                  }}
                />
              </span>
            </motion.div>
          </div>
        </Container>
      </motion.div>
    </section>
  );
}
