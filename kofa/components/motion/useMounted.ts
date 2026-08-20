"use client";

import { useEffect, useState } from "react";

/**
 * False on the server and during the first client render; true afterwards.
 *
 * Use this whenever a value that only exists in the browser, a media query, a
 * measurement, `window` anything, would otherwise change what gets rendered.
 * Gating on it keeps first paint byte-identical to the server HTML, so React
 * hydrates cleanly, and the browser-only value takes effect one tick later.
 *
 * Pairs with the reduced-motion rule documented in
 * components/motion/Reveal.tsx.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
