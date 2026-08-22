import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";

/* ---------------------------------------------------------------------------
   Container, the single horizontal measure for the whole site.
   Mobile gutter is 24px per the responsive brief; it opens to 80px at xl,
   which is what gives large screens their air.
--------------------------------------------------------------------------- */

export function Container({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag
      className={`mx-auto w-full max-w-[100rem] px-6 sm:px-8 lg:px-12 xl:px-20 ${className}`}
    >
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------------------
   Section, vertical rhythm. Three densities so the page can breathe
   unevenly: tight for connective passages, roomy for the quiet ones.
--------------------------------------------------------------------------- */

/* Vertical rhythm, tightened.
   ---------------------------------------------------------------------------
   These were clamp(5.5rem, 9vw, 10rem) and clamp(7rem, 12vw, 13.5rem). Because
   the padding is applied top AND bottom, two adjacent `roomy` sections put
   13.5rem + 13.5rem = 432px of empty page between the last line of one and the
   first line of the next on a wide screen. That is past "generous" and into
   "the reader thinks the page has ended".

   Cut by roughly a third. The RATIOS are what carry the pacing, and they are
   unchanged: tight is still about two thirds of default, roomy about a third
   more than it, so a section still reads as denser or airier than its
   neighbours. There is just less dead air in absolute terms. */
const SECTION_SPACE = {
  tight: "py-[clamp(2.75rem,4vw,4rem)]",
  default: "py-[clamp(4rem,6vw,6.5rem)]",
  roomy: "py-[clamp(5rem,8vw,8.5rem)]",
} as const;

export function Section({
  children,
  className = "",
  space = "default",
  id,
  as: Tag = "section",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  space?: keyof typeof SECTION_SPACE;
  id?: string;
  as?: ElementType;
} & Omit<ComponentPropsWithoutRef<"section">, "className" | "id">) {
  // `rest` is forwarded so callers can pass aria-labelledby / data-* without
  // the prop being silently swallowed, a section that names itself for
  // assistive tech should not need a different component to do it.
  return (
    <Tag id={id} className={`${SECTION_SPACE[space]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------------------
   Eyebrow, small uppercase label that sits above every major headline.
   The optional index is the site's selective-numbering device (01 / 02 / 03).

   The label used to be preceded by a 5px square when no index was given. It
   was doing no work that the uppercase tracking was not already doing, and at
   5px it read as a rendering artefact rather than as a bullet. The label now
   stands on its own; `index` is unchanged, because a number is content.
--------------------------------------------------------------------------- */

export function Eyebrow({
  children,
  index,
  className = "",
  tone = "teal",
}: {
  children: ReactNode;
  index?: string;
  className?: string;
  tone?: "teal" | "mute";
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {index && (
        <span className="type-eyebrow tabular-nums text-ink-mute">{index}</span>
      )}
      <span
        className={`type-eyebrow ${
          tone === "teal" ? "text-teal" : "text-ink-mute"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Headings
--------------------------------------------------------------------------- */

export function DisplayHeading({
  children,
  className = "",
  as: Tag = "h1",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag className={`type-display text-balance text-ink ${className}`}>
      {children}
    </Tag>
  );
}

/* `id` is forwarded so a section can point `aria-labelledby` at its own
   heading without dropping down to a raw <h2>. Sections that name themselves
   for assistive tech should not have to opt out of the type primitive to do
   it, which is the same reasoning as the `...rest` on Section above. */
export function SectionHeading({
  children,
  className = "",
  id,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: ElementType;
}) {
  return (
    <Tag id={id} className={`type-section text-balance text-ink ${className}`}>
      {children}
    </Tag>
  );
}

export function Statement({
  children,
  className = "",
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag className={`type-statement text-pretty text-ink ${className}`}>
      {children}
    </Tag>
  );
}

export function BodyCopy({
  children,
  className = "",
  size = "default",
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "lg";
  as?: ElementType;
}) {
  return (
    <Tag
      className={`${size === "lg" ? "type-body-lg" : "type-body"} text-pretty ${className}`}
    >
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------------------
   Metadata row, tiny editorial detail (§14 microdetails).
   e.g.  01 / 05 · CARDIOVASCULAR
--------------------------------------------------------------------------- */

export function Meta({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`type-eyebrow text-ink-mute ${className}`}>{children}</span>
  );
}

/* ---------------------------------------------------------------------------
   Rule, the 1px separator used in place of shadows throughout.
--------------------------------------------------------------------------- */

export function Rule({ className = "" }: { className?: string }) {
  return <div className={`h-px w-full bg-rule ${className}`} />;
}
