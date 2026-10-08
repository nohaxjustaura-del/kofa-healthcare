"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { isMotionOff } from "@/components/motion/MotionPreference";
import { Rise } from "@/components/motion/Rise";
import { Arrow } from "@/components/ui/Arrow";
import { Eyebrow } from "@/components/ui/primitives";
import { teamSorted, type TeamMember } from "@/data/team";

/** Length of the sheet's slide-out; matches .team-sheet in app/globals.css. */
const EXIT_MS = 600;

/* ---------------------------------------------------------------------------
   Portrait plate.
   KOFA has not supplied photography for everyone, so rather than a grey box
   or a stock face, the plate carries the member's initials over the ice
   ground and says plainly what belongs there. It reads as a designed
   element, not as a missing asset, and swaps for a real portrait the moment
   `portrait` is set in data/team.ts.
--------------------------------------------------------------------------- */
function Portrait({ member }: { member: TeamMember }) {
  if (member.portrait) {
    return (
      <Image
        src={member.portrait}
        alt={`${member.name}, ${member.role}`}
        fill
        quality={88}
        sizes="(max-width: 767px) calc(100vw - 3rem), (max-width: 1023px) calc((100vw - 5rem) / 2), 380px"
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

/* ---------------------------------------------------------------------------
   Entrance lean, read off a card's position in the grid flow.
   The lean is composed for the three-up row, the widest layout the grid
   reaches: the row opens outward from its own middle, first column in from
   the left, the centre with no side to come from, the last in from the
   right, each a beat after the one before. Cards already on screen when the
   page loads do not move at all (components/motion/useEnter.ts).
--------------------------------------------------------------------------- */
const COLUMN_LEAN = ["left", "up", "right"] as const;

export function TeamGrid() {
  const [member, setMember] = useState<TeamMember | null>(null);
  const [closing, setClosing] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const pressStartedOnBackdrop = useRef(false);

  /* ---------------------------------------------------------------------
     THE PANEL IS A NATIVE <dialog>, opened with showModal().

     It used to be two framer-motion layers under AnimatePresence plus a
     hand-written focus trap, and most of that component's length was spent
     defending against one failure: an exit animation that never completed
     left a fixed, full-viewport backdrop over the page, invisible and
     swallowing every click. That was seen, not theorised.

     A modal <dialog> removes the whole class of problem. The browser traps
     focus, makes the rest of the page inert for the mouse, the keyboard
     and assistive technology alike, and renders the sheet and its backdrop
     in the top layer, which disappears the instant close() runs. The slide
     is a CSS animation, and closing waits for it on a timer rather than on
     an animation event, so a starved frame loop can delay the close by at
     most EXIT_MS but can never strand it.
  --------------------------------------------------------------------- */

  // Opening: once a member is chosen and the sheet has rendered, show it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!member || !dialog || dialog.open) return;
    dialog.showModal();
    // Explicit, rather than trusting each browser's initial-focus rules.
    closeRef.current?.focus();
  }, [member]);

  // The page behind should not scroll while a profile is open.
  // html has scrollbar-gutter: stable, so the page does not shift sideways
  // when its scrollbar goes (app/globals.css).
  useEffect(() => {
    if (!member) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [member]);

  // Closing: slide out, then close for real. With motion off, at once.
  const requestClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open || closing) return;
    if (isMotionOff()) dialog.close();
    else setClosing(true);
  }, [closing]);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => dialogRef.current?.close(), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  // Every way the dialog can close (the button, Escape, the backdrop, or the
  // browser itself) ends in this one event, so state and focus are restored
  // in exactly one place.
  const onClosed = useCallback(() => {
    setClosing(false);
    setMember(null);
    lastTrigger.current?.focus();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {teamSorted.map((member, i) => (
          // The lean goes on the card, never on the portrait frame below it:
          // that frame is overflow-hidden and would shear the skewed corners
          // off mid-flight.
          <Rise
            key={member.slug}
            as="article"
            from={COLUMN_LEAN[i % 3]}
            delay={0.05 + (i % 3) * 0.08}
            duration={1}
          >
            <button
              type="button"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setMember(member);
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
          </Rise>
        ))}
      </div>

      {/* ---------- side panel ----------
           Rendered once and kept in the tree; a closed <dialog> draws
           nothing and is absent from the accessibility tree. Only its
           contents come and go with `member`.

           The dialog box itself is never the click target inside the sheet:
           the inner wrapper fills it and owns the scrolling, so a click
           whose target is the <dialog> can only have landed on ::backdrop.
           The press has to START there too, so a text selection dragged out
           of the panel does not dismiss it. */}
      <dialog
        ref={dialogRef}
        aria-labelledby="panel-name"
        data-closing={closing || undefined}
        onCancel={(e) => {
          // Escape. Animate out instead of vanishing; if the browser insists
          // on closing anyway, onClose still restores everything.
          e.preventDefault();
          requestClose();
        }}
        onClose={onClosed}
        onPointerDown={(e) => {
          pressStartedOnBackdrop.current = e.target === e.currentTarget;
        }}
        onClick={(e) => {
          if (pressStartedOnBackdrop.current && e.target === e.currentTarget) {
            requestClose();
          }
        }}
        className="team-sheet fixed inset-y-0 left-auto right-0 m-0 h-full max-h-full w-full max-w-[34rem] overflow-hidden border-0 border-l border-rule bg-white p-0 text-ink"
      >
        {member && (
          <div className="h-full overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between border-b border-rule px-7 py-5">
              <Eyebrow tone="mute">Profile</Eyebrow>
              <button
                ref={closeRef}
                type="button"
                onClick={requestClose}
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
                <Portrait member={member} />
              </div>

              <h2 id="panel-name" className="type-display-sm mt-9 text-ink">
                {member.name}
              </h2>
              <p className="type-eyebrow mt-4 text-teal-deep">{member.role}</p>

              {member.standfirst && (
                <p className="type-body-lg mt-7">{member.standfirst}</p>
              )}

              <div className="mt-8 h-px w-full bg-rule" />

              {member.bioStatus === "placeholder" ? (
                <div className="mt-8 border-l-2 border-dashed border-sage pl-6">
                  <p className="type-body-sm mt-3">{member.biography}</p>
                </div>
              ) : (
                <div className="mt-8 space-y-5">
                  {member.biography.split("\n\n").map((p, i) => (
                    <p key={i} className="type-body-sm">
                      {p}
                    </p>
                  ))}
                </div>
              )}

              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link mt-9 inline-flex min-h-11 items-center gap-2.5 text-[0.875rem] font-medium text-ink transition-colors duration-300 ease-kofa hover:text-teal-deep"
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
          </div>
        )}
      </dialog>
    </>
  );
}
