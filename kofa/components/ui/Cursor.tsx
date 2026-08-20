"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/ui/Arrow";
import {
  isMotionOff,
  onMotionChange,
} from "@/components/motion/MotionPreference";

/* ===========================================================================
   CURSOR
   ---------------------------------------------------------------------------
   The global pointer. Generalises components/ui/ViewCursor.tsx, which did the
   same job for portfolio tiles only, and keeps every one of its constraints:

     · fine pointers, no reduced motion, otherwise it does not exist at all;
     · `enabled` is state, not a render-time media query, so the server HTML
       and the first client render are byte-identical and hydration is clean
       (the HYDRATION RULE at the top of components/motion/Reveal.tsx);
     · the rAF loop stops the moment it has caught up, rather than writing a
       transform every frame for the life of the page;
     · JS owns `transform`, CSS owns everything else. The two elements JS
       writes carry NO transform transition; the shapes inside them are
       separate elements, so their `scale`/opacity/colour transitions cannot
       fight the loop.

   WHAT MAKES IT READ AS EXPENSIVE. Two bodies, not one: a 6px dot that sits
   almost on the pointer and a 30px hairline ring that trails it at 0.14. The
   gap between them opens when you move and closes when you stop, so the
   cursor has weight. That is KOFA's answer to the reference sites' cursor
   work — the same lead/lag signature, drawn as one hairline and one dot
   rather than as a pair of coloured blobs.

   STATES are resolved with `closest()` on the pointermove target, exactly as
   ViewCursor did:
     default  · dot + hairline ring
     link     · a / button / [role=button] / summary — ring opens to 46px in a
                stronger teal, dot fades out so the ring reads as a target
     view     · [data-view-cursor] — the 42px tinted disc carrying "View",
                preserved verbatim from ViewCursor
     external · a[target=_blank] — link, with the 45° arrow instead of nothing
     native   · fields, contenteditable and disabled controls — both bodies
                fade out and the real cursor takes over (see globals.css)

   TONE is a second, independent attribute rather than a fifth state, because
   it crosses all of them: `[data-cursor="light"]` (the deep-teal Conviction
   section) has to invert the ink cursor whether the pointer is over a link, a
   tile or nothing. Folding it into `data-state` would need one class per
   state × tone pair; switching a handful of custom properties on the host
   costs nothing and composes.

   It also publishes `--cursor-x` / `--cursor-y` on <html>, normalised 0..1,
   so other components can respond to the pointer in pure CSS without adding a
   second listener. They are seeded to 0.5 on mount and exist even where this
   component refuses to render, so `var(--cursor-x)` always resolves.

   Requires the `[data-kofa-cursor="on"]` block in app/globals.css; that
   attribute is set here, and only here, once the media checks have passed.
=========================================================================== */

type CursorState = "default" | "link" | "view" | "external" | "native";

/* Controls that own their own pointer affordance. A drawn dot cannot tell you
   where typing will land, or that a control is refusing input, so over these
   we stand aside and let the OS draw. Checkboxes and radios are excluded
   deliberately: they have no caret and nothing to say that the ring cannot,
   so they fall through to `link` below. Matched with `closest()`, so a
   disabled ancestor disables everything inside it. */
const NATIVE_SELECTOR = [
  /* Kept deliberately in step with the `cursor: text` list in app/globals.css.
     `cursor: none` is inherited by everything under [data-kofa-cursor], so any
     element that fades both drawn bodies out WITHOUT a matching rule there is
     left with no pointer at all. A blanket `input:not([type=checkbox])` swept
     up `type="range"`, `type="file"`, `type="color"` and `type="submit"`,
     none of which are on the CSS list; they fall through to the drawn default
     instead, which at least draws something. */
  'input:where([type="text"],[type="email"],[type="tel"],[type="url"],[type="search"],[type="password"],[type="number"],[type="date"],[type="datetime-local"],[type="time"],[type="month"],[type="week"],:not([type]))',
  "textarea",
  "select",
  '[contenteditable=""]',
  '[contenteditable="true"]',
  ":disabled",
  '[aria-disabled="true"]',
  "[data-native-cursor]",
].join(", ");

/* `label:has(input)` rather than `label[for]`: a caption sitting above a text
   field is not a target and should not grow a ring, but the radio pills in
   ContactForm are labels that wrap their own input and are the only thing
   there is to click. */
const LINK_SELECTOR = [
  "a[href]",
  "button",
  '[role="button"]',
  "summary",
  'label:has(input:not([type="hidden"]))',
  'input[type="checkbox"]',
  'input[type="radio"]',
].join(", ");

/* Lerp factors. The dot is deliberately not 1:1 — at 0.55 it still lands on
   the pointer within two frames but loses the mechanical, pixel-locked feel
   of a directly assigned position. The ring at 0.14 is the trailing body. */
const DOT_LERP = 0.55;
const RING_LERP = 0.14;

export function Cursor() {
  const hostRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  /* Capability check lives in its own effect so a preference changed mid
     session (macOS Reduce Motion is a single toggle away) tears the cursor
     down and hands the native one back, rather than leaving `cursor: none`
     on a page with nothing drawing a pointer. */
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");

    // Seeded here rather than in the loop below: consumers should be able to
    // read these on a touch device too, where they simply stay centred.
    const root = document.documentElement;
    root.style.setProperty("--cursor-x", "0.5");
    root.style.setProperty("--cursor-y", "0.5");

    const sync = () => setEnabled(fine.matches && !isMotionOff());
    sync();

    fine.addEventListener("change", sync);
    const unsubscribeMotion = onMotionChange(sync);
    return () => {
      fine.removeEventListener("change", sync);
      unsubscribeMotion();
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!enabled || !host || !ring || !dot) return;

    const root = document.documentElement;

    // Off-screen until the pointer first reports in, so nothing is parked at
    // 0,0 waiting to be noticed.
    let tx = -100;
    let ty = -100;
    let rx = -100;
    let ry = -100;
    let dx = -100;
    let dy = -100;

    let vw = window.innerWidth;
    let vh = window.innerHeight;

    let state: CursorState = "default";
    let tone: "ink" | "light" = "ink";
    let visible = false;
    let suppressed = false;

    /* `armed` — the pointer has reported at least once. `inside` — it is
       currently over the document.

       Both gate `data-kofa-cursor` and not just the drawn bodies' opacity,
       because that attribute is what applies `cursor: none` to the entire
       page. Setting it up front, as this did, meant a freshly loaded tab had
       no pointer of any kind — the native one suppressed, the drawn one still
       at `data-visible="false"` — until the visitor happened to move the
       mouse. Same on `pointerleave` and on window blur. The invariant is
       simply: the native pointer is hidden exactly while a drawn one is up. */
    let armed = false;
    let inside = false;

    let raf = 0;
    let running = false;

    /* One place decides both halves of that invariant, so they cannot drift
       apart. Everything that could change the answer — the first move, the
       pointer leaving the window, an overlay opening — calls this rather than
       touching the attribute or `data-visible` directly. */
    const refresh = () => {
      const on = armed && inside && !suppressed;
      if (on !== visible) {
        visible = on;
        host.dataset.visible = String(on);
      }
      if (on) root.setAttribute("data-kofa-cursor", "on");
      else root.removeAttribute("data-kofa-cursor");
    };

    /* An open overlay is the one case where hiding the drawn cursor is not
       enough: `cursor: none` is still inherited from <html>, so the visitor
       would be left with no pointer at all. Dropping the attribute restores
       the real one for as long as the overlay is up. */
    const setSuppressed = (next: boolean) => {
      if (next === suppressed) return;
      suppressed = next;
      refresh();
    };

    const resolve = (target: EventTarget | null): CursorState => {
      if (!(target instanceof Element)) return "default";
      if (target.closest(NATIVE_SELECTOR)) return "native";
      if (target.closest("[data-view-cursor]")) return "view";
      if (target.closest('a[target="_blank"]')) return "external";
      if (target.closest(LINK_SELECTOR)) return "link";
      return "default";
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;

      if (!armed) {
        /* First report: place both bodies on the pointer instead of letting
           them lerp in from the off-screen seed. The ring at 0.14 needs ~25
           frames to cross that distance, and the attribute goes on at the
           same moment, so without this there is a third of a second with the
           native pointer hidden and the drawn one still in transit. */
        dx = rx = tx;
        dy = ry = ty;
        armed = true;
      }
      inside = true;

      const nextState = resolve(e.target);
      if (nextState !== state) {
        state = nextState;
        host.dataset.state = state;
      }

      const nextTone =
        e.target instanceof Element && e.target.closest('[data-cursor="light"]')
          ? "light"
          : "ink";
      if (nextTone !== tone) {
        tone = nextTone;
        host.dataset.tone = tone;
      }

      refresh();
      start();
    };

    const tick = () => {
      /* Written from the raw pointer, not from the lagged ring: a component
         reading these wants where the pointer *is*. Writing them here rather
         than in the move handler keeps it to one style write per frame no
         matter how many pointermove events the browser coalesces into it. */
      root.style.setProperty("--cursor-x", (tx / vw).toFixed(4));
      root.style.setProperty("--cursor-y", (ty / vh).toFixed(4));

      dx += (tx - dx) * DOT_LERP;
      dy += (ty - dy) * DOT_LERP;
      rx += (tx - rx) * RING_LERP;
      ry += (ty - ry) * RING_LERP;

      dot.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) translate(-50%, -50%)`;

      // The ring is the slower body, so it is the one that decides whether
      // there is still work to do. Stop once it has arrived; without this the
      // loop runs forever, including while the page sits untouched.
      if (Math.abs(tx - rx) < 0.1 && Math.abs(ty - ry) < 0.1) {
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

    const onLeave = () => {
      inside = false;
      refresh();
    };
    const onEnter = () => {
      inside = true;
      refresh();
    };
    const onResize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
    };

    /* Every overlay in this project locks the page with an inline
       `overflow: hidden`, but not all of them lock the same element:
       Navigation.tsx and TeamGrid.tsx write it on <body>, Arrival.tsx writes
       it on <html>. Checking only <body>, as this did, left the arrival
       curtain — an opaque z-90 layer, over a cursor drawn at z-70 — running
       with `cursor: none` and nothing visible underneath it. Watching that one
       property on both elements is enough to know an overlay is up. */
    const readSuppressed = () =>
      document.body.style.overflow === "hidden" ||
      root.style.overflow === "hidden" ||
      root.hasAttribute("data-cursor-off");

    const observer = new MutationObserver(() => setSuppressed(readSuppressed()));
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    /* `style` on the root is also where the loop below writes --cursor-x/y, so
       this callback runs about once a frame while the pointer moves. It reads
       two inline properties and one attribute, touches no layout, and
       `setSuppressed` returns immediately when the answer has not changed. */
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-cursor-off", "style"],
    });
    setSuppressed(readSuppressed());

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      cancelAnimationFrame(raf);
      root.removeAttribute("data-kofa-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      data-state="default"
      data-tone="ink"
      data-visible="false"
      className={[
        "group/cursor pointer-events-none fixed inset-0 z-[70]",
        "opacity-0 transition-opacity duration-300 ease-kofa data-[visible=true]:opacity-100",
        // Colour is carried as custom properties on the host so that tone and
        // state stay independent: the state variants below pick a variable,
        // the tone variant below re-points it.
        "[--cur-line:rgba(23,109,103,0.34)]",
        "[--cur-line-strong:rgba(23,109,103,0.55)]",
        "[--cur-dot:#176d67]",
        // The "View" disc keeps its own teal regardless of tone: the tiles it
        // belongs to only ever sit on ivory, and matching ViewCursor exactly
        // matters more than theoretical completeness.
        "[--cur-view-line:rgba(23,109,103,0.28)]",
        "[--cur-view-fill:rgba(23,109,103,0.1)]",
        "[--cur-label:#0f524d]",
        "data-[tone=light]:[--cur-line:rgba(247,248,244,0.4)]",
        "data-[tone=light]:[--cur-line-strong:rgba(247,248,244,0.72)]",
        "data-[tone=light]:[--cur-dot:#b8cdc4]",
        "data-[tone=light]:[--cur-label:#e9f0eb]",
      ].join(" ")}
    >
      {/* --- trailing ring ------------------------------------------------
          This element is JS-owned: the rAF loop writes its transform every
          frame, so it carries no transition of its own. The shapes inside it
          are separate elements precisely so their easing cannot compound on
          top of the 0.14 lerp. 48px is a fixed box; the visible diameter is
          set by `scale`, which is cheaper than animating width/height and
          leaves the label unscaled. */}
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-12 w-12 will-change-transform"
      >
        <span
          className={[
            "absolute inset-0 rounded-full border",
            "[border-color:var(--cur-line)]",
            "transition-[scale,opacity,border-color,background-color] duration-[460ms] ease-kofa",
            "scale-[0.625]", // 30px
            "group-data-[state=link]/cursor:scale-[0.958]", // 46px
            "group-data-[state=link]/cursor:[border-color:var(--cur-line-strong)]",
            "group-data-[state=external]/cursor:scale-[0.958]",
            "group-data-[state=external]/cursor:[border-color:var(--cur-line-strong)]",
            "group-data-[state=view]/cursor:scale-[0.875]", // 42px
            "group-data-[state=view]/cursor:[border-color:var(--cur-view-line)]",
            "group-data-[state=view]/cursor:[background-color:var(--cur-view-fill)]",
            "group-data-[state=view]/cursor:backdrop-blur-[2px]",
            "group-data-[state=native]/cursor:scale-[0.35]",
            "group-data-[state=native]/cursor:opacity-0",
          ].join(" ")}
        />

        {/* "View", visually identical to ViewCursor's label: 9px, medium,
            uppercase, 0.14em tracking. Spelled out rather than written as
            `.type-eyebrow text-[9px]`, because a type utility's size is never
            overridden in this codebase — the utility's leading and tracking
            are solved for 11px, and a label that has to fit inside a 42px disc
            is not that utility, it is a different thing that happens to look
            like it. */}
        <span
          className={[
            "absolute inset-0 flex items-center justify-center",
            "scale-90 opacity-0 transition-[opacity,scale] duration-300 ease-kofa",
            "group-data-[state=view]/cursor:scale-100 group-data-[state=view]/cursor:opacity-100",
          ].join(" ")}
        >
          <span className="text-[9px] font-medium uppercase leading-none tracking-[0.14em] [color:var(--cur-label)]">
            View
          </span>
        </span>

        {/* Leaving the site. The site's one arrow, at 45°, rather than a
            second glyph invented for the cursor. */}
        <span
          className={[
            "absolute inset-0 flex items-center justify-center",
            "scale-90 opacity-0 transition-[opacity,scale] duration-300 ease-kofa",
            "group-data-[state=external]/cursor:scale-100 group-data-[state=external]/cursor:opacity-100",
            "[color:var(--cur-line-strong)]",
          ].join(" ")}
        >
          <Arrow size={13} dir="up-right" strokeWidth={1.25} />
        </span>
      </div>

      {/* --- leading dot -------------------------------------------------- */}
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 will-change-transform"
      >
        <span
          className={[
            "absolute inset-0 rounded-full",
            "[background-color:var(--cur-dot)]",
            "transition-[opacity,scale] duration-300 ease-kofa",
            // Over anything interactive the ring is the target indicator and
            // the dot would only sit inside it looking like dirt.
            "group-data-[state=link]/cursor:scale-0 group-data-[state=link]/cursor:opacity-0",
            "group-data-[state=external]/cursor:scale-0 group-data-[state=external]/cursor:opacity-0",
            "group-data-[state=view]/cursor:scale-0 group-data-[state=view]/cursor:opacity-0",
            "group-data-[state=native]/cursor:scale-0 group-data-[state=native]/cursor:opacity-0",
          ].join(" ")}
        />
      </div>
    </div>
  );
}
