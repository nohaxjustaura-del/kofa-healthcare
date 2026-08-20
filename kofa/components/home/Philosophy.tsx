"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/Reveal";
import { useMounted } from "@/components/motion/useMounted";
import { investmentProcess } from "@/data/site";

/* ---------------------------------------------------------------------------
   INVESTMENT PHILOSOPHY
   ---------------------------------------------------------------------------
   One continuous hairline draws itself across the five stages as the section
   passes through the viewport, and each stage lights as it is reached. The
   line is scroll-linked rather than time-linked, so it tracks the reader
   instead of running ahead of them.

   The copy describes only what KOFA states about itself: an evergreen fund
   investing seed through commercial stage. It does not claim services the
   firm has not published.
--------------------------------------------------------------------------- */

export function Philosophy() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMotionOff();
  const mounted = useMounted();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 78%", "end 62%"],
  });

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <Section space="roomy" className="border-t border-rule bg-ivory">
      <Container>
        <div className="grid grid-cols-12 gap-y-8">
          <div className="col-span-12 lg:col-span-6">
            <Reveal>
              <Eyebrow index="02">How we invest</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <SectionHeading className="mt-7 max-w-[15ch]">
                From scientific insight to{" "}
                <span className="accent-italic">meaningful</span> impact.
              </SectionHeading>
            </Reveal>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.12}>
              <p className="type-body-sm max-w-[40ch] lg:pt-4">
                Evergreen capital sets our horizon by the science and the
                regulatory path rather than by a fund clock.
              </p>
            </Reveal>
          </div>
        </div>

        <div ref={ref} className="mt-[clamp(4rem,8vw,7rem)]">
          {/* --- the drawn line --- */}
          <div className="relative h-px w-full bg-rule">
            {/* Swapping the style object on `reduced` made the server emit
                scaleX(0) and a reduced-motion client emit none. Same object
                always; the preference is applied one tick after mount, once
                hydration has already matched. */}
            <motion.div
              className="absolute inset-y-0 left-0 w-full origin-left bg-teal"
              style={{ scaleX: mounted && reduced ? 1 : lineScale }}
            />
          </div>

          {/* Five across only from xl. At 768px five columns leave ~83px of
              text measure and at 1024px still only ~140px; neither is
              readable. Two-up until there is genuinely room for the row. */}
          <ol className="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2 xl:grid-cols-5">
            {investmentProcess.map((stage, i) => (
              <li
                key={stage.n}
                className={`group relative border-b border-rule pb-10 pt-8 xl:border-b-0 xl:pr-7 ${
                  i > 0 ? "xl:border-l xl:border-rule xl:pl-7" : "xl:pl-0"
                }`}
              >
                {/* node sitting on the drawn line */}
                <span
                  aria-hidden
                  className="absolute -top-[3px] left-0 hidden h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-teal xl:block"
                />

                <Reveal delay={i * 0.07} y={16}>
                  <span className="type-eyebrow tabular-nums text-ink-mute transition-colors duration-500 ease-kofa group-hover:text-teal">
                    {stage.n}
                  </span>
                  <h3 className="mt-4 text-[1.0625rem] font-medium leading-snug tracking-[-0.012em] text-ink">
                    {stage.title}
                  </h3>
                  <p className="type-body-xs mt-3 max-w-[30ch]">
                    {stage.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
