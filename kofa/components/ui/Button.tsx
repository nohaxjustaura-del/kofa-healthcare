import Link from "next/link";
import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Arrow } from "./Arrow";

/* ---------------------------------------------------------------------------
   Button, institutional, precise. No pills, no glow, no shadow.
   Hover shifts the background and moves the arrow 4px. The label itself
   never moves: stable text is what makes it read as considered rather than
   playful.
--------------------------------------------------------------------------- */

type Variant = "primary" | "secondary" | "onDark";

const BASE =
  "group/btn relative inline-flex min-h-[3rem] items-center justify-center gap-3 rounded-lg " +
  "px-7 text-[0.875rem] font-medium leading-none tracking-[-0.005em] " +
  "transition-[background-color,border-color,color] duration-300 ease-kofa " +
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-ivory hover:bg-teal",
  secondary:
    "border border-rule-strong bg-transparent text-ink hover:border-teal hover:bg-[rgba(23,109,103,0.05)]",
  onDark:
    "border border-[rgba(255,255,255,0.28)] bg-transparent text-white hover:border-white hover:bg-[rgba(255,255,255,0.08)]",
};

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  /** Renders the trailing arrow. On by default. */
  arrow?: boolean;
  external?: boolean;
}

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  arrow = true,
  external = false,
  ...rest
}: ButtonProps & Omit<ComponentPropsWithoutRef<"button">, "children">) {
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`;

  const inner = (
    <>
      <span>{children}</span>
      {arrow && (
        <Arrow
          size={15}
          className="translate-x-0 transition-transform duration-300 ease-kofa group-hover/btn:translate-x-1"
        />
      )}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          className={cls}
          target="_blank"
          rel="noopener noreferrer"
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
  );
}

/* ---------------------------------------------------------------------------
   TextLink, the site's secondary call to action.
   A hairline underline draws left → right while the arrow travels 4px.
--------------------------------------------------------------------------- */

export function TextLink({
  children,
  href,
  className = "",
  arrow = true,
  external = false,
  dir = "right",
  tone = "ink",
}: {
  children: ReactNode;
  href: string;
  className?: string;
  arrow?: boolean;
  external?: boolean;
  dir?: "right" | "up-right" | "left";
  tone?: "ink" | "teal" | "white";
}) {
  const toneCls =
    tone === "teal"
      ? "text-teal hover:text-teal-deep"
      : tone === "white"
        ? "text-white/80 hover:text-white"
        : "text-ink hover:text-teal";

  const inner = (
    <>
      {dir === "left" && arrow && (
        <Arrow
          size={15}
          dir="left"
          className="transition-transform duration-300 ease-kofa group-hover/link:-translate-x-1"
        />
      )}
      <span className="relative">
        {children}
        <span
          aria-hidden
          className="absolute -bottom-[3px] left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-[420ms] ease-kofa group-hover/link:scale-x-100 group-focus-visible/link:scale-x-100"
        />
      </span>
      {dir !== "left" && arrow && (
        <Arrow
          size={15}
          dir={dir}
          className={`transition-transform duration-300 ease-kofa ${
            dir === "up-right"
              ? "group-hover/link:translate-x-1 group-hover/link:-translate-y-1"
              : "group-hover/link:translate-x-1"
          }`}
        />
      )}
    </>
  );

  /* py-1.5 / -my-1.5 lifts the hit area to 33px for WCAG 2.2 SC 2.5.8
     (24px minimum) while the negative margin keeps the visual rhythm
     identical, these links sit on their own, not inline in a sentence, so
     the exception does not apply to them. */
  const cls = `group/link -my-1.5 inline-flex items-center gap-2.5 py-1.5 text-[0.875rem] font-medium tracking-[-0.005em] transition-colors duration-300 ease-kofa ${toneCls} ${className}`;

  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
