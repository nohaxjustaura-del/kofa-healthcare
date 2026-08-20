"use client";

import { useEffect, useRef, useState } from "react";
import { isMotionOff } from "@/components/motion/MotionPreference";

/* ===========================================================================
   VIEW CURSOR
   ---------------------------------------------------------------------------
   A 42px contextual cursor that appears only over portfolio tiles, never
   globally (§25). Fine pointers only; disabled entirely under reduced motion,
   where the native cursor is left alone.
=========================================================================== */

export function ViewCursor({ label = "View" }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = isMotionOff();
    if (!fine || reduced) return;
    setEnabled(true);

    const el = ref.current;
    if (!el) return;

    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let over = false;
    let raf = 0;
    let running = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const target = (e.target as HTMLElement | null)?.closest("[data-view-cursor]");
      const next = Boolean(target);
      if (next !== over) {
        over = next;
        el.dataset.over = String(over);
      }
      start();
    };

    const tick = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;

      // Stop once we have caught up. Without this the loop writes a transform
      // every frame for the life of the page, including the long stretches
      // where the pointer has not moved and the cursor is invisible.
      if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-over="false"
      // `transform` is deliberately NOT in the transition list: the rAF loop
      // writes it every frame, and a 300ms transform transition would restart
      // on every write, compounding a second easing on top of the 0.22 lerp
      // and pinning a main-thread animation to a backdrop-blurred fixed
      // element. JS owns transform; CSS owns opacity and scale.
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-[42px] w-[42px] items-center justify-center rounded-full border border-[rgba(23,109,103,0.28)] bg-[rgba(23,109,103,0.1)] backdrop-blur-[2px] transition-[opacity,scale] duration-300 ease-kofa lg:flex data-[over=false]:scale-50 data-[over=false]:opacity-0 data-[over=true]:scale-100 data-[over=true]:opacity-100"
    >
      <span className="type-eyebrow text-[9px] text-teal-deep">{label}</span>
    </div>
  );
}
