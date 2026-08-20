"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { useMounted } from "@/components/motion/useMounted";

/* ===========================================================================
   SCROLL PROGRESS
   ---------------------------------------------------------------------------
   A 1px teal hairline across the top of the viewport, scaled 0 → 1 by document
   scroll progress. The cheapest possible way to tell a visitor how much of an
   11,000px page is left, and the one piece of chrome that makes the whole
   document read as a single authored object rather than an unbounded feed.

   WHY IT SITS ABOVE THE HEADER, NOT BEHIND IT.
   The obvious placement is one layer under the nav (z-49) so the bar "belongs"
   to the header. It does not survive there. Once scrolled, the header carries
   `backdrop-blur-xl backdrop-saturate-150` over a 78%-opaque ivory plate;
   backdrop-filter samples everything painted beneath it, so a 1px line at z-49
   is smeared across ~20px of blur radius and desaturated into the plate. It
   reads as a faint bruise, not a rule. The header also auto-hides on scroll
   down (translateY(-100%)), which is exactly when progress is most wanted, and
   anything drawn on its bottom border leaves with it.

   So: an independent fixed element at z-[51], one above the header, pinned to
   the true top of the viewport. It is 1px tall and pointer-events-none, so
   being the topmost layer costs nothing — it never intercepts a click and
   never occludes a glyph. Below it: header z-50, mobile menu z-40. Above it:
   ViewCursor z-[60] and the skip link z-[100], both of which should win.

   NOT HIDDEN UNDER REDUCED MOTION. A progress indicator is information, not
   decoration; removing it would take something useful away from the people
   who most benefit from knowing how long a page is. What goes away instead is
   the spring: see the comment on `exact` below.
=========================================================================== */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  /* The spring is the whole character of this element. Bound straight to
     scrollYProgress the bar steps in hard increments with the wheel and looks
     detached from a page that is itself being interpolated by Lenis; with the
     spring it overshoots slightly into a flick and keeps travelling for a beat
     after the wheel stops, which is the same trailing settle Lenis gives the
     document. Tuned stiffer than Lag's spring (90/26) because a progress bar
     that lags visibly is just wrong, not weighty. */
  const smooth = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    mass: 0.32,
    restDelta: 0.0006,
  });

  /* HYDRATION. `useMotionOff()` is false on the server and true on a
     reduced-motion client, so it can never be allowed to decide what gets
     rendered on the first pass. Gating it behind useMounted() means the first
     client render binds the same MotionValue the server did, and the swap to
     the unsprung value lands one tick later. Both values are 0 at that point
     (the page has not been scrolled yet), so nothing visibly changes — the
     markup is byte-identical either way and only the post-mount behaviour
     differs. This is a value swap, not a markup branch: the tree below is the
     same in both cases.

     Under reduced motion the bar tracks the scroll position exactly. It still
     "moves", because it is reporting a position the user is deliberately
     changing; what it stops doing is animating on its own after the input has
     ended, which is the part prefers-reduced-motion is actually about. */
  const reduced = useMotionOff();
  const mounted = useMounted();
  const exact = mounted && reduced === true;

  return (
    <motion.div
      aria-hidden
      style={{
        scaleX: exact ? scrollYProgress : smooth,
        transformOrigin: "left",
        willChange: "transform",
      }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[51] h-px bg-teal"
    />
  );
}
