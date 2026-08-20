"use client";

import {
  motion,
  type HTMLMotionProps,
  type TargetAndTransition,
  type Variants,
} from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ===========================================================================
   ENTRANCE PRIMITIVES
   ---------------------------------------------------------------------------
   HYDRATION RULE: read before editing.

   `useMotionOff()` cannot know the user's preference on the server, so it
   returns false during SSR and true on a reduced-motion client. Branching the
   returned markup on it, `if (reduced) return <div>`, therefore makes the
   server and client render different trees, and React throws the whole server
   HTML away and re-renders on the client. For a visitor with Reduce Motion on
   (a large share of them), that is every page, every load.

   So: `initial` is the ONLY prop here that reaches the DOM, and it never
   branches. Reduced motion is expressed instead as
     · `animate` instead of `whileInView`, reveal immediately, do not wait
       for a scroll position, and
     · `transition: { duration: 0 }`, arrive with no travel.
   First paint is byte-identical either way; the difference is entirely in
   what happens after mount.
=========================================================================== */

/** Reveal immediately vs. on scroll, without changing the rendered markup. */
function revealProps(
  reduced: boolean | null,
  to: TargetAndTransition,
  viewportMargin = "0px 0px -12% 0px",
) {
  return reduced
    ? { animate: to }
    : {
        whileInView: to,
        viewport: { once: true, margin: viewportMargin } as const,
      };
}

/* ---------------------------------------------------------------------------
   Reveal, the site's default entrance.
   opacity 0 → 1, translateY 20px → 0, ~700ms. Fires once.
--------------------------------------------------------------------------- */

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Seconds. Stagger related items by ~0.06-0.1, never more. */
  delay?: number;
  /** Vertical travel in px. Keep small, 20 is the house default. */
  y?: number;
  duration?: number;
  as?: "div" | "section" | "article" | "li" | "header" | "figure";
}

export function Reveal({
  children,
  delay = 0,
  y = 20,
  duration = 0.7,
  as = "div",
  ...rest
}: RevealProps) {
  const reduced = useMotionOff();
  const Tag = motion[as] as typeof motion.div;

  return (
    <Tag
      data-reveal
      initial={{ opacity: 0, y }}
      {...revealProps(reduced, { opacity: 1, y: 0 })}
      transition={reduced ? { duration: 0 } : { duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------------------
   Stagger, a parent that hands its children a sequenced delay.
   Use for lists; never for prose.
--------------------------------------------------------------------------- */

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export function Stagger({
  children,
  className,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const reduced = useMotionOff();

  return (
    <motion.div
      data-reveal
      className={className}
      variants={reduced ? undefined : staggerParent}
      initial="hidden"
      {...(reduced
        ? { animate: "show" }
        : { whileInView: "show", viewport: { once: true, amount } })}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useMotionOff();

  return (
    <motion.div
      data-reveal
      className={className}
      variants={staggerChild}
      transition={reduced ? { duration: 0 } : { duration: 0.7, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
   LineReveal, masked, line-by-line headline entrance.
   Each line sits in an overflow-hidden box and slides up from beneath it.
   Never animates individual letters (§10 of the interaction brief).
--------------------------------------------------------------------------- */

export function LineReveal({
  lines,
  className,
  delay = 0,
  stagger = 0.085,
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduced = useMotionOff();

  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span className="clip-line" key={i}>
          <motion.span
            data-reveal
            className="block"
            initial={{ y: "108%" }}
            {...revealProps(reduced, { y: "0%" }, "0px 0px -10% 0px")}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.95, delay: delay + i * stagger, ease: EASE }
            }
          >
            {line}
            {/* Trailing space keeps textContent readable ("capital for", not
                "capitalfor") for crawlers and copy-paste. It collapses to
                nothing visually inside a block element. */}
            {i < lines.length - 1 && " "}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   ImageReveal, a mask travels upward, uncovering the image beneath.
   The image itself drifts only slightly. ~950ms. Used sparingly.
--------------------------------------------------------------------------- */

export function ImageReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useMotionOff();

  return (
    <motion.div
      data-reveal
      className={`overflow-hidden ${className ?? ""}`}
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      {...revealProps(
        reduced,
        { clipPath: "inset(0% 0% 0% 0%)" },
        "0px 0px -8% 0px",
      )}
      transition={reduced ? { duration: 0 } : { duration: 0.95, delay, ease: EASE }}
    >
      <motion.div
        data-reveal
        initial={{ scale: 1.06 }}
        {...revealProps(reduced, { scale: 1 }, "0px 0px -8% 0px")}
        transition={
          reduced ? { duration: 0 } : { duration: 1.3, delay, ease: EASE }
        }
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
   AnimatedDivider, a 1px rule that draws itself across on entry.
   The site's principal section separator.
--------------------------------------------------------------------------- */

export function AnimatedDivider({
  className = "",
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  const reduced = useMotionOff();

  return (
    <motion.div
      data-reveal
      className={`h-px w-full origin-left bg-rule ${className}`}
      initial={{ scaleX: 0 }}
      {...revealProps(reduced, { scaleX: 1 })}
      transition={reduced ? { duration: 0 } : { duration: 1.1, delay, ease: EASE }}
    />
  );
}
