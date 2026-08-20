"use client";

import { motion } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import type { ReactNode } from "react";

/* ===========================================================================
   ROUTE TRANSITION
   ---------------------------------------------------------------------------
   Rendered from app/template.tsx, which Next.js re-mounts on every navigation.
   That re-mount is the whole mechanism: `initial` → `animate` simply replays,
   so there is no pathname listener, no AnimatePresence, and no exit animation
   waiting to be interrupted.

   Two things happen at once, and neither of them is a curtain:

     · the incoming page arrives on opacity and a 14px lift, and
     · a teal hairline sweeps left to right across the very top of the
       viewport for the length of the transition.

   The hairline is the whole point. A cross-fade alone is invisible on a site
   whose pages share a header and a ground colour — the reader clicks, the page
   changes, and nothing acknowledges that anything happened. One 1px line
   travelling the width of the screen is enough acknowledgement, and it costs a
   single composited transform. It is deliberately NOT a progress bar: it does
   not track anything, it is not tied to a request, and it never sits at 90%
   waiting.

   SPEED IS THE CONSTRAINT. 520ms for the content, 720ms for the sweep, both
   starting immediately. Navigation must never feel slower because of this; if
   a future version of it cannot hold that line, it should be deleted rather
   than lengthened.
=========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;
/** The site's symmetrical curve. A sweep wants to accelerate and decelerate;
    --ease-kofa is an out-curve and would leave the band loitering on the
    right-hand edge. */
const EASE_SWEEP = [0.65, 0, 0.35, 1] as const;

const CONTENT_DURATION = 0.52;
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
      {/* z-80 clears the navigation (z-50) and stays under the arrival
          curtain (z-90), which owns the first load on its own, and under the
          skip link (z-100).

          No `data-reveal` here, deliberately: the reduced-motion rule in
          globals.css pins [data-reveal] to `transform: none`, which would
          park this band across the middle of the screen permanently. Left
          alone it stays at translateX(-100%), i.e. outside its own
          overflow-hidden track and invisible — which is also exactly what a
          no-JS visitor gets, since that is the `initial` style Framer Motion
          renders into the server HTML. Both failure modes resolve to
          "nothing", which is the correct thing for a decorative sliver. */}
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
            reduced ? { duration: 0 } : { duration: SWEEP_DURATION, ease: EASE_SWEEP }
          }
        />
      </div>

      <motion.div
        data-reveal
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : { duration: CONTENT_DURATION, ease: EASE }}
      >
        {children}
      </motion.div>
    </>
  );
}

/* app/* files are the one place this codebase uses default exports, and this
   component exists to be the body of one. Both forms are exported so the
   template can import it either way. */
export default RouteTransition;
