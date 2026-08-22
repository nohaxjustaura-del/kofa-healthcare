"use client";

import {
  motion,
  type HTMLMotionProps,
  type TargetAndTransition,
  type Variants,
} from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import {
  useCallback,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ===========================================================================
   RISE
   ---------------------------------------------------------------------------
   The site's *characterful* entrance, a sibling to Reveal, not a replacement.
   Reveal (opacity + 20px y) is the neutral one and stays the default for prose
   and single elements. Rise is for composed things, grid columns, cards, the
   pieces a reader perceives as having been arranged, and it adds three things
   Reveal does not have: lateral travel, a hair of skew, and a hair of scale.

   Together those read as WEIGHT: the block arrives as an object with mass
   rather than as a paragraph fading up. The reference for the idea is
   fahrenheit.ch, which throws cards in from `x:380 y:180 skewY:7`. That is an
   agency portfolio's register. KOFA's is a tenth of it, x:18 y:26 skewY:1.4,
   and the test is that a visitor should never be able to name the effect. If
   you can see the skew as skew, it is turned up too far.

   HYDRATION RULE: identical to Reveal.tsx, read the long comment there. In
   short, `initial` is the only prop here that reaches the DOM and it never
   branches on a client-only value. `from` is a plain prop with the same value
   on the server and the client, so branching `initial` on it is safe; branching
   on `useMotionOff()` would not be. Reduced motion is expressed as
   `animate` instead of `whileInView`, plus `duration: 0`.

   TWO HAZARDS, both caused by the element carrying a transform at all:

   1. CLIPPING. `skewY` pushes the two far corners outside the element's own
      border box for the length of the animation. Any `overflow-hidden`
      ancestor, a card frame, `.clip-line`, a rounded image well, shears those
      corners off mid-flight, which looks like a rendering bug rather than a
      choice. Put Rise on the OUTSIDE of a clipping frame, never inside one.

   2. CONTAINING BLOCK. An element with a transform becomes the containing
      block for any `position: fixed` descendant, so a fixed header, overlay or
      cursor nested inside a Rise would suddenly position itself against the
      Rise box instead of the viewport. Never wrap fixed-position UI in Rise.
      The settled state below is therefore all-defaults, `y:0 x:0 skewY:0
      scale:1`, which framer-motion's buildTransform() serialises as
      `transform: none` rather than `skewY(0deg) scale(1)` (verified against
      framer-motion 12: every transform slot at its default short-circuits to
      the literal string "none"). `none` does not establish a containing block,
      so the hazard exists only while the animation is actually running.
      `settle()` below is a belt-and-braces check on that behaviour.
=========================================================================== */

/** The settled state. Every value is the transform default, on purpose, see (2). */
const SETTLED: TargetAndTransition = {
  opacity: 1,
  y: 0,
  x: 0,
  skewY: 0,
  scale: 1,
};

/**
 * Which way the block leans in from. Alternating columns of an asymmetric grid
 * (the 7/5 → 5/7 portfolio pairs) should lean *toward* each other: the left
 * column enters from the left, the right column from the right, so the pair
 * closes on the centre line instead of both sliding the same way. That is the
 * difference between a grid that reads as composed and one that reads as two
 * unrelated blocks that happen to be adjacent.
 *
 * The skew sign mirrors the travel, the shear trails the direction of motion.
 * "up" carries no skew at all: a skew with no lateral travel has nothing to
 * trail and reads as a wobble.
 */
const LEAN = {
  right: { x: 18, skewY: 1.4 },
  left: { x: -18, skewY: -1.4 },
  up: { x: 0, skewY: 0 },
} as const;

type From = keyof typeof LEAN;

/** Mirrors revealProps() in Reveal.tsx, which is module-private there. */
function enter(reduced: boolean | null, viewportMargin = "0px 0px -12% 0px") {
  // Deliberately un-annotated, exactly as revealProps() is: a
  // `Record<string, unknown>` return type erases the shape at the JSX spread,
  // so a typo in `whileInView`/`viewport` would compile silently.
  return reduced
    ? { animate: SETTLED }
    : {
        whileInView: SETTLED,
        viewport: { once: true, margin: viewportMargin } as const,
      };
}

type CompleteHandler = NonNullable<
  HTMLMotionProps<"div">["onAnimationComplete"]
>;
type CompleteArg = Parameters<CompleteHandler>[0];

/**
 * Failsafe for hazard (2). framer-motion does write `transform: none` on its
 * own, so in practice this never fires; it exists so that a future version
 * that decides to emit `skewY(0deg) scale(1)` instead cannot silently leave
 * every Rise on the page acting as a containing block forever.
 *
 * Note the ref is applied BEFORE `...rest`, so a caller that passes its own
 * ref wins and this check quietly does nothing. That is deliberate: the
 * caller's ref is load-bearing, this one is not.
 */
function useSettle() {
  const ref = useRef<HTMLDivElement | null>(null);

  const settle = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const t = node.style.transform;
    if (t && t !== "none") node.style.transform = "none";
  }, []);

  return { ref, settle };
}

/* ---------------------------------------------------------------------------
   Rise
--------------------------------------------------------------------------- */

interface RiseProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Which side the block leans in from. Lean paired columns inward. */
  from?: From;
  /** Seconds. Stagger related items by ~0.06-0.1, never more. */
  delay?: number;
  /** Seconds. ~1.05 is the house weight; below 0.9 it starts to feel flicked. */
  duration?: number;
  as?: "div" | "section" | "article" | "li" | "header" | "figure" | "aside";
}

export function Rise({
  children,
  from = "up",
  delay = 0,
  duration = 1.05,
  as = "div",
  onAnimationComplete,
  ...rest
}: RiseProps) {
  const reduced = useMotionOff();
  const { ref, settle } = useSettle();
  const Tag = motion[as] as typeof motion.div;
  const lean = LEAN[from];

  const handleComplete = useCallback(
    (definition: CompleteArg) => {
      settle();
      onAnimationComplete?.(definition);
    },
    [settle, onAnimationComplete],
  );

  return (
    <Tag
      ref={ref}
      data-reveal
      // 26px of lift, 18px of lateral, 1.4deg of shear, 1.5% of scale. Every
      // one of those is at the edge of perceptible on its own; the signature
      // comes from all four resolving together on the same curve.
      initial={{
        opacity: 0,
        y: 26,
        x: lean.x,
        skewY: lean.skewY,
        scale: 0.985,
      }}
      {...enter(reduced)}
      transition={reduced ? { duration: 0 } : { duration, delay, ease: EASE }}
      onAnimationComplete={handleComplete}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------------------
   RiseGroup / RiseItem, the stagger pair.
   Mirrors Stagger / StaggerItem in Reveal.tsx exactly, including the reduced-
   motion shape: when reduced, the parent drops its variants but still hands
   the "show" label down, because variant labels propagate to children whether
   or not the parent defines the variant itself.
--------------------------------------------------------------------------- */

const groupParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/**
 * One variant object per lean, built once at module scope. Building them per
 * render would hand framer-motion a new object identity on every re-render,
 * which is how staggered lists end up re-running their entrance.
 *
 * Slightly under Rise's own numbers: in a sequence the stagger is already
 * doing the work of making the arrival legible, so each item needs less.
 */
const itemVariants: Record<From, Variants> = {
  right: {
    hidden: { opacity: 0, y: 24, x: 16, skewY: 1.2, scale: 0.988 },
    show: SETTLED,
  },
  left: {
    hidden: { opacity: 0, y: 24, x: -16, skewY: -1.2, scale: 0.988 },
    show: SETTLED,
  },
  up: {
    hidden: { opacity: 0, y: 24, x: 0, skewY: 0, scale: 0.988 },
    show: SETTLED,
  },
};

export function RiseGroup({
  children,
  className,
  amount = 0.15,
  as = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  /** Fraction of the group that must be in view before it fires. */
  amount?: number;
  as?: "div" | "ul" | "section";
  /** For custom properties a Tailwind class cannot carry, e.g. a column count
   *  computed from data. Layout only, never transform: the variants below own
   *  `transform`, and a style prop that set it would be silently overwritten. */
  style?: CSSProperties;
}) {
  const reduced = useMotionOff();
  const Tag = motion[as] as typeof motion.div;

  return (
    <Tag
      data-reveal
      className={className}
      style={style}
      variants={reduced ? undefined : groupParent}
      initial="hidden"
      {...(reduced
        ? { animate: "show" }
        : { whileInView: "show", viewport: { once: true, amount } })}
    >
      {children}
    </Tag>
  );
}

export function RiseItem({
  children,
  className,
  from = "up",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  from?: From;
  as?: "div" | "li" | "article" | "figure";
}) {
  const reduced = useMotionOff();
  const { ref, settle } = useSettle();
  const Tag = motion[as] as typeof motion.div;

  return (
    <Tag
      ref={ref}
      data-reveal
      className={className}
      variants={itemVariants[from]}
      transition={reduced ? { duration: 0 } : { duration: 1.0, ease: EASE }}
      onAnimationComplete={settle}
    >
      {children}
    </Tag>
  );
}
