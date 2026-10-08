"use client";

import {
  isMotionOff,
  useMotionPreference,
} from "@/components/motion/MotionPreference";

/* ---------------------------------------------------------------------------
   MOTION CONTROL
   ---------------------------------------------------------------------------
   Motion is on for everyone by default (see the note at the top of
   components/motion/MotionPreference.tsx), and the operating system's
   reduced-motion setting is deliberately not consulted. That decision was
   only ever defensible because this control exists: one button, in the
   footer, that stops everything the site animates (the hero film, the
   portfolio strip, the film grain, every entrance) and keeps it stopped on
   later visits. It is also what satisfies WCAG 2.2.2 for the portfolio
   strip, which otherwise pauses only for a mouse or a keyboard focus.

   The label names the action, "Pause animations" or "Play animations",
   rather than pairing a fixed name with aria-pressed. Which of the two
   shows is decided by the stylesheet from html[data-motion] (the MOTION
   CONTROL rules in app/globals.css), so the server markup is correct on the
   first frame, React never has to render a guess, and hydration cannot
   disagree. The hidden label is display:none, so assistive technology reads
   only the current one. Without JavaScript nothing could honour a click, so
   the control is hidden there too.
--------------------------------------------------------------------------- */

export function MotionToggle({ className = "" }: { className?: string }) {
  const { setMotionOff } = useMotionPreference();

  return (
    <button
      type="button"
      onClick={() => setMotionOff(!isMotionOff())}
      className={`motion-toggle group/motion -my-2 inline-flex items-center gap-2 py-2 text-xs text-slate-500 transition-colors hover:text-teal-deep ${className}`}
    >
      <span className="motion-toggle__on inline-flex items-center gap-2">
        <svg aria-hidden viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor">
          <rect x="2" y="1.5" width="2.6" height="9" rx="0.6" />
          <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.6" />
        </svg>
        Pause animations
      </span>
      <span className="motion-toggle__off inline-flex items-center gap-2">
        <svg aria-hidden viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor">
          <path d="M3 1.6v8.8a.6.6 0 0 0 .92.5l6.6-4.4a.6.6 0 0 0 0-1L3.92 1.1A.6.6 0 0 0 3 1.6Z" />
        </svg>
        Play animations
      </span>
    </button>
  );
}
