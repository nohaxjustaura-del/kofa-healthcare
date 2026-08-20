"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";

/* ===========================================================================
   TABLIST KEYBOARD BEHAVIOUR
   ---------------------------------------------------------------------------
   Declaring role="tablist" is a promise to assistive tech that the group is
   arrow-navigable, Tab enters the set, arrows move within it. Without that,
   a screen-reader user is told there are six tabs and then finds only one
   reachable stop.

   Implements the WAI-ARIA Tabs pattern with automatic activation:
     ← / ↑     previous, wrapping
     → / ↓     next, wrapping
     Home/End  first / last
   plus roving tabindex, so the set is a single Tab stop and the selected
   filter is where focus lands when you come back to it.
=========================================================================== */

export function useTablist<T>(items: T[], onSelect: (item: T) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const register = useCallback(
    (i: number) => (el: HTMLButtonElement | null) => {
      refs.current[i] = el;
    },
    [],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
      const last = items.length - 1;
      let next: number | null = null;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          next = i === 0 ? last : i - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          next = i === last ? 0 : i + 1;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = last;
          break;
        default:
          return;
      }

      e.preventDefault();
      onSelect(items[next]);
      refs.current[next]?.focus();
    },
    [items, onSelect],
  );

  return { register, onKeyDown };
}
