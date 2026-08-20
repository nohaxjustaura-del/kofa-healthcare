"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

/* ===========================================================================
   LAG
   ---------------------------------------------------------------------------
   A single element drifts against the scroll, then eases back into place, the
   device that gives a page its sense of depth and weight without any section
   ever "doing" something.

   Two rules keep it from becoming an effect:
     · `amount` is a fraction of the element's own travel, not a fixed pixel
       distance, so a small tile and a full-bleed visual lag proportionally.
     · A spring smooths the value, so the drift keeps moving for a beat after
       the wheel stops. That trailing settle is the whole point; without it the
       element is merely offset.

   Reduced motion is handled in CSS via [data-lag] (see globals.css), not by
   branching the markup, a JS branch here would change the server output and
   break hydration.
=========================================================================== */

export function Lag({
  children,
  amount = 0.06,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  /** Fraction of scroll travel to lag by. 0.04-0.10 is the usable range. */
  amount?: number;
  className?: string;
  as?: "div" | "figure" | "aside";
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Travel is expressed in viewport-height units so it scales with the screen.
  const raw = useTransform(
    scrollYProgress,
    [0, 1],
    [`${amount * 100}vh`, `${-amount * 100}vh`],
  );

  const y = useSpring(raw, { stiffness: 90, damping: 26, mass: 0.55 });

  const Tag = motion[as] as typeof motion.div;

  return (
    <Tag ref={ref} data-lag className={className} style={{ y }}>
      {children}
    </Tag>
  );
}
