"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/data/site";
import { LogoMark } from "@/components/ui/LogoMark";

const EASE = [0.22, 1, 0.36, 1] as const;

/* The `lg` breakpoint, as a media query, for the one place that has to know it
   in JavaScript instead of in a Tailwind class.

   Stated in `rem` rather than `px` because that is literally what Tailwind v4
   emits: `lg:` compiles to `@media (width >= 64rem)`, and this project
   overrides no `--breakpoint-*` in the @theme block of app/globals.css, so the
   stock v4 scale is in force. Inside a media query `rem` resolves against the
   browser's DEFAULT font size — not against :root's — which makes 64rem
   exactly 1024px on a stock browser, and exactly 1280px for a visitor who has
   raised their default text size to 20px. Hardcoding 1024px would be correct
   for most people and silently wrong for precisely the visitors who most need
   this panel to behave, because the JS would stop agreeing with `lg:hidden`.
   Track the source of truth instead of restating it. */
const DESKTOP_QUERY = "(min-width: 64rem)";

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

  /* A mirror of `open` for effects that must NOT re-run when it changes.

     Reading state through a ref is usually a smell; here it is the whole
     point. The navigation effect below needs to know whether it is closing a
     panel that was actually open, but it has to stay keyed on [pathname]
     alone — put `open` in its dependencies and opening the panel re-runs the
     effect, which closes it again on the spot. */
  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  /* Close the panel on navigation, and hand focus back to the trigger.

     Without the handoff, following a link inside the panel unmounts the
     element that held focus and the browser drops focus to <body>: the next
     Tab restarts from the top of the document, and a screen reader loses its
     place on the page it just arrived at. The openRef guard is what keeps
     that from misfiring — an ordinary navigation that began somewhere other
     than this panel must not yank focus onto a hamburger nobody touched. */
  useEffect(() => {
    if (!openRef.current) return;
    setOpen(false);
    triggerRef.current?.focus();
  }, [pathname]);

  /* Escape to close, scroll lock, focus containment, and the `lg` escape
     hatch — everything that is true only while the panel is open. */
  useEffect(() => {
    if (!open) return;

    /* Pairs with the `inert` set in this effect's cleanup — see the comment
       there. It has to be cleared here, on the way IN, because AnimatePresence
       reverses an interrupted exit on the SAME DOM node: dismiss the menu and
       reopen it inside the 450ms slide-out and the element comes back still
       carrying the attribute, i.e. a menu that is visible and completely dead.
       Clearing unconditionally is free when the attribute is not there. */
    panelRef.current?.removeAttribute("inert");

    /* THE lg CROSSING, AND WHY IT USED TO STRAND THE PAGE.

       The panel is `lg:hidden`. Widening the viewport past `lg` — rotating a
       tablet, dragging a window edge, an OS sidebar closing — therefore takes
       the panel off the screen without touching `open`. The body lock below
       is released only by this effect's cleanup, and that cleanup is keyed on
       [open], so it never ran: the page stayed scroll-locked with no visible
       control left to unlock it. The hamburger is `lg:hidden` too, so it is
       gone as well, and Escape only rescues someone who thinks to press it.
       The result was a dead page that a reload was the only cure for.

       So the breakpoint is watched HERE, inside the effect, and never in the
       markup. That is deliberate and load-bearing: a media query is a
       client-only value, and nothing that reaches the DOM may branch on one
       during render or hydration breaks. An effect runs after the match, so
       it can read the query freely. */
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const closeIfDesktop = () => {
      if (desktop.matches) setOpen(false);
    };

    // Once immediately: `change` only fires on a LATER crossing, and this
    // effect can perfectly well start out already wide.
    closeIfDesktop();

    // And never take the body lock in a viewport the panel cannot be seen in;
    // that state IS the bug. `open` is about to flip false, at which point
    // this effect re-runs and bails at the top, so there is nothing to clean.
    if (desktop.matches) return;

    desktop.addEventListener("change", closeIfDesktop);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      /* The cycle is the TRIGGER plus the panel's focusables, in that order.

         Querying `panelRef` alone left the trigger outside the loop. It is a
         DOM sibling of the panel — it lives in the <header> — so once focus
         entered the panel the wrap could never carry it back out, and the
         trigger is the only VISIBLE way to close this thing. Anyone who did
         not guess at Escape was shut in the menu with no way out.

         Trigger first because that is its DOM order (the header precedes the
         panel), so the wrap agrees with where an untrapped Tab would have
         gone and the loop reads as one continuous ring. Rebuilt on every
         keystroke rather than cached because the panel's contents mount
         through a staggered animation. */
      const focusables: HTMLElement[] = [];
      if (triggerRef.current) focusables.push(triggerRef.current);
      if (panelRef.current) {
        focusables.push(
          ...panelRef.current.querySelectorAll<HTMLElement>(
            "a[href], button:not([disabled])",
          ),
        );
      }
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      /* The `stranded` arm is what makes this a trap instead of a pair of
         wrap-around edges, and it is the same arm the profile dialog in
         components/team/TeamGrid.tsx carries. Testing only first/last assumes
         focus is already somewhere in the ring, and one entirely ordinary
         gesture breaks that assumption: tapping the panel's dead space — the
         84px top spacer, the strapline in the footer — moves focus to <body>.
         Some browsers also decline to focus a <button> on click at all, so
         focus can be on <body> from the moment the panel opens.

         From there activeElement is neither first nor last, the handler
         declines to act, and native Tab restarts at the top of the DOCUMENT:
         the skip link — which un-hides itself at z-[100], paints on top of a
         panel that is claiming `aria-modal`, and jumps to #main behind it —
         and then the logo. Focus walks straight through content the dialog is
         telling assistive tech does not exist, which is a worse lie than never
         having claimed to be modal.

         So anything outside the ring AND outside the panel is pulled back to
         whichever edge Tab was heading for. The second half of that test
         matters: an element inside the panel that the selector does not match
         (a future input, anything with a tabindex) is left to native Tab,
         which keeps it contained on its own — yanking it to an edge would
         make the panel's own contents untabbable. */
      const stranded =
        !focusables.some((el) => el === active) &&
        !panelRef.current?.contains(active);

      if (e.shiftKey) {
        if (stranded || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (stranded || active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      desktop.removeEventListener("change", closeIfDesktop);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);

      /* Everything that made this a dialog dies with this effect, but
         AnimatePresence deliberately keeps the panel MOUNTED for its 450ms
         slide-out. For that window the markup below still says
         `role="dialog" aria-modal="true"` while the Escape handler and the Tab
         trap are already gone — a dismissed menu whose links are still in the
         tab order, still telling a screen reader that the rest of the page
         does not exist. Someone who closed the menu and kept tabbing landed
         back inside it with no trap to carry them out and no Escape to close
         what was already closed.

         `inert` removes the exiting subtree from the tab order, the
         accessibility tree and hit-testing without touching layout or paint,
         so the exit animation is byte-for-byte what it was. Focus has already
         been handed to the trigger by whichever path closed the panel, so
         nothing is displaced. Browsers without `inert` ignore it and get the
         old behaviour. Cleared again on the way in, at the top of this effect
         — that pairing is load-bearing, not tidiness. */
      panelRef.current?.setAttribute("inert", "");
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

          {/* --- desktop ---
              `-mr-4` cancels the last link's own px-4 so the final label's
              RIGHT EDGE lands on the container gutter, level with the logo's
              left edge. Without it the row sits 16px shy of the measure and
              reads as accidentally indented — the padding is a hit area, and
              a hit area should not be visible as alignment. */}
          <nav
            aria-label="Primary"
            className="-mr-4 hidden items-center gap-1 lg:flex"
          >
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

            {/* A divider and a second "Connect →" link used to sit here, and
                it pointed at /contact — the same place the "Contact" item two
                pixels to its left already went. Two controls, one destination,
                differing only in wording, which asks the reader to work out
                whether they are different (they were not) and gives a screen
                reader two identically-targeted links to announce.

                The nav item is the one that survived: it is the one that
                matches the page it leads to, it is the one the mobile menu and
                the footer already use, and it is the one that takes the active
                underline when you are on /contact — which the CTA never could,
                so on the contact page the header used to show one link lit and
                an identical unlit one beside it. */}
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
            /* A modal in behaviour, so it says so. `aria-modal` is what tells
               assistive tech to hold its virtual cursor inside this subtree;
               without it a screen reader user swiping in DOM order walked
               straight out of the "modal" and into the page behind it, which
               is still there, still scroll-locked, and unreachable by touch.

               Worth knowing for whoever extends this: the trigger deliberately
               sits OUTSIDE this element (it is in the <header>, above it), so
               it is outside the subtree `aria-modal` confines. The Tab cycle
               in the effect above is what keeps it reachable. If a close
               control is ever added inside the panel, that cycle is the thing
               to revisit. */
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            /* Lenis matches this attribute before it consults any heuristic
               and hands the wheel back to the browser (see the LENIS block in
               app/globals.css). Without it Lenis swallows the wheel over the
               panel and applies it to a document that the body lock has
               already frozen, so the new scroller below would not scroll at
               all with smooth scrolling running. */
            data-lenis-prevent=""
            /* WCAG 1.4.4 / 1.4.10. This was `fixed inset-0 flex flex-col` with
               no overflow handling: at roughly 640px of minimum content, a
               landscape phone or a 1280x800 desktop at 200% zoom pushed the
               menu past both edges of the viewport, and the body lock meant
               there was no way to reach any of it. `overscroll-contain` stops
               a flick that reaches the end here from chaining out to the page
               behind. */
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-ivory lg:hidden"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
          >
            <div className="h-[84px] shrink-0" />

            {/* `my-auto`, not `flex-1 justify-center`. Both centre the menu
                while there is room to spare, but they fail differently when
                there is not: `justify-center` splits the overflow across both
                edges and puts the first link above the top of the scroller,
                where nothing can reach it. Auto margins never resolve
                negative, so they flatten to zero under pressure and the
                overflow all spills downward, into the scroller added above. */}
            <nav
              aria-label="Primary mobile"
              className="my-auto flex flex-col px-6 sm:px-8"
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
