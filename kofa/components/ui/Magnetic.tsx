"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { isMotionOff } from "@/components/motion/MotionPreference";

/* ===========================================================================
   MAGNETIC
   ---------------------------------------------------------------------------
   Wraps a button or a link and lets it lean a few pixels toward the pointer
   as it approaches, then settle back when the pointer leaves. A hover stops
   being a state change and becomes a small negotiation: the control reaches
   back before you arrive.

   This used to be half of a pair, with components/ui/Cursor.tsx drawing a ring
   that reached for the control at the same moment. That component was deleted
   — a JS-followed pointer trails the hand by enough frames to read as the
   whole page lagging — so this now stands on its own, against the native
   cursor. It still works: the lean is on the control, not on the pointer.

   Kept deliberately small. `strength` 0.25 over a 90px radius means a control
   never travels more than ~22px, and the default settle is an ease-out, not a
   spring with overshoot — an institutional site cannot have its buttons
   wobble.

   CONSTRAINTS, all of them load-bearing:
     · Transform only. The wrapper is `inline-block`, i.e. the same
       inline-level box the button already was, and nothing it does affects
       layout. Nothing reflows, nothing beneath it moves.
     · Hit testing and focus rings follow the transform, so the target is
       always where it looks like it is. There is no separate, larger
       invisible hit area to get out of sync.
     · The wrapper is a bare <span> with no handlers and no tabindex: it
       cannot swallow a click and it adds nothing to the tab order.
     · `(pointer: fine)` only, and a no-op under reduced motion — in both
       cases the effect returns before it writes anything and the child simply
       behaves normally. The markup is identical either way, so there is no
       hydration branch here (see components/motion/Reveal.tsx).
=========================================================================== */

/* How fast the element chases its target offset. 0.16 lands it in ~6 frames
   without overshoot, which is the same character as --ease-kofa. */
const LERP = 0.16;

export function Magnetic({
  children,
  strength = 0.25,
  radius = 90,
  className = "",
}: {
  children: ReactNode;
  /** Fraction of the pointer offset the child follows. 0.15-0.35 is usable. */
  strength?: number;
  /** Sensing distance in px, measured from the element's edge. */
  radius?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || isMotionOff()) return;

    let px = -9999;
    let py = -9999;
    let x = 0;
    let y = 0;

    let rect: DOMRect | null = null;
    let rectDirty = true;

    let raf = 0;
    let running = false;

    const clamp = (v: number, limit: number) =>
      v > limit ? limit : v < -limit ? -limit : v;

    const write = () => {
      el.style.transform =
        x === 0 && y === 0
          ? ""
          : `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    };

    const tick = () => {
      /* Measured inside the frame rather than in the scroll handler: reading
         layout from a scroll listener forces a synchronous reflow on a page
         that is already interpolating its own scroll position. */
      if (rectDirty || rect === null) {
        rect = el.getBoundingClientRect();
        rectDirty = false;
      }
      const box = rect;

      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const ox = px - cx;
      const oy = py - cy;

      /* Distance from the element's EDGE, not its centre. A 220px-wide button
         measured from the centre would only start responding once the pointer
         was already inside it, which is exactly when the effect has nothing
         left to say. */
      const ex = Math.max(0, Math.abs(ox) - box.width / 2);
      const ey = Math.max(0, Math.abs(oy) - box.height / 2);
      const near = ex * ex + ey * ey <= radius * radius;

      // The pull is still measured from the centre, capped so a long element
      // cannot be dragged further than a short one.
      const limit = radius * strength;
      const gx = near ? clamp(ox * strength, limit) : 0;
      const gy = near ? clamp(oy * strength, limit) : 0;

      x += (gx - x) * LERP;
      y += (gy - y) * LERP;

      // Stop when there is nothing left to move. Snapping to the target on the
      // last frame is what lets `write()` clear the transform outright when it
      // returns to rest, so an idle page holds no promoted layers.
      if (Math.abs(gx - x) < 0.05 && Math.abs(gy - y) < 0.05) {
        x = gx;
        y = gy;
        write();
        el.style.willChange = "";
        running = false;
        return;
      }

      write();
      raf = requestAnimationFrame(tick);
    };

    // An arrow rather than a hoisted declaration: TypeScript keeps the
    // non-null narrowing of `el` across an arrow function but not across a
    // function declaration.
    const start = () => {
      if (running) return;
      running = true;
      el.style.willChange = "transform";
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      start();
    };

    // Pointer gone from the window: release, do not freeze mid-lean.
    const onLeave = () => {
      px = -9999;
      py = -9999;
      start();
    };

    const invalidate = () => {
      rectDirty = true;
      /* Scrolling moves the element out from under a stationary pointer, and
         not every browser synthesises a pointermove afterwards — Firefox does
         not. Marking the rect dirty is not enough on its own: with the loop
         already stopped, a lean taken before the scroll stays
         written, so a button that has been scrolled well away from the
         pointer sits visibly displaced until the mouse next moves. Only worth
         a frame when the child is actually displaced — at rest there is
         nothing to correct, and re-promoting a layer on every scroll event is
         not free. */
      if (x !== 0 || y !== 0) start();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      cancelAnimationFrame(raf);
      el.style.transform = "";
      el.style.willChange = "";
    };
  }, [strength, radius]);

  return (
    <span ref={ref} data-magnetic className={`inline-block ${className}`}>
      {children}
    </span>
  );
}
