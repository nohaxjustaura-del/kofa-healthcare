"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import {
  isMotionOff,
  onMotionChange,
} from "@/components/motion/MotionPreference";

/* ===========================================================================
   SMOOTH SCROLL
   ---------------------------------------------------------------------------
   The single largest contributor to how "built" a long page feels. Native
   wheel scroll moves the document in hard 100px steps; every step is a
   separate, unrelated jump, and on a 11,000px page that reads as a document
   rather than as a place. Interpolating between those steps costs one rAF and
   changes the character of the entire site.

   WINDOW MODE, DELIBERATELY. Lenis can also run by translating a wrapper
   element, which is how most smooth-scroll libraries work. That mode would
   break, in this project alone:
     · `position: sticky` (FundIntro's node field, ProcessTrack's pin),
     · framer-motion's `useScroll` (Hero parallax, Philosophy's drawn line,
       Lag, Parallax, ScrollProgress),
     · IntersectionObserver (`whileInView` on every Reveal, the canvas
       field's off-screen pause, ChapterRail).
   Window is still the default in lenis 1.3.26 (`wrapper = window`, and the
   constructor additionally coerces `document.documentElement` to `window`),
   and `setScroll` drives it with `wrapper.scrollTo({ behavior: "instant" })`,
   i.e. it writes the real window scroll position once a frame. So all three
   keep working untouched and every existing scroll listener still fires. Do
   not add a `wrapper`/`content` pair here.

   NOT WHEN MOTION IS OFF. Interpolating the scroll position is the most
   pervasive motion on the site and a main-thread animation running for the
   whole session, so it is the first thing to go when a visitor asks the page
   to hold still. That decision comes from components/motion/MotionPreference
   .tsx — the site's own preference, defaulting to ON for everyone — and NOT
   from the `prefers-reduced-motion` media query; read the note at the top of
   that file for why the OS setting no longer decides this. Lenis's own
   `respectReducedMotion` option would keep the instance alive with lerp 1;
   we never construct it at all.

   NOT ON TOUCH. `syncTouch` re-implements momentum scrolling in JavaScript.
   Every platform already has a better one, tuned to its own hardware, and the
   JS version is the source of the "the page fights me" complaints that follow
   smooth-scroll libraries around. `syncTouch: false` is only half of it: with
   it, `onVirtualScroll` falls through to its native branch for touch events
   and returns without calling `preventDefault`, but VirtualScroll has already
   bound `touchstart`/`touchmove` to window with `{ passive: false }`
   unconditionally, and a non-passive touchmove listener is scroll-blocking —
   the browser must wait for JavaScript before it may move the page, on every
   gesture, for the whole session, in exchange for a handler that does nothing.
   So a device whose primary pointer is a finger gets no instance at all and
   therefore no listeners; see the media query in the mount effect.

   REQUIRES CSS. app/globals.css carries the handful of rules from
   lenis/dist/lenis.css that this project needs, including the
   `html.lenis { scroll-behavior: auto }` override and
   `html { scroll-padding-top }`, which is where the header offset for anchors
   now lives. See the LENIS block there before changing anything here.
=========================================================================== */

/* ---------------------------------------------------------------------------
   The house curve, cubic-bezier(0.22, 1, 0.36, 1) / --ease-kofa, as a plain
   function of time. Lenis wants an easing function, not a CSS string, and its
   own default is a generic expo-out. Left alone, the one piece of motion the
   visitor explicitly asks for, clicking an anchor, would be the only motion on
   the site that does not move like the rest of it.

   Newton-Raphson to invert x(t), then evaluate y(t). Four passes is well past
   convergence for a curve this monotonic; the x slope at t=0 is 3·0.22, so it
   never divides by anything near zero.
--------------------------------------------------------------------------- */
const EASE = [0.22, 1, 0.36, 1] as const;

/** Cubic bezier through (0,0), (a,·), (b,·), (1,1), Horner-folded. */
function bezier(t: number, a: number, b: number): number {
  return ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;
}

function slope(t: number, a: number, b: number): number {
  return 3 * (1 - 3 * b + 3 * a) * t * t + 2 * (3 * b - 6 * a) * t + 3 * a;
}

function easeKofa(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let t = x;
  for (let i = 0; i < 4; i += 1) {
    const d = slope(t, EASE[0], EASE[2]);
    if (d === 0) break;
    t -= (bezier(t, EASE[0], EASE[2]) - x) / d;
  }
  return bezier(t, EASE[1], EASE[3]);
}

let instance: Lenis | null = null;

/* One module-level instance, so `getLenis()` can hand it to anything that
   needs to drive the scroll. That only stays honest if exactly one
   SmoothScroll is mounted: a second one would find `instance` already set,
   skip construction, and then destroy the first one's instance on unmount
   while the first one's rAF loop kept spinning forever. Counted, and refused
   loudly, rather than left to be discovered as a mystery frame cost. */
let mounts = 0;

/**
 * The live instance, or null when smoothing is off (reduced motion, or before
 * mount). Callers must handle null and fall back to `window.scrollTo`.
 */
export function getLenis(): Lenis | null {
  return instance;
}

export function SmoothScroll() {
  const pathname = usePathname();
  /* The route effect must not fire for the route we arrived on. */
  const settled = useRef(false);

  useEffect(() => {
    if (mounts > 0) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "SmoothScroll is mounted more than once. Mount it once, in app/layout.tsx.",
        );
      }
      return;
    }
    mounts += 1;

    /* The two conditions under which no instance may exist. Either is
       sufficient on its own:
         · motion off — the visitor asked the site to hold still, and
                        interpolating the scroll position is the most
                        pervasive motion on the page, and
         · coarse     — a finger has nothing to interpolate, and constructing
                        Lenis would bind the non-passive touch listeners
                        described at the top of this file for no benefit
                        whatsoever.
       `(pointer: coarse)` tests the PRIMARY pointer, so a touchscreen laptop
       driven by a trackpad still gets smooth wheel; a phone or tablet does
       not. */
    const coarse = window.matchMedia("(pointer: coarse)");
    /* Two independent reasons not to construct an instance, folded into one
       predicate so the start/stop logic below only has one thing to ask. The
       motion preference is the site's own (components/motion/MotionPreference
       .tsx), not the OS media query: the OS preference no longer decides this
       for the visitor. */
    const shouldStandDown = () => isMotionOff() || coarse.matches;
    let raf = 0;

    const frame = (time: number) => {
      instance?.raf(time);
      raf = requestAnimationFrame(frame);
    };

    /* Both loop controls are idempotent and total, so they can be called from
       the visibility listener and the media-query listener in any order and in
       any combination without leaking a second loop or losing the only one.
       rAF handles are guaranteed non-zero, so 0 is a safe "not running". */
    const startLoop = () => {
      if (raf || !instance || document.hidden) return;
      raf = requestAnimationFrame(frame);
    };

    const stopLoop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    /* Every overlay in this project locks the page by writing `overflow:
       hidden` inline, on <body> (Navigation's mobile panel, TeamGrid's member
       panel) or on <html> (Arrival's curtain). That lock only stops the NATIVE
       scroller. Lenis drives the page with `window.scrollTo`, which still
       moves a scroll container whose overflow is hidden, so with an instance
       running the wheel scrolled the page behind an open modal, and a flick
       past the end of TeamGrid's own overflow-y-auto panel handed the
       remainder of the gesture straight to the document underneath it.

       `stop()` is the fix rather than destroying the instance: `onVirtualScroll`
       consults its nested-scroll check BEFORE the stopped check, so the panel
       keeps scrolling itself natively while the page behind it swallows the
       wheel. Watching the one `style` attribute is the same mechanism
       components/ui/Cursor.tsx already uses to notice an overlay, and costs
       nothing between overlays. With `autoToggle` false Lenis never writes
       inline overflow itself, so this cannot feed back into its own
       observer. */
    const isLocked = () => {
      const html = document.documentElement.style.overflow;
      const body = document.body.style.overflow;
      return (
        html === "hidden" ||
        html === "clip" ||
        body === "hidden" ||
        body === "clip"
      );
    };

    const syncLock = () => {
      if (!instance) return;
      if (isLocked()) instance.stop();
      else instance.start();
    };

    const lockObserver = new MutationObserver(syncLock);

    const start = () => {
      if (instance) return;

      instance = new Lenis({
        /* lerp rather than duration+easing: `duration` re-times every wheel
           event from scratch, which makes a fast flick feel slower than a slow
           one. A lerp is proportional, so the response stays the same shape at
           any input speed. 0.085 lands close to the weight of a 1.5s
           ScrollSmoother, which is the reference we are matching, without
           tipping into the sludge that starts around 0.05. Deliberately no
           top-level `duration`/`easing`: Animate.advance prefers the
           duration+easing branch over the lerp branch, so setting either here
           would silently switch every wheel event back to fixed-duration. */
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        /* We own the loop so we can stop it on a hidden tab. */
        autoRaf: false,
        /* Lenis takes over same-page anchors. No `offset` here: scrollTo
           already subtracts the root element's `scroll-padding-top`, so the
           header clearance is stated once, in CSS, where native anchor jumps
           and scrollIntoView honour it too. An `offset` on top of that would
           apply the clearance twice, and would apply it only while Lenis is
           running, i.e. never under reduced motion or with JS off. */
        anchors: { duration: 1.1, easing: easeKofa },
        /* Clicking a link mid-flick should not keep coasting into the next
           route. Also what lets the route effect below stay this small: it
           calls `reset()` on the click, so the in-flight animation is already
           dead by the time the new route commits. */
        stopInertiaOnNavigate: true,
        /* Anything that scrolls inside itself keeps its own native scroll:
           the news filter lists, the portfolio browser, and any future
           overflow region. Note this is a heuristic on computed overflow;
           `data-lenis-prevent` is the explicit form and takes priority. */
        allowNestedScroll: true,
      });

      /* An overlay can already be up when this runs: Arrival locks <html> from
         its own mount effect, which commits after this one, and the preference
         listener can rebuild the instance at any point in the session. */
      if (isLocked()) instance.stop();

      startLoop();
    };

    const stop = () => {
      stopLoop();
      instance?.destroy();
      instance = null;
    };

    const sync = () => {
      if (shouldStandDown()) stop();
      else start();
    };

    /* A hidden tab still runs rAF in some browsers and never in others;
       either way there is nothing to interpolate, and a throttled loop makes
       the lerp arrive in visible steps when the tab comes back. */
    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    sync();
    coarse.addEventListener("change", sync);
    const unsubscribeMotion = onMotionChange(sync);
    document.addEventListener("visibilitychange", onVisibility);
    lockObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    lockObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      mounts -= 1;
      coarse.removeEventListener("change", sync);
      unsubscribeMotion();
      document.removeEventListener("visibilitychange", onVisibility);
      lockObserver.disconnect();
      stop();
    };
  }, []);

  /* App Router writes the new route's scroll position directly, and Lenis
     holds its own interpolated copy of that number. If the two disagree the
     page animates back to whatever Lenis still believed.

     Adopting `actualScroll` rather than forcing 0 is the whole point: a
     forward navigation has already been put at the top by the router, so this
     is a no-op, while a back/forward navigation has been *restored* to where
     the visitor was, and forcing 0 there threw that away. The immediate branch
     of scrollTo also calls reset(), which stops any animation still running.
     resize() afterwards re-measures, because Dimensions' ResizeObserver is
     debounced 250ms and until it fires `limit` still describes the old route,
     which lets a wheel flick overscroll past the new document end.

     Deferred a frame so it runs after the router has settled the scroll
     position, and re-reads the module-level instance inside the callback, so
     it can never touch one that was destroyed in between. */
  useEffect(() => {
    if (!settled.current) {
      settled.current = true;
      return;
    }

    const id = requestAnimationFrame(() => {
      const lenis = instance;
      if (!lenis) return;
      lenis.scrollTo(lenis.actualScroll, { immediate: true, force: true });
      lenis.resize();
    });

    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
