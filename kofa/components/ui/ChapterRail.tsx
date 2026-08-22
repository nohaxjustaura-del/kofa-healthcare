"use client";

import { useEffect, useState } from "react";

/* ===========================================================================
   CHAPTER RAIL
   ---------------------------------------------------------------------------
   A fixed index of the page's chapters down the right gutter: 01 … 07, each a
   1px dash. The dash of the section currently under the middle of the viewport
   extends to full width and its number goes teal.

   It exists to answer "where am I, and how many more of these are there", the
   two questions a very long single-column page leaves unanswered. Everything
   else about it is restraint: no plate, no shadow, no pill, no scroll-spy
   easing, no numbers larger than 11px. It is the table of contents printed in
   the margin of a report, not a progress HUD.

   THREE THINGS IT REFUSES TO DO
     · It does not own the section list. `sections` is a prop so the page that
       actually contains those sections stays the single source of truth for
       their ids, their order and their names; a rail with the chapter names
       baked in goes stale the first time a section is reordered and nobody
       notices, because nothing breaks.
     · It does not listen to scroll. One IntersectionObserver over the section
       elements costs nothing per frame and is not sampled — it fires on the
       crossing itself — where a scroll handler runs on every wheel tick for
       the life of the page and then has to measure. With Lenis interpolating
       the scroll position that would be a getBoundingClientRect per frame per
       section.
     · It does not require JavaScript to be useful. Every entry is a real
       `<a href="#id">`, so the rail is a working table of contents in the
       server HTML, reachable by keyboard and by a browser with the JS gone.
       Only the *active* mark needs the observer.
=========================================================================== */

export interface Chapter {
  /** id of the element on the page. Must exist, or the rail hides itself. */
  id: string;
  /** Short label, one or two words. Revealed on hover/focus. */
  label: string;
  /**
   * The printed numeral, e.g. "01". OPTIONAL, and deliberately so.
   *
   * This used to be derived as String(i + 1), which meant the rail counted its
   * own eight chapters 01..08 while the sections themselves printed a
   * different 01..06 in their eyebrows. Two numbering systems disagreeing on
   * every row, both on screen at once above 1280px, so Portfolio read 02 in
   * the gutter and 01 on the page.
   *
   * Numbering all eight would have fixed the disagreement by destroying the
   * thing that makes it a device: primitives.tsx calls index "the site's
   * selective-numbering device", and a number on everything is not selective.
   * So the rail now prints only what a section actually prints, and a chapter
   * with no eyebrow numeral is a dash plus its hover label, which already read
   * correctly on its own.
   */
  index?: string;
}

export function ChapterRail({ sections }: { sections: Chapter[] }) {
  const [active, setActive] = useState<string | null>(null);

  /* Starts true so the server HTML and the first client render agree, then
     goes false one tick later if none of the ids resolved. The rail is
     therefore present in the markup (see "does not require JavaScript"), and
     the only case where it briefly appears before hiding is a page that was
     handed ids it does not contain — which is a mistake to fail quietly on,
     not a state to design for. */
  const [present, setPresent] = useState(true);

  /* The prop is almost always an inline array literal, so it is a new object
     on every render and a raw `[sections]` dependency would tear down and
     rebuild the observer each time. The ids joined into a string is the part
     the effect actually depends on, and it compares by value. */
  const key = sections.map((s) => s.id).join("|");

  useEffect(() => {
    const ids = key.split("|").filter(Boolean);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    setPresent(els.length > 0);
    if (els.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        /* Last one in document order wins: at the seam between two sections
           both overlap the band for a moment, and switching to the incoming
           one immediately reads as "this is what I am arriving at" rather
           than "this is what I have not finished leaving". */
        let next: string | null = null;
        for (const id of ids) if (visible.has(id)) next = id;

        /* When the band falls in a gap (a short section between two tall
           ones, or the very top of the page) the set empties. Holding the
           previous chapter is correct; clearing it would blink the whole rail
           to neutral for the length of the gap. */
        if (next) setActive(next);
      },
      {
        /* A 10%-tall band across the middle of the viewport. "Current" means
           "occupying the reader's centre of attention", not "touching the
           viewport at all" — with the default root, six of nine sections on
           this page are intersecting at once on a tall display and the answer
           is meaningless. Symmetric, so the rail behaves identically scrolling
           up and scrolling down. */
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Page sections"
      data-chapter-rail
      data-present={present}
      /* pointer-events-none on the shell, auto on the links: the <nav> is a
         tall fixed box in the gutter and would otherwise sit over whatever
         the layout puts near the right edge at wide viewports.
         `hidden xl:block` is the breakpoint gate; touch is excluded by a
         (hover: none) rule in globals.css rather than by a JS media query,
         because a media query evaluates the same on the server and the
         client and cannot desynchronise hydration. */
      className="pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 data-[present=false]:!hidden xl:block"
    >
      <ol className="flex flex-col items-end">
        {sections.map((section, i) => {
          const isActive = active === section.id;

          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "true" : undefined}
                /* py-2 against an 11px line box makes the target 27px tall,
                   over the 24px minimum in WCAG 2.2 SC 2.5.8. */
                className="group pointer-events-auto relative flex items-center justify-end gap-3 py-2"
              >
                {/* Absolutely positioned so the hidden label contributes no
                    width: laid out inline it would make every row as wide as
                    the longest chapter name and push the anchors' hit areas
                    back over the content column.

                    The transition names `translate`, not `transform`: in
                    Tailwind v4 `translate-x-*` compiles to the `translate`
                    property via --tw-translate-*, not to `transform`, so a
                    transition list containing `transform` never sees the
                    change and the label jumps instead of sliding. Same trap
                    the header comment in Navigation.tsx describes, and the
                    reason this one lists its properties explicitly. */}
                <span
                  className="type-eyebrow pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 translate-x-1 whitespace-nowrap text-ink-mute opacity-0 transition-[opacity,translate] duration-500 ease-kofa group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                >
                  {section.label}
                </span>

                {/* The dash. Scaled rather than resized: animating `width` on
                    seven elements relayouts the rail on every chapter change,
                    scaling does not touch layout at all. Fixed 24px box,
                    origin-right, so it grows leftward from the number.

                    The transition names `scale`, not `transform`: Tailwind v4
                    compiles `scale-x-*` to the `scale` property, so nothing
                    called `transform` ever changes here and a
                    `transition-[transform,…]` list left the dash snapping
                    between its two widths with only the colour easing.
                    All three values are percentages rather than one bare
                    number and two percentages, so the interpolated endpoints
                    are the same unit. */}
                <span
                  aria-hidden
                  className={`block h-px w-6 origin-right transition-[scale,background-color] duration-[600ms] ease-kofa ${
                    isActive
                      ? "scale-x-100 bg-teal"
                      : "scale-x-40 bg-rule-strong group-hover:scale-x-75 group-focus-visible:scale-x-75"
                  }`}
                />

                {section.index && (
                  <span
                    className={`type-eyebrow tabular-nums transition-colors duration-500 ease-kofa ${
                      isActive ? "text-teal" : "text-ink-mute"
                    }`}
                  >
                    {section.index}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
