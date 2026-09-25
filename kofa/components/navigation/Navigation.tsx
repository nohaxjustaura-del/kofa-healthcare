"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/data/site";
import { LogoMark } from "@/components/ui/LogoMark";
import { MEASURE } from "@/components/ui/primitives";

/* ---------------------------------------------------------------------------
   PRIMARY NAVIGATION
   ---------------------------------------------------------------------------
   Fixed 104px band. The height is load-bearing: app/page.tsx clears it with
   mt-[104px] and the interior page header pads for it, so it is not a free
   number to change.

   Behaviour added here, all of it things a keyboard or screen-reader visitor
   noticed were missing:

   · Escape closes the mobile menu and returns focus to the toggle, which is
     the one interaction every disclosure is expected to support.
   · A route change closes the menu. Previously the panel stayed open over
     the new page, because nothing was watching the pathname.
   · The menu is a real disclosure: aria-expanded, aria-controls, and a
     hidden panel rather than an unmounted one, so the relationship survives.
   · The breakpoint moved from xl (1280px) to lg (1024px). Seven items fit
     comfortably at 1024 once the logo is sized honestly, and a 1200px-wide
     laptop being served the phone menu was the single oddest thing about the
     old header.
--------------------------------------------------------------------------- */

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close on navigation. Without this the panel outlives the page it opened
  // on, and the visitor lands on the new route behind a stale menu.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white">
      <div className={`${MEASURE} flex h-[104px] items-center justify-between gap-6`}>
        {/* 76px of the 104px band, leaving 14px of air above and below.
            `size` is the height of the whole stacked lockup now, not of the
            hexagon alone — see the note in LogoMark.tsx — so this is not the
            same number as the 84 that stood here. */}
        <LogoMark size={76} priority responsive />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3 py-2 text-[0.9rem] font-medium tracking-[0.005em] transition-colors duration-200 ${
                  active ? "text-teal-deep" : "text-slate-700 hover:text-teal-deep"
                }`}
              >
                {item.label}
                {/* The rule sits under the label rather than on the link box,
                    so the hit area can be generous without the underline
                    growing with it. */}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 -bottom-px h-0.5 origin-left bg-teal transition-transform duration-300 ease-kofa ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Below 400px the word is dropped and the button becomes the bars
            alone. At 320px the full button is 101px wide, which together
            with the lockup and the gutters is more than the line can hold,
            and the flex row resolves that by squeezing the wordmark. The
            aria-label carries the same information either way. */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex min-h-11 shrink-0 items-center gap-2.5 border border-slate-300 px-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-navy transition-colors hover:border-teal hover:text-teal-deep min-[400px]:px-4 lg:hidden"
        >
          <span
            aria-hidden
            className="relative flex h-3 w-4 flex-col justify-between"
          >
            <span
              className={`h-px w-full bg-current transition-transform duration-300 ease-kofa ${
                open ? "translate-y-[5.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-full bg-current transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-px w-full bg-current transition-transform duration-300 ease-kofa ${
                open ? "-translate-y-[5.5px] -rotate-45" : ""
              }`}
            />
          </span>
          <span aria-hidden className="hidden min-[400px]:inline">
            {open ? "Close" : "Menu"}
          </span>
        </button>
      </div>

      <nav
        id="site-menu"
        aria-label="Primary"
        hidden={!open}
        className="border-t border-slate-200 bg-white shadow-[0_18px_40px_-28px_rgba(18,57,75,0.55)] lg:hidden"
      >
        <ul className={`${MEASURE} grid gap-px py-3 sm:grid-cols-2`}>
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center border-b border-slate-100 text-base font-medium transition-colors ${
                    active ? "text-teal-deep" : "text-navy hover:text-teal-deep"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mr-3 h-4 w-0.5 transition-colors ${
                      active ? "bg-teal" : "bg-transparent"
                    }`}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
