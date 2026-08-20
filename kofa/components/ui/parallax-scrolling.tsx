"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  isMotionOff,
  onMotionChange,
} from "@/components/motion/MotionPreference";

/* ===========================================================================
   PARALLAX LAYERS
   ---------------------------------------------------------------------------
   A scrubbed depth stage. Children marked `data-parallax-layer="1..n"` are
   translated by a different `yPercent` as the stage scrolls past, so they
   separate the way planes at different distances do. Layer 1 is the FARTHEST
   and travels the most; the last layer is the NEAREST and travels the least.

   WHY THAT MAPPING IS THE RIGHT WAY ROUND. The page already carries every
   layer upward by the scroll distance S. A positive `yPercent` pushes a layer
   back down, so its net movement is (yPercent - S): the larger the yPercent,
   the less it appears to move, and a thing that barely moves reads as distant.
   The near layer, given almost no yPercent, rides up with the page and sweeps
   across whatever sits behind it. That sweep is the whole effect: content
   placed on a middle layer is uncovered on the way in and occluded on the way
   out, without anything being pinned or resized.

   ---------------------------------------------------------------------------
   THREE THINGS THIS DELIBERATELY DOES NOT DO
   ---------------------------------------------------------------------------

   1. IT DOES NOT CONSTRUCT LENIS. The reference implementation this is adapted
      from ends with `new Lenis()` and `lenis.on("scroll", ScrollTrigger.update)`.
      This project already owns exactly one Lenis, built and torn down by
      components/motion/SmoothScroll.tsx, which counts its own mounts and
      refuses a second. A second instance here would mean two rAF loops both
      writing `window.scrollTo` every frame, fighting over the same number.

      No proxy wiring is needed to replace it. SmoothScroll runs Lenis in
      WINDOW MODE on purpose (see the long note at the top of that file), which
      means it writes the real window scroll position once a frame rather than
      translating a wrapper. Native `scroll` events therefore still fire, and
      ScrollTrigger's own listener picks them up unchanged, for the same reason
      `useScroll`, `position: sticky` and IntersectionObserver keep working
      here. If SmoothScroll is ever switched to wrapper mode, this file needs a
      `ScrollTrigger.scrollerProxy` and that paragraph needs deleting.

   2. IT DOES NOT KILL SCROLLTRIGGERS GLOBALLY. `ScrollTrigger.getAll().forEach(
      st => st.kill())` in a cleanup destroys every trigger on the page,
      including ones belonging to components that are still mounted. Everything
      created below is created inside a `gsap.context()` scoped to this
      element, so `ctx.revert()` kills precisely what this instance made and
      restores the inline styles it wrote. That is also what makes the
      component safe under React Strict Mode, which mounts, unmounts and
      remounts every effect in development.

   3. IT DOES NOT READ `prefers-reduced-motion`. The site's own preference,
      `html[data-motion]`, is the source of truth here: see
      components/motion/MotionPreference.tsx for why the OS query no longer
      decides this. With motion off the timeline is never built, and the
      `data-lag` attribute on each layer lets the stylesheet pin the elements
      to `transform: none !important` regardless.

   HYDRATION. Every layer renders unconditionally, in its authored position, on
   the server and on the first client render. GSAP only ever writes transforms
   after mount, so no markup depends on the preference, the viewport or the
   scroll position. Same rule as components/motion/Reveal.tsx.
=========================================================================== */

/* ScrollTrigger touches `document` as it initialises, and this module is still
   evaluated on the server despite "use client". Registering is idempotent, so
   the guard is the only thing that has to be right. */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Far to near. Four planes is the useful maximum: past that the rates are
 * closer together than a reader can distinguish, and every extra layer is
 * another full-bleed element being composited for the whole scroll.
 */
export const PARALLAX_DEPTHS = [70, 55, 40, 10] as const;

export function ParallaxLayers({
  children,
  depths = PARALLAX_DEPTHS,
  start = "top top",
  end = "bottom top",
  className = "",
}: {
  children: ReactNode;
  /** yPercent per layer, index 0 being `data-parallax-layer="1"`. */
  depths?: readonly number[];
  /** ScrollTrigger start, relative to this element. */
  start?: string;
  /** ScrollTrigger end, relative to this element. */
  end?: string;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  /* Arrays are a fresh identity on every render, so the array itself can never
     be an effect dependency: an inline `depths={[70, 40]}` at a call site would
     tear the timeline down and rebuild it on every parent render. The contents
     are what actually matter, and they are numbers. */
  const depthKey = depths.join(",");

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const values = depthKey.split(",").map(Number);
    let ctx: gsap.Context | null = null;

    const build = () => {
      /* Revert first, unconditionally. This runs again whenever the visitor
         changes the motion preference, and the old context has to give back
         the inline transforms it wrote before a new one starts writing. */
      ctx?.revert();
      ctx = null;

      if (isMotionOff()) return;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start, end, scrub: true },
        });

        values.forEach((yPercent, i) => {
          const targets = el.querySelectorAll(
            `[data-parallax-layer="${i + 1}"]`,
          );
          /* A stage may legitimately use fewer layers than it was given depths
             for. Handing gsap an empty NodeList would create a tween with
             nothing to animate and, more to the point, one with a duration,
             which would stretch the timeline and quietly change what scroll
             progress every OTHER layer is mapped to. */
          if (!targets.length) return;
          /* Position 0 for all of them: these are simultaneous rates, not a
             sequence. `ease: "none"` is what makes the movement linear in
             SCROLL rather than linear in time, which is the entire point of a
             scrubbed timeline. */
          tl.to(targets, { yPercent, ease: "none" }, 0);
        });
      }, el);
    };

    build();
    const unsubscribe = onMotionChange(build);

    /* Web fonts land after first paint and change the height of anything with
       text in it, which moves the end position this stage was measured
       against. ScrollTrigger refreshes itself on `load` and on resize, but not
       on a font swap. One refresh once the fonts have settled costs a single
       measurement pass and removes a class of "the effect is offset by 30px on
       a cold load" bug. */
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      unsubscribe();
      ctx?.revert();
    };
  }, [depthKey, start, end]);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

/**
 * One plane of a `ParallaxLayers` stage. Nothing more than the data attribute
 * and the positioning every layer needs, but it keeps the depth number legible
 * at the call site and stops the attribute from being misspelled somewhere
 * that would silently just not move.
 *
 * `data-lag` is what the motion-off stylesheet targets; see the note above.
 */
export function ParallaxLayer({
  depth,
  children,
  className = "",
}: {
  /** 1-based, matching the index into the stage's `depths`. 1 is farthest. */
  depth: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-parallax-layer={depth}
      data-lag
      className={`absolute inset-0 ${className}`}
    >
      {children}
    </div>
  );
}
