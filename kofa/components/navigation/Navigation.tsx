"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/data/site";
import { LogoMark } from "@/components/ui/LogoMark";
import { Arrow } from "@/components/ui/Arrow";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduced = useMotionOff();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* Scroll state, rAF-throttled, passive.

     Two behaviours share one listener:
       · past 24px the bar condenses and takes its translucent ground;
       · scrolling *down* past the hero retracts it, scrolling *up* brings it
         straight back. On a 14,000px homepage that hands the reader the full
         viewport while they are moving forward, and returns navigation the
         instant they look for it. A 6px dead zone stops trackpad jitter from
         flickering the bar.

     Reduced motion keeps the behaviour and drops the travel: reclaiming the
     viewport is useful to everyone, and a discrete state change is not what
     the preference is asking us to remove. The global reduced-motion rule in
     globals.css collapses the transition to zero, so the bar simply is or is
     not there. */
  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);

        const delta = y - lastY;
        if (Math.abs(delta) > 6) {
          setHidden(y > 560 && delta > 0);
          lastY = y;
        }
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  /* Close the panel on navigation. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* Escape to close, scroll lock, and focus handoff while open. */
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-ivory"
      >
        Skip to content
      </a>

      <header
        // An explicit transform rather than Tailwind's translate utility:
        // those compile to the `translate` property via --tw-translate-*,
        // which did not resolve on this element and left the bar pinned.
        // `hidden` is false on the server and on first paint, so the
        // rendered style matches and hydration stays clean.
        style={{ transform: hidden && !open ? "translateY(-100%)" : "translateY(0)" }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color,transform] duration-500 ease-kofa ${
          scrolled && !open
            ? "border-b border-rule bg-[rgba(247,248,244,0.78)] backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div
          className={`mx-auto flex w-full max-w-[100rem] items-center justify-between px-6 transition-[height] duration-500 ease-kofa sm:px-8 lg:px-12 xl:px-20 ${
            scrolled ? "h-[66px]" : "h-[84px] sm:h-[92px]"
          }`}
        >
          <LogoMark size={scrolled ? 20 : 22} />

          {/* --- desktop --- */}
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-4 py-2 text-[0.8125rem] font-medium tracking-[-0.005em] transition-colors duration-300 ease-kofa ${
                    active ? "text-ink" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-4 -bottom-px h-px bg-teal"
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { duration: 0.5, ease: EASE }
                      }
                    />
                  )}
                </Link>
              );
            })}

            <span aria-hidden className="mx-5 h-4 w-px bg-rule" />

            <Link
              href="/contact"
              // py-2/-my-2 matches the 24px minimum target the sibling nav
              // links already get from their px-4 py-2.
              className="group/connect -my-2 inline-flex items-center gap-2 py-2 text-[0.8125rem] font-medium tracking-[-0.005em] text-ink transition-colors duration-300 ease-kofa hover:text-teal"
            >
              <span className="relative">
                Connect
                <span
                  aria-hidden
                  className="absolute -bottom-[3px] left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-[420ms] ease-kofa group-hover/connect:scale-x-100"
                />
              </span>
              <Arrow
                size={14}
                className="transition-transform duration-300 ease-kofa group-hover/connect:translate-x-1"
              />
            </Link>
          </nav>

          {/* --- mobile trigger --- */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden className="relative block h-3 w-6">
              <span
                className={`absolute left-0 block h-px w-full bg-ink transition-all duration-400 ease-kofa ${
                  open ? "top-[5px] rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-full bg-ink transition-all duration-400 ease-kofa ${
                  open ? "top-[5px] -rotate-45" : "top-[11px]"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* --- mobile full-screen menu --- */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            className="fixed inset-0 z-40 flex flex-col bg-ivory lg:hidden"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
          >
            <div className="h-[84px] shrink-0" />

            <nav
              aria-label="Primary mobile"
              className="flex flex-1 flex-col justify-center px-6 sm:px-8"
            >
              <ul>
                {nav.map((item, i) => {
                  const active = isActive(item.href);
                  return (
                    <motion.li
                      key={item.href}
                      initial={reduced ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.55,
                        delay: reduced ? 0 : 0.08 + i * 0.055,
                        ease: EASE,
                      }}
                      className="border-b border-rule"
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className="flex items-baseline gap-5 py-5"
                      >
                        <span className="type-eyebrow w-6 shrink-0 tabular-nums text-ink-mute">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`type-display-sm ${active ? "text-teal" : "text-ink"}`}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: reduced ? 0 : 0.42 }}
                className="mt-12"
              >
                <p className="type-eyebrow mb-3 text-ink-mute">Get in touch</p>
                <a
                  href={`mailto:${site.email}`}
                  // py-1 lifts the 23px line box past the 24px target minimum.
                  className="-my-1 inline-block py-1 text-[1.0625rem] text-ink underline-offset-4 hover:text-teal hover:underline"
                >
                  {site.email}
                </a>
              </motion.div>
            </nav>

            <div className="shrink-0 px-6 pb-10 sm:px-8">
              <p className="type-eyebrow text-ink-mute">
                Advancing global health through innovation
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
