"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ===========================================================================
   MOTION PREFERENCE
   ---------------------------------------------------------------------------
   The single source of truth for "should this animate?", replacing every
   hand-rolled `matchMedia("(prefers-reduced-motion: reduce)")` check the
   project used to have.

   WHY THIS EXISTS, AND WHAT CHANGED.

   The site previously took `prefers-reduced-motion` as the whole answer, so a
   visitor whose operating system had animation effects switched off got a
   near-static page: no entrances, no marquee and no film. That is a
   defensible reading of the preference, and it is what the code did.

   It is not what this site wants. The Windows "Animation effects" toggle is
   commonly switched off for perceived speed rather than for a vestibular
   condition, it is off by default under some power configurations, and the
   sites this design is measured against do not honour the preference at all.
   The result was that a large, silent share of visitors were shown a
   deliberately worse version of the design and had no way to know, let alone
   to opt back in.

   So the OS preference is no longer consulted for the DEFAULT. Motion is on
   for everyone, and the decision is handed to the visitor instead, as an
   explicit control in the footer (components/ui/MotionToggle.tsx). Anyone who
   needs the page to hold still can still make it hold still, in one click,
   and the choice persists.

   THE DOM IS THE SOURCE OF TRUTH, NOT REACT STATE.
   The preference lives in `data-motion` on <html>, written before first paint
   by the inline script in app/layout.tsx. Everything else mirrors it:
     · CSS reads `html[data-motion="off"]` directly, so the stylesheet is
       correct on the very first frame with no flash. That covers the
       marquee, the grain, the route sweep and every entrance's hidden state.
     · React components read it through `useMotionOff()` (PortfolioVideo).
     · Code outside React rendering (the hero film's timeline, the entrance
       observer, the team sheet's exit) reads `isMotionOff()` and, where it
       must react mid-visit, subscribes with `onMotionChange()`.
   One attribute, three readers, no chance of the three disagreeing.

   HYDRATION. `motionOff` is `false` on the server AND on the first client
   render, always. The real value is adopted in a layout effect, i.e. after
   hydration has matched and before the browser paints. That is why the
   pre-paint script exists: the script makes the FIRST PAINT correct via CSS,
   this provider makes REACT correct one tick later, and neither has to lie to
   the other in between.
=========================================================================== */

const STORAGE_KEY = "kofa:motion";
const ATTR = "data-motion";

/* `useLayoutEffect` warns when React renders on the server. Choosing the hook
   by environment is a module-level constant, stable for the life of the
   process, so it never changes render output. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Is motion switched off right now?
 *
 * For use OUTSIDE React rendering, inside effects, rAF loops and class
 * constructors. Inside a component, use `useMotionOff()` instead so the
 * component re-renders when the preference changes.
 *
 * Returns false (motion on) when there is no document, which is both the
 * server case and the correct default.
 */
export function isMotionOff(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute(ATTR) === "off";
}

/**
 * Subscribe to preference changes. Returns an unsubscribe function.
 *
 * A MutationObserver on the one attribute rather than a custom event: the
 * attribute is the state, so observing it cannot miss a change made by
 * anything that did not know to also fire the event.
 */
export function onMotionChange(callback: (off: boolean) => void): () => void {
  if (typeof document === "undefined") return () => {};
  const root = document.documentElement;
  let last = isMotionOff();

  const observer = new MutationObserver(() => {
    const next = isMotionOff();
    if (next === last) return;
    last = next;
    callback(next);
  });

  observer.observe(root, { attributes: true, attributeFilter: [ATTR] });
  return () => observer.disconnect();
}

interface MotionPreference {
  /** True when the visitor has asked the site to hold still. */
  motionOff: boolean;
  setMotionOff: (off: boolean) => void;
}

const MotionPreferenceContext = createContext<MotionPreference>({
  motionOff: false,
  setMotionOff: () => {},
});

export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  // Never seeded from the DOM or from storage: see the hydration note above.
  const [motionOff, setState] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setState(isMotionOff());
    // Written by another tab, or by anything else that moves the attribute.
    return onMotionChange(setState);
  }, []);

  const setMotionOff = useCallback((off: boolean) => {
    // The attribute is written FIRST. It is what CSS reads, and the observer
    // above is what turns it back into React state, so there is exactly one
    // path by which the preference can change.
    document.documentElement.setAttribute(ATTR, off ? "off" : "on");
    try {
      window.localStorage.setItem(STORAGE_KEY, off ? "off" : "on");
    } catch {
      // Private-mode storage throws. The preference then lasts for this
      // document only, which is better than the click doing nothing.
    }
    setState(off);
  }, []);

  const value = useMemo(
    () => ({ motionOff, setMotionOff }),
    [motionOff, setMotionOff],
  );

  return (
    <MotionPreferenceContext.Provider value={value}>
      {children}
    </MotionPreferenceContext.Provider>
  );
}

/**
 * "True means do not travel." Keep obeying the hydration rule: this value is
 * false on the server and on the first client render, so it may decide what
 * an effect does, and must never decide markup that reaches the DOM.
 */
export function useMotionOff(): boolean {
  return useContext(MotionPreferenceContext).motionOff;
}

/** For the control itself. Everything else wants `useMotionOff()`. */
export function useMotionPreference(): MotionPreference {
  return useContext(MotionPreferenceContext);
}

/**
 * The pre-paint script, kept here so it lives beside the key and the attribute
 * name it depends on. Injected by app/layout.tsx.
 *
 * Motion defaults to ON. The OS `prefers-reduced-motion` preference is
 * deliberately NOT consulted, see the note at the top of this file.
 */
export const MOTION_PREFERENCE_SCRIPT = `try{var m=localStorage.getItem("${STORAGE_KEY}");document.documentElement.setAttribute("${ATTR}",m==="off"?"off":"on")}catch(e){document.documentElement.setAttribute("${ATTR}","on")}`;
