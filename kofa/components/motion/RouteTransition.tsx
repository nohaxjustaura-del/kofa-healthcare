"use client";

import { motion } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import type { ReactNode } from "react";

/* ===========================================================================
   ROUTE TRANSITION
   ---------------------------------------------------------------------------
   Rendered from app/template.tsx, which Next.js re-mounts on every
   navigation. That re-mount is the whole mechanism: `initial` → `animate`
   simply replays, so there is no pathname listener, no AnimatePresence, and
   no exit animation waiting to be interrupted.

   WHAT CHANGED, AND WHY
   ---------------------------------------------------------------------------
   This used to do two things: sweep a teal hairline across the top of the
   viewport, and fade the whole incoming page up from opacity 0 with a 14px
   lift. The second one is gone.

   Wrapping every page's entire contents in a JavaScript-driven opacity
   animation means the site has exactly one failure mode: if that animation
   does not run to completion, the page is blank. Not degraded, blank. The
   <noscript> rule in app/layout.tsx covers the case where JavaScript is off,
   but not the commoner one where JavaScript is on and the frame loop is
   throttled, a backgrounded or occluded window, a browser under load, a
   slow hydration on a phone. It was reproduced here during review: the
   window lost focus mid-navigation and the body of the page stayed at
   opacity 0 for as long as it stayed unpainted.

   It also cost 520ms of deliberately invisible content on every navigation,
   including the first paint, where the thing being hidden is the hero, i.e.
   the Largest Contentful Paint element. Half a second of blank page is a
   poor trade for a cross-fade nobody asked for.

   The hairline stays, and it was always the part that did the work. A
   cross-fade is invisible on a site whose pages share a header and a ground
   colour; one 1px line travelling the width of the screen is enough to
   acknowledge that something happened, and it costs a single composited
   transform. If it never runs, nothing is lost but a sliver.

   It is deliberately NOT a progress bar: it tracks nothing, it is not tied
   to a request, and it never sits at 90% waiting.
=========================================================================== */

/** A sweep wants to accelerate and decelerate; --ease-kofa is an out-curve
    and would leave the band loitering against the right-hand edge. */
const EASE_SWEEP = [0.65, 0, 0.35, 1] as const;
const SWEEP_DURATION = 0.72;

/* A narrow bright band inside a full-width element, rather than a short
   element travelling a viewport width. Sizing the band in percentages of the
   viewport keeps the geometry independent of the element's own width, so the
   travel is a plain -100% → 100% and does not have to be recomputed per
   breakpoint. */
const SWEEP_BAND =
  "linear-gradient(90deg, transparent 0%, transparent 30%, var(--color-teal) 50%, transparent 70%, transparent 100%)";

export function RouteTransition({ children }: { children: ReactNode }) {
  const reduced = useMotionOff();

  /* Never branch the returned tree on `reduced`, see the hydration note in
     components/motion/Reveal.tsx. Same markup either way; reduced motion is
     expressed purely as `duration: 0`. */
  return (
    <>
      {/* z-80 clears the navigation (z-50) and stays under the skip link.

          No `data-reveal` here, deliberately: the reduced-motion rule in
          globals.css pins [data-reveal] to `transform: none`, which would
          park this band across the middle of the screen permanently. Left
          alone it stays at translateX(-100%), i.e. outside its own
          overflow-hidden track and invisible, which is also exactly what a
          no-JS visitor gets, since that is the `initial` style Framer Motion
          renders into the server HTML. Both failure modes resolve to
          "nothing", which is the correct outcome for a decorative sliver. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-px overflow-hidden"
      >
        <motion.div
          className="h-full w-full"
          style={{ backgroundImage: SWEEP_BAND }}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: SWEEP_DURATION, ease: EASE_SWEEP }
          }
        />
      </div>

      {children}
    </>
  );
}

/* app/* files are the one place this codebase uses default exports, and this
   component exists to be the body of one. Both forms are exported so the
   template can import it either way. */
export default RouteTransition;
