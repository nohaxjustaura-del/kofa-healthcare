"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/primitives";
import { LogoMark } from "@/components/ui/LogoMark";
import { site } from "@/data/site";
import { isMotionOff } from "@/components/motion/MotionPreference";

/* ===========================================================================
   ARRIVAL
   ---------------------------------------------------------------------------
   The site's one piece of ceremony: an ivory layer that is already on screen
   in the server HTML, holds for the length of one drawn rule, and then wipes
   upward off the top of the viewport to hand over to the hero's own
   LineReveal. Once per session, ~1.5s door to door measured from navigation
   start, not from mount.

   It is a pure overlay. It never wraps or gates `children`, so the hero HTML
   streams and paints underneath on the normal schedule. Chrome scores LCP on
   the paint of the largest element and does not test it for occlusion, so an
   opaque sibling layer does not move the number.

   FOUR THINGS MUST BE TRUE OR THIS COMPONENT IS A BUG, NOT A FEATURE:

   1. NO-JS AND REDUCED MOTION KILL IT IN CSS, NOT IN JS.
      Because the curtain ships in the server HTML, a visitor whose JS never
      runs would be looking at a blank ivory page over completely populated
      markup, forever. And a 1.5s choreographed gate is precisely what
      `prefers-reduced-motion` is asking us not to do. Neither case can be
      detected before first paint, so both are handled with
      `[data-arrival]{display:none}` — once in the <noscript> block in
      app/layout.tsx, once in the reduced-motion media query in
      app/globals.css. A media query evaluates the same on the server and the
      client, so unlike a JS branch it cannot cost us the SSR pass.
      Do not "simplify" either of those away into a check in here.

   2. HYDRATION. The sessionStorage read only exists in the browser, so the
      first client render must not depend on it: `phase` starts at "hold" on
      the server AND on the client, and the repeat-visit case is resolved in a
      layout effect, i.e. before the browser paints the hydrated tree.
      That still leaves the gap between first paint and hydration, which on a
      repeat visit is long enough to see. The pre-paint script in
      app/layout.tsx closes it by stamping `data-arrival-seen` on <html>
      before the body renders; this effect is the belt to that script's
      braces, and the one that actually unmounts the node.

   3. IT IS FURNITURE, NOT UI. `aria-hidden`, no focusable descendant (the
      logomark is rendered with `href={null}`, which returns the bare lockup
      rather than a link), and `pointer-events: none` the instant the wipe
      starts, so the page underneath is live before it is fully uncovered.

   4. THE SCROLL LOCK OUTLIVES NOTHING. It is released at the first frame of
      the wipe and again, unconditionally, on unmount. A gate that strands the
      document unscrollable is worse than no gate.
=========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

/** ms the wipe itself takes. */
const WIPE = 700;

/** Longest and shortest hold before the wipe begins. */
const HOLD_MAX = 720;
const HOLD_MIN = 320;

/** Total time from navigation start we are willing to spend on ceremony. */
const GATE_BUDGET = 1500;

/** The drawn rule starts a beat late and finishes just before the wipe, so
    the gate reads as a consequence of the line completing rather than as an
    arbitrary timer. */
const RULE_DELAY = 100;
const RULE_LEAD = 20;

const SESSION_KEY = "kofa:arrival";

/* `useLayoutEffect` warns when React renders this component on the server.
   Swapping the hook by environment is a module-level constant, so it is
   stable for the life of the process and never changes render output. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type Phase = "hold" | "leaving" | "gone";

/**
 * The session flag is written at the START of the gate, so re-reading it on a
 * second mount of the same document reports "already seen" and suppresses the
 * curtain. That is exactly what React StrictMode does in development (mount →
 * cleanup → mount, `reactStrictMode: true` in next.config.ts) and what Fast
 * Refresh does on every save, which between them made the curtain invisible
 * for the entire life of the dev server.
 *
 * So the storage read is resolved once per document and cached on the module.
 * A real repeat visit is a new document and a new module instance, so it still
 * reads storage and is still suppressed.
 */
let seenThisDocument: boolean | null = null;

/**
 * How long to hold, spent from a fixed budget rather than fixed outright.
 *
 * The timers below can only start once React has hydrated. On a warm load
 * that is ~80ms after navigation and the full 720ms hold is affordable. On a
 * cold or throttled one it can be a second or more, and charging a visitor who
 * has already been waiting another 1.4s on top is exactly where a load gate
 * stops being ceremony and starts being an obstacle. So the hold absorbs the
 * overrun: whatever the load spent comes out of it, down to a floor short
 * enough to stay polite and long enough for the rule to still read as drawn.
 *
 * `performance.now()` is milliseconds since this document's navigation start,
 * which is the number we actually want, no extra measurement needed.
 *
 * This feeds `transition` only. It never reaches the DOM, so it is free to
 * differ between the server render and the hydrating client render — the
 * hydration rule in components/motion/Reveal.tsx constrains markup and
 * DOM-reaching props, and a duration is neither.
 */
function resolveHold(): number {
  if (typeof window === "undefined") return HOLD_MAX;
  const spent = performance.now();
  return Math.min(HOLD_MAX, Math.max(HOLD_MIN, GATE_BUDGET - spent - WIPE));
}

export function Arrival() {
  const [phase, setPhase] = useState<Phase>("hold");
  // Lazy initialiser: resolved once, at hydration, and stable for the life of
  // the component. Re-resolving per render would re-time the rule mid-draw.
  const [hold] = useState(resolveHold);

  const ruleDuration = Math.max(160, hold - RULE_DELAY - RULE_LEAD);

  useIsomorphicLayoutEffect(() => {
    if (seenThisDocument === null) {
      try {
        seenThisDocument = window.sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {
        // Safari private mode throws on storage access. Failing open (treating
        // the visit as fresh) is the harmless direction: worst case the curtain
        // plays again, rather than a thrown error taking the timers with it.
        seenThisDocument = false;
      }
    }
    const seen = seenThisDocument;

    const reduced = isMotionOff();

    // Both of these are also handled in CSS; this branch is what actually
    // unmounts the node so it stops occupying the compositor and the DOM.
    // Note it returns BEFORE the scroll lock: a curtain hidden by CSS must
    // not still be holding the document still behind the visitor's back.
    if (seen || reduced) {
      setPhase("gone");
      return;
    }

    try {
      // Written up front, not on completion: a reload part-way through the
      // gate should not replay it.
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* see above */
    }

    /* Scroll lock.

       `overflow:hidden` alone removes the classic scrollbar, which widens the
       viewport by ~10px on Windows and slides the fixed navigation sideways
       twice — once when the curtain arrives, once when it leaves. Reserving
       the gutter holds the initial containing block at its scrolled width, so
       nothing moves. Where the platform uses overlay scrollbars the measured
       width is 0, the branch is skipped, and there is nothing to compensate
       for anyway. */
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    const prevGutter = root.style.getPropertyValue("scrollbar-gutter");
    if (window.innerWidth - root.clientWidth > 0) {
      root.style.setProperty("scrollbar-gutter", "stable");
    }
    root.style.overflow = "hidden";

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      root.style.overflow = prevOverflow;
      if (prevGutter) root.style.setProperty("scrollbar-gutter", prevGutter);
      else root.style.removeProperty("scrollbar-gutter");
    };

    const toLeaving = window.setTimeout(() => {
      setPhase("leaving");
      // Released at the START of the wipe, not the end: the page underneath is
      // interactive and scrollable while it is still being uncovered.
      release();
    }, hold);

    const toGone = window.setTimeout(() => setPhase("gone"), hold + WIPE);

    return () => {
      window.clearTimeout(toLeaving);
      window.clearTimeout(toGone);
      // Unconditional: an unmount mid-gate (fast route change, Fast Refresh,
      // StrictMode's double-invoke in development) must never strand the
      // document unscrollable.
      release();
    };
  }, [hold]);

  if (phase === "gone") return null;

  const leaving = phase === "leaving";

  return (
    <motion.div
      data-arrival
      data-arrival-phase={phase}
      aria-hidden="true"
      /* z-90 clears the navigation (z-50) and stays under the skip link
         (z-100), which must remain reachable even mid-gate. */
      className={`fixed inset-0 z-[90] flex items-center bg-ivory ${
        leaving ? "pointer-events-none" : ""
      }`}
      /* The clip collapses toward the top edge, so the uncovering line travels
         from the bottom of the viewport upward and the curtain retracts off
         the top. The small negative y gives it weight; the clip edge always
         runs ahead of it, so no gap ever opens at the bottom. */
      initial={{ clipPath: "inset(0% 0% 0% 0%)", y: "0%" }}
      animate={
        leaving
          ? { clipPath: "inset(0% 0% 100% 0%)", y: "-3%" }
          : { clipPath: "inset(0% 0% 0% 0%)", y: "0%" }
      }
      transition={{ duration: WIPE / 1000, ease: EASE }}
    >
      <Container>
        <motion.div
          className="max-w-[30rem]"
          initial={{ opacity: 0, y: 14 }}
          animate={leaving ? { opacity: 0, y: -18 } : { opacity: 1, y: 0 }}
          transition={
            leaving
              ? { duration: 0.42, ease: EASE }
              : { duration: 0.7, delay: 0.06, ease: EASE }
          }
        >
          {/* href={null} is load-bearing: it renders the lockup without a
              <Link>, which is what keeps this layer free of focusable
              content and therefore incapable of trapping focus. */}
          <LogoMark href={null} size={26} />

          {/* The load gate made literal: a 1px rule drawing left to right,
              finishing 20ms before the curtain starts to leave. */}
          <div className="relative mt-7 h-px w-full bg-rule-soft">
            <motion.div
              className="absolute inset-0 origin-left bg-teal"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: ruleDuration / 1000,
                delay: RULE_DELAY / 1000,
                ease: EASE,
              }}
            />
          </div>

          {/* Leading is opened up because .type-eyebrow ships at 1, which sets
              solid when the phrase wraps to two lines on a narrow viewport.
              Size is untouched. */}
          <p className="type-eyebrow mt-5 leading-[1.7] text-ink-mute">
            {site.closingPhrase}
          </p>
        </motion.div>
      </Container>
    </motion.div>
  );
}
