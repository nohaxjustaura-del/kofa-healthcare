"use client";

import { clsx } from "clsx";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { useMotionOff } from "@/components/motion/MotionPreference";

/* ===========================================================================
   BENTO
   ---------------------------------------------------------------------------
   A mixed-size card grid: several spans on one 6-column track so the eye is
   given a route through the set instead of a uniform matrix to scan. The
   sizes are the content model, not decoration. A card given four columns is
   claiming to be more important than its neighbours and had better be.

   HOUSE STYLE, NOT THE SOURCE COMPONENT'S. The pattern this is adapted from
   is a dark glass panel: `rounded-4xl`, `ring-white/10`, an inset box-shadow
   glow, `backdrop-blur-xl`, white text on black. None of that exists in this
   project. The site is ivory, sharp-cornered and hairline-ruled; a search
   across the whole codebase turns up no `shadow-*` at all and radii only on
   pills and the logo plate. So this keeps the LAYOUT idea, which is the part
   worth having, and drops the skin entirely.

   THE GRAPHIC IS A SLOT, NOT AN IMAGE. The source fills each card with a
   background-image from a CDN. Every visual on this site is drawn, in SVG,
   from the same network motif, so `graphic` takes a node and callers pass a
   component. That also means no remote origin to add to next.config, no
   layout shift while a bitmap decodes, and artwork that stays crisp at the
   size a four-column card actually gets on a 27" display.

   HOVER IS A PARENT-DRIVEN VARIANT. `initial="idle"` / `whileHover="active"`
   on the card propagates the label to every descendant that declares those
   variants, so the frame, the graphic and the rule move as one gesture
   without any of them needing to know the card is hovered. Under
   `useMotionOff()` the variants are dropped and the card is simply static:
   see components/motion/MotionPreference.tsx.

   TOUCH. Nothing here is revealed by hover, only emphasised. A device that
   cannot hover sees the full content in the resting state, which is the rule
   the TOUCH block in app/globals.css exists to enforce.
=========================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

/** The graphic drifts up and gains a little scale. Small: the card is the
 *  subject, and a graphic that lunges reads as a banner ad. */
const graphicVariants: Variants = {
  idle: { scale: 1, y: 0 },
  active: { scale: 1.045, y: -6 },
};

/** The rule under the eyebrow draws across on hover, the same gesture as
 *  `.link-draw` in globals.css, expressed as a variant so it joins the card's
 *  single hover state rather than running on its own CSS transition. */
const ruleVariants: Variants = {
  idle: { scaleX: 0 },
  active: { scaleX: 1 },
};

export type BentoTone = "light" | "sage" | "deep";

/* Surfaces the site already uses. "deep" is the inverted teal moment from
   components/home/Conviction.tsx; at most one card in a grid should take it,
   or the inversion stops meaning anything. */
const TONE = {
  light: {
    frame: "bg-white border-rule",
    eyebrow: "text-teal",
    title: "text-ink",
    body: "text-ink-soft",
    rule: "bg-teal",
    graphic: "bg-ivory-deep",
  },
  sage: {
    frame: "bg-sage-bg border-rule",
    eyebrow: "text-teal",
    title: "text-ink",
    body: "text-ink-soft",
    rule: "bg-teal",
    graphic: "bg-sage-bg-deep",
  },
  deep: {
    frame: "bg-teal-deep border-transparent",
    eyebrow: "text-sage",
    title: "text-white",
    body: "text-sage",
    rule: "bg-sage",
    graphic: "bg-teal-deep",
  },
} as const;

/* ---------------------------------------------------------------------------
   BentoGrid
--------------------------------------------------------------------------- */

export function BentoGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        // One column until lg, where the spans become meaningful. A 2-column
        // interstitial was tried and made every asymmetric span land wrong.
        "grid grid-cols-1 gap-px bg-rule lg:grid-cols-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   BentoCard
--------------------------------------------------------------------------- */

export function BentoCard({
  eyebrow,
  title,
  description,
  graphic,
  footer,
  tone = "light",
  fade = [],
  className = "",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Drawn artwork for the card's upper well. Absolutely positioned inside. */
  graphic?: ReactNode;
  /** Optional trailing line: a count, a link, a status. */
  footer?: ReactNode;
  tone?: BentoTone;
  /** Which edges of the graphic well fade into the card surface. */
  fade?: ("top" | "bottom")[];
  className?: string;
}) {
  const reduced = useMotionOff();
  const t = TONE[tone];

  return (
    <motion.div
      initial="idle"
      // `whileHover` is dropped under motion-off rather than neutered, so the
      // card never enters an animation lifecycle it does not need.
      {...(reduced ? {} : { whileHover: "active", whileFocus: "active" })}
      className={clsx(
        "group relative isolate flex flex-col overflow-hidden border",
        // gap-px + a rule-coloured grid background draws the dividers, so each
        // card only needs its own surface. The border is the outer edge.
        t.frame,
        className,
      )}
    >
      {/* --- graphic well ------------------------------------------------- */}
      {graphic && (
        <div
          className={clsx(
            "relative h-[clamp(9rem,15vw,13rem)] shrink-0 overflow-hidden",
            t.graphic,
          )}
        >
          <motion.div
            variants={reduced ? undefined : graphicVariants}
            transition={{ duration: 0.85, ease: EASE }}
            className="absolute inset-0"
          >
            {graphic}
          </motion.div>

          {fade.includes("top") && (
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[var(--card-surface,transparent)] to-transparent"
            />
          )}
          {fade.includes("bottom") && (
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--card-surface,transparent)] to-transparent"
            />
          )}
        </div>
      )}

      {/* --- content ------------------------------------------------------ */}
      <div className="relative flex flex-1 flex-col p-7 sm:p-8">
        {eyebrow && (
          <div className="flex items-center gap-3">
            <span className={clsx("type-eyebrow", t.eyebrow)}>{eyebrow}</span>
            <motion.span
              aria-hidden
              variants={reduced ? undefined : ruleVariants}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ transformOrigin: "left" }}
              className={clsx("h-px w-8 shrink-0", t.rule)}
            />
          </div>
        )}

        <h3
          className={clsx(
            "mt-3.5 text-[1.25rem] leading-tight tracking-[-0.015em] sm:text-[1.4375rem]",
            t.title,
          )}
        >
          {title}
        </h3>

        {description && (
          <p className={clsx("type-body-sm mt-3 max-w-[46ch]", t.body)}>
            {description}
          </p>
        )}

        {footer && <div className="mt-auto pt-6">{footer}</div>}
      </div>
    </motion.div>
  );
}
