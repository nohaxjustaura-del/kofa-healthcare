"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEnter } from "@/components/motion/useEnter";

/* ---------------------------------------------------------------------------
   Reveal, the site's default entrance.
   opacity 0 → 1, translateY 20px → 0, ~700ms, once, as the element scrolls
   into view. Content already on screen at load is never hidden: see the
   note at the top of components/motion/useEnter.ts, which is also where the
   whole entrance contract (motion off, no JavaScript) is written down.

   Pure CSS transitions driven by one attribute. This and Rise used to be
   framer-motion, which put ~39 KB of gzipped JavaScript on every page.
--------------------------------------------------------------------------- */

export function Reveal({
  children,
  delay = 0,
  y = 20,
  duration = 0.7,
  as = "div",
  className,
}: {
  children: ReactNode;
  /** Seconds. Stagger related items by ~0.06-0.1, never more. */
  delay?: number;
  /** Vertical travel in px. Keep small, 20 is the house default. */
  y?: number;
  duration?: number;
  as?: "div" | "section" | "article" | "li" | "header" | "figure";
  className?: string;
}) {
  const ref = useEnter<HTMLDivElement>();
  // Typed as a div for JSX; the element rendered is whichever tag was asked
  // for, and every one of them takes the same attributes used here.
  const Element = as as "div";

  const style = {
    "--enter-y": `${y}px`,
    "--enter-duration": `${duration}s`,
    ...(delay ? { "--enter-delay": `${delay}s` } : {}),
  } as CSSProperties;

  return (
    <Element ref={ref} data-enter="" className={className} style={style}>
      {children}
    </Element>
  );
}
