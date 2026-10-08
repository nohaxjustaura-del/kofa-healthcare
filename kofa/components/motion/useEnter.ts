"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { isMotionOff } from "@/components/motion/MotionPreference";

/* ===========================================================================
   ENTRANCE, ONCE, ON SCROLL
   ---------------------------------------------------------------------------
   The one piece of JavaScript behind Reveal and Rise. It replaces
   framer-motion's `whileInView`, which was the only reason ~39 KB of
   gzipped animation library shipped on every page of the site.

   THE SERVER HTML IS THE FINISHED PAGE. Nothing is rendered hidden. The
   entrance is an enhancement applied after hydration, and only to elements
   that are still BELOW the fold at that moment:

     · already on screen (or scrolled past)   left exactly as painted. No
                                              flash, no delay, nothing for
                                              the Largest Contentful Paint to
                                              wait on. framer rendered these
                                              at opacity 0 until hydration,
                                              which held every article
                                              headline back by ~1 s on a
                                              throttled phone.
     · below the fold                         marked "armed" (the CSS hides
                                              it, invisibly, since it is off
                                              screen), then marked "in" when
                                              it scrolls into view, and the
                                              stylesheet transitions it home.
     · motion off, or no JavaScript           never armed, so always visible.
                                              The CSS also scopes the hidden
                                              state to html[data-motion="on"],
                                              so switching motion off mid-page
                                              shows anything still waiting.

   The state lives in `data-enter-state`, written straight onto the element.
   React renders the constant `data-enter` marker and never the state, so
   nothing React does on a re-render can reset it. Durations, delays and the
   starting transform are CSS custom properties set by the component; see
   the ENTRANCES block in app/globals.css.
=========================================================================== */

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Same trigger line framer used: the element's top 12% into the viewport. */
const MARGIN = "0px 0px -12% 0px";

export function useEnter<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || isMotionOff() || typeof IntersectionObserver === "undefined") {
      return;
    }
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.enterState = "armed";
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        el.dataset.enterState = "in";
      },
      { rootMargin: MARGIN },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      // An element unmounted mid-wait must not come back hidden if React
      // reuses the node (Strict Mode's double effect does exactly that).
      if (el.dataset.enterState === "armed") delete el.dataset.enterState;
    };
  }, []);

  return ref;
}
