"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Motion runs its animation lifecycle unconditionally; reduced motion is
 * enforced by this project in CSS instead.
 *
 * WHY: left to its own reduced-motion handling, the library declines to run
 * animations at all. Entrances then never reach their visible state, and,
 * worse, `AnimatePresence` exits never *complete*, so nothing unmounts. A
 * dismissed team panel stayed in the DOM with `aria-modal="true"` and a
 * full-viewport overlay still intercepting clicks: the page looked fine and
 * was entirely inert.
 *
 * With `reducedMotion="never"` the library always finishes its transitions,
 * while the real contract is kept in two stricter places:
 *   · every transition here resolves to `duration: 0` when
 *     `useReducedMotion()` is true, so nothing actually travels, and
 *   · `@media (prefers-reduced-motion: reduce)` in app/globals.css pins
 *     [data-reveal] / [data-lag] to opacity 1 and transform none with
 *     !important, which no inline style can override.
 *
 * Net effect for a reduced-motion visitor: content is visible immediately,
 * nothing moves, and overlays still unmount. Do not "simplify" this back to
 * the library default.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
