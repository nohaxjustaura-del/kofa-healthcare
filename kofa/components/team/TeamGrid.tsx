"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { RiseGroup, RiseItem } from "@/components/motion/Rise";
import { Arrow } from "@/components/ui/Arrow";
import { Eyebrow } from "@/components/ui/primitives";
import { teamSorted, type TeamMember } from "@/data/team";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------------------------------------------------------------------
   What Tab is allowed to land on inside the member panel.
   Deliberately narrow: the panel is assembled from a close button, an optional
   LinkedIn anchor and static text, so there is no need for the exhaustive
   focusable-element list a general-purpose trap would carry. Anything added to
   the panel later that takes focus is covered by these selectors as long as it
   is a real control rather than a tabindex-juggling div.
--------------------------------------------------------------------------- */
const PANEL_FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/* ---------------------------------------------------------------------------
   Portrait plate.
   KOFA has not supplied photography, so rather than a grey box or a stock
   face, the plate carries the member's initials in the display serif over the
   sage ground and says plainly what belongs there. It reads as a designed
   element, not as a missing asset, and swaps for a real portrait the moment
   `portrait` is set in the CMS.
--------------------------------------------------------------------------- */
function Portrait({ member }: { member: TeamMember }) {
  if (member.portrait) {
    return (
      <Image
        src={member.portrait}
        alt={`${member.name}, ${member.role}`}
        fill
        sizes="(max-width: 768px) 100vw, 40vw"
        className="object-cover transition-transform duration-[900ms] ease-kofa group-hover/member:scale-[1.02]"
      />
    );
  }

  const initials = member.name
    .replace(/^Dr\.\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(150deg,#edf6f7_0%,#E4EDE7_100%)]">
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full opacity-70"
        fill="none"
      >
        {[22, 34, 46].map((r, i) => (
          <circle
            key={r}
            cx="50"
            cy="46"
            r={r}
            stroke="#006a70"
            strokeOpacity={0.1 - i * 0.02}
            strokeWidth="0.3"
          />
        ))}
      </svg>
      <span className="relative font-serif text-[3.25rem] leading-none text-teal">
        {initials}
      </span>
      <span className="type-eyebrow relative mt-5 text-ink-soft">
        Portrait to be supplied
      </span>
    </div>
  );
}

function OpenSlot({ n }: { n: number }) {
  return (
    <div className="border-t border-dashed border-rule pt-8">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[10px] border border-dashed border-rule">
        <div className="absolute inset-0 flex items-center justify-center bg-ivory-deep">
          <span className="type-eyebrow text-ink-soft">
            Team member {String(n).padStart(2, "0")}
          </span>
        </div>
      </div>
      <p className="type-eyebrow mt-6 text-ink-soft">Awaiting KOFA content</p>
      <p className="type-body-xs mt-3 max-w-[32ch]">
        Add a member in the CMS with name, role, portrait, biography and LinkedIn,
        and a profile renders here automatically.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Entrance lean, read off a card's position in the grid flow.
   The lean is composed for the three-up row, the widest layout the grid
   reaches: the row opens outward from its own middle, first column in from
   the left, the centre with no side to come from, the last in from the right.
   Taking the flow index rather than hard-coding a direction per member is
   what keeps that true as the CMS fills the roster in and the open slots
   shuffle along behind it. At the two-column breakpoint the sequence walks
   around the pairs instead of closing them, which at RiseItem's 16px of
   travel is well under the threshold where the pairing reads either way.
--------------------------------------------------------------------------- */
const COLUMN_LEAN = ["left", "up", "right"] as const;

export function TeamGrid() {
  const [open, setOpen] = useState<TeamMember | null>(null);
  const reduced = useMotionOff();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  /* The single close path.
     Escape used to restore focus to the card that opened the panel while the
     backdrop click just cleared state, so dismissing by backdrop dropped focus
     onto <body> and the next Tab restarted from the top of the document, a
     keyboard user who opened a profile from the last card was thrown back to
     the skip link. Every dismissal now goes through here, so there is only one
     place that can ever get the restore wrong.
     Focusing synchronously is safe even though AnimatePresence keeps the panel
     mounted for its exit: the trigger is outside the panel and never leaves the
     DOM, and moving focus out first is exactly what we want before the panel
     goes away. */
  const closePanel = useCallback(() => {
    setOpen(null);
    lastTrigger.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    /* Cleared BEFORE the focus call, never after. The cleanup below marks the
       panel `inert` on the way out, and reopening inside the exit window hands
       AnimatePresence the same key, so it reuses the very same DOM node rather
       than mounting a fresh one. Leaving the attribute on would make the focus
       call below fail silently and drop the visitor into a dialog they cannot
       reach with the keyboard at all. */
    panelRef.current?.removeAttribute("inert");
    /* Same reasoning for the backdrop: reopening inside the exit window
       reuses the same node, so anything the cleanup put on it has to come
       back off or the overlay stays click-through and un-dismissable. */
    backdropRef.current?.removeAttribute("inert");
    if (backdropRef.current) backdropRef.current.style.pointerEvents = "";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePanel();
        return;
      }

      /* Focus containment.
         The panel claims aria-modal="true", which tells assistive tech the rest
         of the page is unavailable. Nothing outside is inert or aria-hidden, so
         without this trap Tab walked straight out of the panel and into the
         card grid behind it, the claim was a lie, which is worse for a screen
         reader user than never having made it. The trap lives in the same
         effect as Escape so it is installed and torn down with the panel and
         cannot outlive it. */
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      // Recomputed on every Tab rather than captured when the effect runs: the
      // LinkedIn link renders only for members who have one, so the set is not
      // fixed, and a cached list would eventually hand focus to a detached node.
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(PANEL_FOCUSABLE),
      ).filter((el) => el.getClientRects().length > 0);

      if (focusables.length === 0) {
        // Should not happen, the close button is unconditional, but swallow
        // the Tab rather than let it escape a dialog that says it is modal.
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      // The `!panel.contains(active)` arm also recovers focus if something
      // outside stole it while the panel was open.
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);

      /* The trap dies with this effect, but AnimatePresence deliberately keeps
         the panel mounted for its 600ms slide-out, so for that window the close
         button and the LinkedIn link were still in the tab order of a dialog
         that had already been dismissed and whose Escape handler had just been
         removed. A visitor who dismissed a profile and kept tabbing could land
         back inside it with no way out but more tabbing.
         `inert` takes the exiting subtree out of the tab order and the
         accessibility tree without touching layout, paint, or the exit
         animation, so AnimatePresence behaves exactly as before. Focus has
         already been moved to the trigger by closePanel, so nothing is
         displaced here. Browsers without `inert` simply ignore the attribute
         and fall back to the old behaviour. */
      panelRef.current?.setAttribute("inert", "");

      /* The backdrop needs the same treatment, and for a worse failure.
         It is `fixed inset-0`, so while AnimatePresence holds it mounted for
         its exit it covers the entire viewport and takes every click. That is
         harmless when the exit completes in 400ms. It is not harmless if the
         exit never completes: with the frame loop starved, the overlay stays
         at whatever opacity it reached, which can be near zero, and the page
         then looks completely normal while swallowing every click on it. The
         keyboard path was already covered by the panel's `inert` above; this
         is the pointer path, and it is the one a visitor would report as
         "the site froze".

         Two mechanisms because they cover different browsers. `inert` is the
         correct declaration and also removes the subtree from the
         accessibility tree; `pointerEvents` is the guarantee, since it is
         universally supported and is exactly the property in question.
         Neither touches layout, paint or the exit animation, so
         AnimatePresence is unaffected. Both are undone on reopen above. */
      const backdrop = backdropRef.current;
      if (backdrop) {
        backdrop.setAttribute("inert", "");
        backdrop.style.pointerEvents = "none";
      }
    };
  }, [open, closePanel]);

  return (
    <>
      <RiseGroup className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {teamSorted.map((member, i) => (
          // The lean goes on the card, never on the portrait frame below it:
          // that frame is overflow-hidden and would shear the skewed corners
          // off mid-flight.
          <RiseItem key={member.slug} as="article" from={COLUMN_LEAN[i % 3]}>
            <button
              type="button"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setOpen(member);
              }}
              aria-haspopup="dialog"
              className="group/member block w-full text-left"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[10px] border border-rule-soft transition-colors duration-[400ms] ease-kofa group-hover/member:border-rule-teal">
                <Portrait member={member} />
              </div>

              <div className="mt-7 flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-[1.5rem] font-medium leading-tight tracking-[-0.017em] text-ink transition-colors duration-[400ms] ease-kofa group-hover/member:text-teal-deep">
                    {member.name}
                  </h2>
                  <p className="type-eyebrow mt-3 text-ink-soft transition-colors duration-[400ms] ease-kofa group-hover/member:text-teal-deep">
                    {member.role}
                  </p>
                </div>
                <span className="mt-1.5 shrink-0 text-ink-mute transition-all duration-[400ms] ease-kofa group-hover/member:translate-x-1 group-hover/member:text-teal-deep">
                  <Arrow size={16} />
                </span>
              </div>

              {member.standfirst && (
                <p className="type-body-sm mt-4 max-w-[34ch]">
                  {member.standfirst}
                </p>
              )}

              <span
                data-hover-reveal
                className="type-eyebrow mt-5 inline-block text-teal-deep opacity-0 transition-opacity duration-[400ms] ease-kofa group-hover/member:opacity-100 group-focus-visible/member:opacity-100"
              >
                View profile
              </span>

              <span className="mt-5 block h-px w-full bg-rule">
                <span className="block h-px w-full origin-left scale-x-0 bg-teal transition-transform duration-[600ms] ease-kofa group-hover/member:scale-x-100" />
              </span>
            </button>
          </RiseItem>
        ))}

      </RiseGroup>

      {/* ---------- side panel ----------
           Stays outside the RiseGroup and gets no entrance of its own. It is
           position: fixed, and a transformed ancestor becomes the containing
           block for a fixed descendant, so a Rise anywhere above it would pin
           the overlay to the card grid instead of the viewport. */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              ref={backdropRef}
              className="fixed inset-0 z-[70] bg-ink/25 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              // No exit under reduced motion => AnimatePresence unmounts at
              // once. Previously the overlay lingered, invisible, over the
              // whole viewport and swallowed every click.
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
              onClick={closePanel}
            />

            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="panel-name"
              className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-[34rem] flex-col overflow-y-auto border-l border-rule bg-ivory"
              initial={reduced ? { opacity: 0 } : { x: "100%" }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? undefined : { x: "100%" }}
              transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
            >
              <div className="flex items-center justify-between border-b border-rule px-7 py-5">
                <Eyebrow tone="mute">Profile</Eyebrow>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={closePanel}
                  className="-mr-2 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-300 ease-kofa hover:text-teal-deep"
                >
                  <span className="sr-only">Close profile</span>
                  <span aria-hidden className="relative block h-4 w-4">
                    <span className="absolute left-0 top-1/2 block h-px w-full rotate-45 bg-current" />
                    <span className="absolute left-0 top-1/2 block h-px w-full -rotate-45 bg-current" />
                  </span>
                </button>
              </div>

              <div className="px-7 py-9">
                <div className="relative aspect-[4/5] w-full max-w-[16rem] overflow-hidden rounded-[10px] border border-rule-soft">
                  <Portrait member={open} />
                </div>

                <h2
                  id="panel-name"
                  className="type-display-sm mt-9 text-ink"
                >
                  {open.name}
                </h2>
                <p className="type-eyebrow mt-4 text-teal-deep">{open.role}</p>

                {open.standfirst && (
                  <p className="type-body-lg mt-7">{open.standfirst}</p>
                )}

                <div className="mt-8 h-px w-full bg-rule" />

                {open.bioStatus === "placeholder" ? (
                  <div className="mt-8 border-l-2 border-dashed border-sage pl-6">
                    <p className="type-body-sm mt-3">
                      {open.biography}
                    </p>
                  </div>
                ) : (
                  <div className="mt-8 space-y-5">
                    {open.biography.split("\n\n").map((p, i) => (
                      <p key={i} className="type-body-sm">
                        {p}
                      </p>
                    ))}
                  </div>
                )}

                {open.linkedin && (
                  <a
                    href={open.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link mt-9 inline-flex items-center gap-2.5 text-[0.875rem] font-medium text-ink transition-colors duration-300 ease-kofa hover:text-teal-deep"
                  >
                    LinkedIn
                    <Arrow
                      size={14}
                      dir="up-right"
                      className="transition-transform duration-300 ease-kofa group-hover/link:translate-x-1 group-hover/link:-translate-y-1"
                    />
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
