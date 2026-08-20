"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/Reveal";
import { Rise } from "@/components/motion/Rise";
import { useMounted } from "@/components/motion/useMounted";
import { getLenis } from "@/components/motion/SmoothScroll";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { investmentProcess } from "@/data/site";

/* ===========================================================================
   INVESTMENT PROCESS — HORIZONTAL PINNED TRACK
   ---------------------------------------------------------------------------
   The replacement for Philosophy's five-across row. Same copy, same continuous
   hairline, same numbered nodes; the row now runs wider than the viewport and
   travels sideways while the section is held against the top of the screen.

   MECHANISM. A tall spacer (.ptrack) holds a `position: sticky` child that is
   exactly one viewport tall, so the spacer's surplus height is the distance
   the section stays pinned. `useScroll` reports progress across exactly that
   surplus, and the track is translated by `-progress × travel`. Nothing
   intercepts the wheel: this is native scrolling with a transform hung off it,
   so keyboard paging, find-in-page, the browser scrollbar and Lenis all keep
   working. A `wheel` handler that consumed events would have broken all four.

   THREE WAYS OUT, ALL OF THEM CSS. The pinned layout is the exception, not the
   default. It applies only inside
       @media (min-width: 1024px) and (prefers-reduced-motion: no-preference)
   and only under [data-ptrack-pin="true"], which React writes after mount. So
   the plain stacked list is what ships for narrow viewports, for a visitor who
   has switched motion off, and for a visitor whose JavaScript never runs — the
   last of which no media query can test for, and which would otherwise have
   left three of five stages clipped off-screen with no way to reach them.

   Because the fallback is a layout branch it is never a JS branch: the tree is
   identical either way. The transform stays attached in both modes and simply
   resolves to 0, because `travel` is measured from the laid-out track, and a
   stacked track is exactly as wide as its viewport.

   See app/globals.css → "HORIZONTAL PROCESS TRACK" for the layout itself.
=========================================================================== */

const HEADING_ID = "process-heading";
const LIST_ID = "process-stages";

/* A beat of held stillness at each end of the pin, expressed as a fraction of
   the pinned scroll distance rather than as pixels of extra height, so the
   hold scales with the travel. Without it the track is already moving on the
   frame it becomes sticky and stops on the frame it releases, which reads as
   two small jolts. 6% at each end is about 90px of scroll on a typical desk
   monitor: felt, not noticed. */
const HOLD = 0.06;

/** Arrow key ≈ one card, PageUp/PageDown ≈ two. */
const STEP = 0.2;
const PAGE = 0.4;

/** WCAG 2.2 SC 2.5.8: the draggable thumb's hit target, and its floor width. */
const THUMB_MIN = 48;

const TOTAL = String(investmentProcess.length).padStart(2, "0");

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Write a custom property only when it actually changes, so the ResizeObserver
    that triggered the write is not re-entered by its own side effect. */
function setVar(el: HTMLElement, name: string, value: string) {
  if (el.style.getPropertyValue(name) === value) return;
  if (value) el.style.setProperty(name, value);
  else el.style.removeProperty(name);
}

interface Metrics {
  /** px the track must travel left. 0 whenever the stacked fallback is live. */
  travel: number;
  /** px from the track's left edge to the first card, i.e. the container inset. */
  edge: number;
  /** Each card's left edge in track coordinates, px. */
  starts: number[];
  /** `starts` as a fraction of track width: the progress at which the drawn
      line reaches each node. Empty while the stacked fallback is live. */
  thresholds: number[];
}

const EMPTY: Metrics = { travel: 0, edge: 0, starts: [], thresholds: [] };

export function ProcessTrack() {
  const pinRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLLIElement | null>>([]);

  const metricsRef = useRef<Metrics>(EMPTY);
  const dragRef = useRef<{ id: number; x0: number; q0: number } | null>(null);

  const mounted = useMounted();
  /* Pinning the viewport and dragging the page sideways is the most
     disorienting thing on the site, so it is the first thing to go when a
     visitor switches motion off. False on the server and on the first client
     render, so the rendered attributes below match and hydration is clean; the
     real value lands one tick later and re-runs the measurement below. */
  const motionOff = useMotionOff();

  /* Everything measured lives in MotionValues rather than state, so a resize
     never costs a render and a scroll never costs one either. The single piece
     of state is `pinned`, and only because tabindex is a rendered attribute. */
  const travelMV = useMotionValue(0);
  const thumbWMV = useMotionValue(0);
  const thumbSpanMV = useMotionValue(0);
  const [pinned, setPinned] = useState(false);

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  /* One progress value drives the track, the drawn line, the nodes and the
     scrollbar, so they cannot drift apart. The two holds are folded in here
     once instead of at each consumer. */
  const progress = useTransform(scrollYProgress, [HOLD, 1 - HOLD], [0, 1]);

  const laneX = useTransform(
    [progress, travelMV],
    ([q, travel]: number[]) => -q * travel,
  );
  const thumbX = useTransform(
    [progress, thumbSpanMV],
    ([q, span]: number[]) => q * span,
  );

  /* ---- scroll-position writes ------------------------------------------- */

  const scrollToProgress = useCallback((q: number, smooth: boolean) => {
    const pin = pinRef.current;
    if (!pin) return;

    /* clientHeight on both sides, because that is what framer-motion's own
       scroll measurement uses; window.innerHeight includes the horizontal
       scrollbar and would put the end of the range a few px out. */
    const dist = pin.clientHeight - document.documentElement.clientHeight;
    if (dist <= 0) return;

    const top = pin.getBoundingClientRect().top + window.scrollY;
    const target = top + (HOLD + clamp01(q) * (1 - 2 * HOLD)) * dist;

    /* Lenis owns the scroll position when it is running, and writing straight
       to the window would be overwritten by its next frame. It is null under
       reduced motion and before mount, hence the fallback. `instant` is
       explicit because globals.css sets html { scroll-behavior: smooth }, and
       a 400ms animation per pointermove is not a drag. */
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(
        target,
        smooth ? { force: true } : { immediate: true, force: true },
      );
      return;
    }
    window.scrollTo({ top: target, behavior: smooth ? "smooth" : "instant" });
  }, []);

  /* ---- derived DOM state ------------------------------------------------ */

  /* Node fill, the live stage counter and the scrollbar's ARIA values are all
     one function of progress, written straight to the DOM. Putting them in
     state instead would re-render five cards on every scroll frame. */
  const apply = useCallback((q: number) => {
    const { thresholds } = metricsRef.current;
    const cards = cardRefs.current;

    let active = -1;
    for (let i = 0; i < cards.length; i += 1) {
      const on = thresholds.length === cards.length && q >= thresholds[i];
      if (on) active = i;
      const el = cards[i];
      if (el && el.dataset.on !== String(on)) el.dataset.on = String(on);
    }

    const stage = investmentProcess[active < 0 ? 0 : active];

    const count = countRef.current;
    if (count) {
      const text = `${stage.n} / ${TOTAL}`;
      if (count.textContent !== text) count.textContent = text;
    }

    const thumb = thumbRef.current;
    if (thumb) {
      /* Guarded like the dataset writes above. Unguarded these ran ~60 times a
         second for the whole length of the pin, and a screen reader watching a
         focused role="scrollbar" is told about every value change it sees. */
      const now = String(Math.round(clamp01(q) * 100));
      if (thumb.getAttribute("aria-valuenow") !== now) {
        thumb.setAttribute("aria-valuenow", now);
      }
      const text = `Stage ${stage.n} of ${TOTAL}, ${stage.title}`;
      if (thumb.getAttribute("aria-valuetext") !== text) {
        thumb.setAttribute("aria-valuetext", text);
      }
    }
  }, []);

  /* ---- measurement ------------------------------------------------------ */

  const measure = useCallback(() => {
    const pin = pinRef.current;
    const lane = laneRef.current;
    const view = viewRef.current;
    const rail = railRef.current;
    if (!pin || !lane || !view || !rail) return;

    /* The track is full-bleed, but its first card has to line up with the
       heading above it, which sits in a Container: a max-width plus a
       breakpoint ladder of paddings, and a centring offset past 1600px.
       Measuring the heading is exact at every width and stays correct if the
       Container ever changes; restating the ladder in CSS would not. */
    const head = headRef.current;
    if (head) {
      const edge = Math.round(
        head.getBoundingClientRect().left - pin.getBoundingClientRect().left,
      );
      if (edge > 0) setVar(pin, "--ptrack-edge", `${edge}px`);
    }

    const viewW = view.clientWidth;
    const trackW = lane.offsetWidth;
    const travel = Math.max(0, trackW - viewW);

    /* Both rects carry the same live translate, so the difference is the
       untranslated offset. Widths are unaffected by a translate either way. */
    const laneLeft = lane.getBoundingClientRect().left;
    const starts = cardRefs.current.map((c) =>
      c ? c.getBoundingClientRect().left - laneLeft : 0,
    );

    const railW = rail.clientWidth;
    const thumbW =
      travel > 0 && trackW > 0
        ? Math.max(THUMB_MIN, Math.round(railW * (viewW / trackW)))
        : 0;

    metricsRef.current = {
      travel,
      edge: starts.length ? starts[0] : 0,
      starts,
      /* Left empty in the stacked fallback, where every card starts at x≈0 and
         a naive threshold would light all five at once. */
      thresholds: travel > 0 && trackW > 0 ? starts.map((s) => s / trackW) : [],
    };

    travelMV.set(travel);
    thumbWMV.set(thumbW);
    thumbSpanMV.set(Math.max(0, railW - thumbW));

    /* The pinned distance is the travel, widened by the two holds. Expressed
       against 100vh in CSS so a change in viewport height does not need a
       remeasure. framer-motion re-reads the target's clientHeight on every
       scroll event, so a new value is picked up without prompting. */
    setVar(
      pin,
      "--ptrack-pin-h",
      travel > 0
        ? `calc(100vh + ${Math.round(travel / (1 - 2 * HOLD))}px)`
        : "",
    );

    /* Same value bails out of the render inside React, so this is free when
       nothing changed. A visitor who has switched motion off never pins, no
       matter how much the five cards overflow: the stacked fallback is the
       whole point of the CSS below. */
    setPinned(travel > 0 && !motionOff);
    apply(progress.get());
  }, [apply, progress, travelMV, thumbWMV, thumbSpanMV, motionOff]);

  useEffect(() => {
    measure();

    const ro = new ResizeObserver(() => measure());
    for (const el of [laneRef.current, viewRef.current, railRef.current]) {
      if (el) ro.observe(el);
    }
    /* The pin element itself is deliberately not observed: measure() writes
       its height, which would re-enter the observer on every pass. */
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    /* `mounted` is in here because it is what flips `data-ptrack-pin`, and that
       attribute is what switches the list from the stacked grid to the wide
       flex track. The first pass necessarily measures the stacked layout —
       lane width equals view width, travel 0, no pinned height — and the
       ResizeObserver does not rescue it, because the lane is 100% wide in both
       layouts and never changes size; only the list inside it does. So the
       measurement has to be told to run again once the layout it is measuring
       actually exists. Same for `motionOff`, which can flip the same attribute
       at any time from the footer control. */
  }, [measure, mounted, motionOff]);

  useEffect(() => progress.on("change", apply), [progress, apply]);

  /* Re-assert the imperative writes after any render, since React reconciling
     the counter's children would otherwise put the SSR text back. */
  useEffect(() => {
    apply(progress.get());
  });

  /* The viewport is `overflow: clip` where that is supported, which creates no
     scroll container at all. Where it falls back to `hidden` it does, and the
     browser will silently scroll it to bring a focused off-screen card into
     view — leaving the track permanently offset from the transform driving it.
     Cheaper to refuse the offset than to detect the fallback. */
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const onScroll = () => {
      if (view.scrollLeft !== 0) view.scrollLeft = 0;
      if (view.scrollTop !== 0) view.scrollTop = 0;
    };
    view.addEventListener("scroll", onScroll, { passive: true });
    return () => view.removeEventListener("scroll", onScroll);
  }, []);

  /* ---- scrollbar interaction -------------------------------------------- */

  const onThumbPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (metricsRef.current.travel <= 0 || thumbSpanMV.get() <= 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    /* Anchored on the progress at grab time rather than on the pointer's
       absolute position, so the thumb never jumps under the finger and the
       scroll writes we make cannot feed back into our own delta. */
    dragRef.current = { id: e.pointerId, x0: e.clientX, q0: progress.get() };
    e.preventDefault();
  };

  const onThumbPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    const span = thumbSpanMV.get();
    if (span <= 0) return;
    scrollToProgress(drag.q0 + (e.clientX - drag.x0) / span, false);
  };

  /* Also wired to `lostpointercapture`: capture is released implicitly if the
     thumb is hidden mid-drag (a resize across 1024px, or the reduced-motion
     preference flipping), and the pointerup then lands somewhere else. Without
     this the drag record survives, and the next plain hover over the thumb
     scrolls the page with no button held. */
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.id !== e.pointerId) return;
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onThumbKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (metricsRef.current.travel <= 0) return;
    const q = progress.get();
    let next: number;
    switch (e.key) {
      case "ArrowLeft":
        next = q - STEP;
        break;
      case "ArrowRight":
        next = q + STEP;
        break;
      case "PageUp":
        next = q - PAGE;
        break;
      case "PageDown":
        next = q + PAGE;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    scrollToProgress(next, true);
  };

  /* Tabbing reaches every card, including the ones currently translated past
     the right edge. Bring the focused one to the reading position rather than
     leaving focus somewhere the reader cannot see. Keyboard only: a click
     lands focus too, and jumping the page under a click is hostile. */
  const onCardFocus = (i: number) => (e: ReactFocusEvent<HTMLLIElement>) => {
    const { travel, starts, edge } = metricsRef.current;
    if (travel <= 0 || starts.length <= i) return;
    if (!e.currentTarget.matches(":focus-visible")) return;
    scrollToProgress((starts[i] - edge) / travel, true);
  };

  return (
    <Section
      space="roomy"
      id="approach"
      className="border-t border-rule bg-ivory"
      aria-labelledby={HEADING_ID}
    >
      <Container>
        {/* The header is the only part of this section in normal flow: it sits
            above the spacer, outside `.ptrack__view`'s clip and outside
            everything the scrub transforms, so it is the only part that can
            take the lateral entrance. Columns 1-6 and 9-12 are a paired grid,
            so they lean toward each other and the row closes on its own centre
            line. Nothing below this Container is touched — see the card below. */}
        <div ref={headRef} className="grid grid-cols-12 gap-y-8">
          <div className="col-span-12 lg:col-span-6">
            <Rise from="left">
              <Eyebrow index="02">How we invest</Eyebrow>
            </Rise>
            {/* The id lands on the Rise wrapper rather than the heading:
                SectionHeading takes no id, and aria-labelledby resolves the
                referenced element's text content either way. */}
            <Rise from="left" delay={0.06} id={HEADING_ID}>
              <SectionHeading className="mt-7 max-w-[15ch]">
                From scientific insight to{" "}
                <span className="accent-italic">meaningful</span> impact.
              </SectionHeading>
            </Rise>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <Rise from="right" delay={0.12}>
              <p className="type-body-sm max-w-[40ch] lg:pt-4">
                Evergreen capital sets our horizon by the science and the
                regulatory path rather than by a fund clock.
              </p>
            </Rise>
          </div>
        </div>
      </Container>

      {/* The spacer. Its surplus height over the sticky child is the pinned
          distance; in the stacked fallback it has no height of its own. */}
      <div
        ref={pinRef}
        className="ptrack mt-[clamp(4rem,8vw,7rem)]"
        /* This attribute ENABLES the pinned layout in CSS; it must not be
           derived from `pinned`, which is the RESULT of measuring that layout.
           Gating it on the measurement made the two circular: the stacked
           fallback never overflows, so travel stayed 0, so the attribute
           stayed false, so the pinned layout never applied. Mount plus the
           motion preference, and nothing else. */
        data-ptrack-pin={mounted && !motionOff ? "true" : "false"}
      >
        <div className="ptrack__sticky">
          <div ref={viewRef} className="ptrack__view">
            <motion.div
              ref={laneRef}
              className="ptrack__lane"
              /* Always present, never conditional: in the stacked fallback the
                 measured travel is 0, so this resolves to 0 rather than being
                 removed. Removing it would change the rendered markup on a
                 client-only value. */
              style={{ x: laneX }}
            >
              {/* The continuous hairline, now horizontal. It spans the whole
                  track including its end insets, so the teal fill's scaleX is
                  progress exactly, and each node lights at the moment the fill
                  reaches it. */}
              <div className="ptrack__line" aria-hidden="true">
                <motion.span
                  className="ptrack__line-fill"
                  style={{ scaleX: progress }}
                />
              </div>

              <ol id={LIST_ID} className="ptrack__list">
                {investmentProcess.map((stage, i) => (
                  <li
                    key={stage.n}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="ptrack__card"
                    data-on="false"
                    /* -1 until the track is genuinely pinned: in the stacked
                       fallback these are five plain paragraphs and five extra
                       tab stops would be noise. Derived from the measured
                       travel, not from a media query, so it follows the CSS. */
                    tabIndex={pinned ? 0 : -1}
                    onFocus={onCardFocus(i)}
                  >
                    <span className="ptrack__node" aria-hidden="true" />

                    {/* Stays Reveal, deliberately. Rise's skew needs room
                        outside the border box and this sits inside
                        `.ptrack__view`, which is `overflow: clip` in pinned
                        mode; and the lane above it is already carrying the
                        scrub's translate, which a second transform here would
                        compose with. Neutral fade-up is the right register
                        inside the track anyway — the track's own sideways
                        travel is the gesture. */}
                    <Reveal delay={i * 0.06} y={18}>
                      <span className="ptrack__n type-eyebrow tabular-nums text-ink-mute">
                        {stage.n}
                      </span>
                      <h3 className="ptrack__title">{stage.title}</h3>
                      <p className="ptrack__body type-body-xs">{stage.body}</p>
                    </Reveal>

                    <div className="ptrack__cardrule" aria-hidden="true">
                      <span className="ptrack__cardrule-fill" />
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>

          {/* The custom scrollbar. Never the only way through the track — the
              page scrolls it, arrow keys scroll it, tabbing scrolls it — but
              it is the one that shows how far along the reader is. */}
          <div className="ptrack__bar">
            <div className="ptrack__bar-head">
              <span
                ref={countRef}
                className="type-eyebrow tabular-nums text-ink-mute"
              >
                {`${investmentProcess[0].n} / ${TOTAL}`}
              </span>
            </div>
            <div ref={railRef} className="ptrack__bar-rail">
              <motion.div
                ref={thumbRef}
                className="ptrack__thumb"
                role="scrollbar"
                aria-label="Investment process position"
                aria-controls={LIST_ID}
                aria-orientation="horizontal"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={0}
                tabIndex={0}
                style={{ x: thumbX, width: thumbWMV }}
                onPointerDown={onThumbPointerDown}
                onPointerMove={onThumbPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onLostPointerCapture={endDrag}
                onKeyDown={onThumbKeyDown}
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
