"use client";

import { useMotionPreference } from "@/components/motion/MotionPreference";
import { useMounted } from "@/components/motion/useMounted";

/* ---------------------------------------------------------------------------
   MOTION CONTROL
   ---------------------------------------------------------------------------
   Motion is on for everyone by default (see the note at the top of
   components/motion/MotionPreference.tsx). This is the recourse: one control,
   in the footer, that turns the whole system off and keeps it off.

   It is a real <button> with `aria-pressed`, not a checkbox styled to look
   like a switch, because it performs an action immediately rather than
   collecting a value to be submitted. The label states the CURRENT state
   rather than the action, which is the convention `aria-pressed` expects.

   RENDERED ONLY AFTER MOUNT. The preference is read from the DOM after
   hydration, so before that this control does not know which state it is in
   and would have to render a guess. Rendering a button that says "Motion on"
   and then silently flipping it to "Motion off" a tick later is worse than
   rendering nothing for that tick; and with no JavaScript the control could
   not work at all, so there is nothing to show. `useMounted()` is false on the
   server and on the first client render, so first paint matches exactly.
--------------------------------------------------------------------------- */

export function MotionToggle() {
  const { motionOff, setMotionOff } = useMotionPreference();
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={() => setMotionOff(!motionOff)}
      aria-pressed={!motionOff}
      /* -my-2/py-2 lifts the hit area past the 24px WCAG 2.2 minimum without
         moving the baseline, the same device the footer links use. */
      className="group/motion -my-2 inline-flex items-center gap-2.5 py-2 text-ink-mute transition-colors duration-300 ease-kofa hover:text-ink"
    >
      <span
        aria-hidden
        className={`relative block h-[9px] w-[22px] rounded-full border transition-colors duration-300 ease-kofa ${
          motionOff ? "border-rule-strong" : "border-rule-teal bg-[rgba(23,109,103,0.1)]"
        }`}
      >
        <span
          className={`absolute top-1/2 block h-[5px] w-[5px] -translate-y-1/2 rounded-full transition-[left,background-color] duration-300 ease-kofa ${
            motionOff ? "left-[2px] bg-ink-mute" : "left-[13px] bg-teal"
          }`}
        />
      </span>
      <span className="type-eyebrow">
        Motion {motionOff ? "off" : "on"}
      </span>
    </button>
  );
}
