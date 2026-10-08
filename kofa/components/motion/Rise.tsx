"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEnter } from "@/components/motion/useEnter";

/* ===========================================================================
   RISE
   ---------------------------------------------------------------------------
   The site's *characterful* entrance, a sibling to Reveal, not a replacement.
   Reveal (opacity + 20px y) is the neutral one and stays the default for prose
   and single elements. Rise is for composed things, grid columns, cards, the
   pieces a reader perceives as having been arranged, and it adds three things
   Reveal does not have: lateral travel, a hair of skew, and a hair of scale.

   Together those read as WEIGHT: the block arrives as an object with mass
   rather than as a paragraph fading up. The reference for the idea is
   fahrenheit.ch, which throws cards in from `x:380 y:180 skewY:7`. That is an
   agency portfolio's register. KOFA's is a tenth of it, x:18 y:26 skewY:1.4,
   and the test is that a visitor should never be able to name the effect. If
   you can see the skew as skew, it is turned up too far.

   Same mechanism as Reveal: components/motion/useEnter.ts decides whether the
   element enters at all (only if it starts below the fold, with motion on),
   and the ENTRANCES block in app/globals.css does the moving. The numbers
   below are the ones the framer-motion version used.

   CLIPPING. `skewY` pushes the two far corners outside the element's own
   border box for the length of the transition. Any `overflow-hidden`
   ancestor, a card frame, a rounded image well, shears those corners off
   mid-flight, which looks like a rendering bug rather than a choice. Put Rise
   on the OUTSIDE of a clipping frame, never inside one.

   CONTAINING BLOCK. An element with a transform becomes the containing block
   for any `position: fixed` descendant. The settled state has no transform
   at all (the "in" state only sets a transition), so this can only happen
   while an element is waiting or moving. Never wrap fixed-position UI in Rise.
=========================================================================== */

/**
 * Which way the block leans in from. Paired columns should lean *toward*
 * each other: the left column enters from the left, the right from the right,
 * so the pair closes on the centre line. The skew sign mirrors the travel;
 * "up" carries no skew, because a skew with no lateral travel reads as a
 * wobble.
 */
const LEAN = {
  right: { x: 18, skew: 1.4 },
  left: { x: -18, skew: -1.4 },
  up: { x: 0, skew: 0 },
} as const;

export function Rise({
  children,
  from = "up",
  delay = 0,
  duration = 1.05,
  as = "div",
  className,
}: {
  children: ReactNode;
  /** Which side the block leans in from. Lean paired columns inward. */
  from?: keyof typeof LEAN;
  /** Seconds. Stagger related items by ~0.06-0.1, never more. */
  delay?: number;
  /** Seconds. ~1.05 is the house weight; below 0.9 it starts to feel flicked. */
  duration?: number;
  as?: "div" | "section" | "article" | "li" | "header" | "figure" | "aside";
  className?: string;
}) {
  const ref = useEnter<HTMLDivElement>();
  const Element = as as "div";
  const lean = LEAN[from];

  // 26px of lift, 18px of lateral, 1.4deg of shear, 1.5% of scale. Every one
  // of those is at the edge of perceptible on its own; the signature comes
  // from all four resolving together on the same curve.
  const style = {
    "--enter-y": "26px",
    "--enter-x": `${lean.x}px`,
    "--enter-skew": `${lean.skew}deg`,
    "--enter-scale": "0.985",
    "--enter-duration": `${duration}s`,
    ...(delay ? { "--enter-delay": `${delay}s` } : {}),
  } as CSSProperties;

  return (
    <Element ref={ref} data-enter="" className={className} style={style}>
      {children}
    </Element>
  );
}
