"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  isMotionOff,
  onMotionChange,
} from "@/components/motion/MotionPreference";

/* ===========================================================================
   PARALLAX
   ---------------------------------------------------------------------------
   Depth for imagery. Lag.tsx already drifts a whole block against the scroll;
   this is the other half of the same idea, the one that lives INSIDE a
   fixed-aspect frame, where the subject moves relative to its own window and
   the frame itself never budges. That is the difference between a page whose
   pictures are pasted on and one whose pictures have somewhere to be.

   Do not reach for this instead of Lag. Lag moves a tile within the layout;
   Parallax moves a picture within a tile. A section using both is what makes
   three different rates visible at once, which is the whole effect.

   TWO MODES, both driven by the same `amount`:

     · "transform" (default). translateY, springed exactly as in Lag, on a
       child that has been over-scaled so the travel can never expose an edge.
       The arithmetic has to hold or the frame flashes background at the top or
       bottom of its travel, which is the failure mode that makes hand-rolled
       parallax look broken: at scale s the element overhangs its box by
       (s-1)/2 in each direction, so s = 1 + 2*amount buys exactly `amount` of
       overhang per side, which is exactly the travel. Equality is not a
       comfortable place to sit, so a hair of guard is added below.

     · "objectPosition". The fahrenheit.ch trick: leave the <img> exactly where
       it is and scrub its `object-position` instead, so the crop slides
       through the frame while the box never moves. Zero layout cost, zero
       transform, nothing becomes a containing block, and it composes with
       next/image because next/image renders a plain <img> we can find.

   WHY THE WRITES ARE HAND-ROLLED IN MODE 2. `object-position` is not a
   MotionValue-backed style, so the only way to drive it from React state is a
   setState per frame, i.e. a full re-render of the subtree on every scroll
   event. Instead the scroll progress is subscribed to directly and the write
   is coalesced into one rAF, so N scroll events between two frames produce one
   style write. The rAF is one-shot, not a loop: with no scrolling there is
   nothing scheduled. It also means there is nothing to pause on
   `visibilitychange`, a hidden tab does not scroll.

   REDUCED MOTION. `data-lag` on both elements, so the `html[data-motion="off"]`
   block in globals.css pins them to
   `transform: none !important` — which kills the translate AND the over-scale
   together, returning the child to exactly the frame's size with no gap.
   `object-position` is not a transform and that CSS cannot reach it, so mode 2
   additionally declines to subscribe at all when the query matches, and
   re-evaluates if the user changes the setting mid-session. That check lives
   in an effect, never in render: branching the markup on a media query is the
   hydration bug documented at the top of Reveal.tsx.

   CONTAINING BLOCK. In "transform" mode the inner element carries a transform
   for the life of the page, which makes it the containing block for any
   `position: fixed` descendant. Only ever put imagery inside it.
=========================================================================== */

/** Same spring as Lag, so a lagging tile and a parallaxing image inside it
 *  settle on the same beat rather than arguing. Overdamped (ζ ≈ 1.85), so it
 *  cannot overshoot past the overhang and expose an edge. */
const SPRING = { stiffness: 90, damping: 26, mass: 0.55 } as const;

/** Sub-pixel rounding, fractional device pixel ratios and the browser's own
 *  compositing all round in directions we do not control. 0.4% of extra scale
 *  costs nothing visually and keeps the travel strictly inside the overhang. */
const OVERSCALE_GUARD = 0.004;

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function Parallax({
  children,
  amount = 0.12,
  mode = "transform",
  className = "",
}: {
  children: ReactNode;
  /**
   * Fraction of the frame to travel in each direction. 0.08-0.16 is the usable
   * range; past that "transform" mode has to over-scale enough to visibly
   * soften the image. In "objectPosition" mode it is read as percentage points
   * either side of centre, so the house default of 0.12 gives the reference's
   * own `center 62%` → `center 38%`.
   */
  amount?: number;
  mode?: "transform" | "objectPosition";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // The ref sits on the OUTER element, which is never transformed. Framer
  // Motion measures with offsetTop/offsetHeight rather than getBoundingClientRect
  // so measuring a transformed element would not actually feed back, but there
  // is no reason to depend on that.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Percentage of the element's own height, so one `amount` reads the same on a
  // 300px thumbnail and a full-bleed spread. Kept numeric through the spring
  // and only formatted at the end, because springing a unit string is a coin
  // toss on how the library parses it.
  //
  // Travel is zeroed outside "transform" mode. The hooks still run in the same
  // order, but a spring whose source never leaves its target starts no
  // animation at all (motion-dom's attachFollow short-circuits on
  // `currentValue === targetValue`). Without this every objectPosition
  // instance ran a full spring on every scroll event and threw the result
  // away, which on a grid of portraits is one wasted frameloop per portrait.
  const travel = mode === "transform" ? amount * 100 : 0;
  const raw = useTransform(scrollYProgress, [0, 1], [travel, -travel]);
  const springed = useSpring(raw, SPRING);
  const y = useTransform(springed, (v) => `${v.toFixed(3)}%`);

  /* --- mode 2: scrub object-position on the child <img> --------------------- */
  useEffect(() => {
    if (mode !== "objectPosition") return;
    const root = ref.current;
    if (!root) return;

    // next/image with `fill` renders a real <img> into the server HTML, so it
    // is present by the time effects run. Anything else (the generated SVG
    // fields in CompanyVisual, for instance) simply has no img and this becomes
    // a no-op rather than an error.
    const img = root.querySelector("img");
    if (!img) return;

    const from = clamp(50 + amount * 100, 0, 100);
    const to = clamp(50 - amount * 100, 0, 100);


    let unsubscribe: (() => void) | null = null;
    let raf = 0;
    let pending = from;
    let written = Number.NaN;
    let scheduled = false;

    const write = () => {
      scheduled = false;
      // Re-check inside the frame: the value can move again between the
      // schedule and the paint, and we want the newest one, not the one that
      // happened to trigger the schedule.
      if (pending === written) return;
      written = pending;
      img.style.objectPosition = `center ${pending.toFixed(2)}%`;
    };

    const update = (p: number) => {
      const next = from + (to - from) * clamp(p, 0, 1);
      // Progress is clamped, so scrolling far past the element keeps reporting
      // 0 or 1. Without this guard that is a style write per scroll event for
      // the rest of the page.
      if (next === pending) return;
      pending = next;
      if (scheduled) return;
      scheduled = true;
      raf = requestAnimationFrame(write);
    };

    const attach = () => {
      if (isMotionOff()) {
        detach();
        img.style.objectPosition = "";
        // Both trackers are invalidated, not just `written`. Leaving `pending`
        // at its last real value meant that if the visitor turned motion
        // back on, `update()`'s `next === pending` guard swallowed the
        // seeding call and the crop stayed at the authored position until the
        // next scroll event. NaN never equals anything, so the seed lands.
        pending = Number.NaN;
        written = Number.NaN;
        return;
      }
      if (unsubscribe) return;
      unsubscribe = scrollYProgress.on("change", update);
      // Seed from wherever the page already is: a deep link or a restored
      // scroll position must not leave the crop parked at its start value
      // until the visitor happens to scroll.
      update(scrollYProgress.get());
    };

    function detach() {
      unsubscribe?.();
      unsubscribe = null;
      cancelAnimationFrame(raf);
      scheduled = false;
    }

    attach();
    const unsubscribeMotion = onMotionChange(attach);

    return () => {
      detach();
      unsubscribeMotion();
      img.style.objectPosition = "";
    };
  }, [mode, amount, scrollYProgress]);

  /* --- render --------------------------------------------------------------
     Both modes render `absolute inset-0`: this component is designed to sit
     directly inside a `relative overflow-hidden` frame, and that positioning is
     also what lets a `next/image fill` child find a sized positioned ancestor.
     `className` is appended last so a caller can override it.
  ------------------------------------------------------------------------- */

  if (mode === "objectPosition") {
    // No transform at all in this mode, so one element is enough and nothing
    // here becomes a containing block.
    return (
      <div
        ref={ref}
        data-lag
        className={`absolute inset-0 ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} data-lag className={`absolute inset-0 ${className}`}>
      <motion.div
        data-lag
        className="absolute inset-0"
        style={{ y, scale: 1 + 2 * amount + OVERSCALE_GUARD }}
      >
        {children}
      </motion.div>
    </div>
  );
}
