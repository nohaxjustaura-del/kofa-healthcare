"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { Arrow } from "@/components/ui/Arrow";
import { Eyebrow } from "@/components/ui/primitives";
import { OPEN_TEAM_SLOTS, teamSorted, type TeamMember } from "@/data/team";

const EASE = [0.22, 1, 0.36, 1] as const;

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
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(150deg,#EEF3EF_0%,#E4EDE7_100%)]">
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
            stroke="#176D67"
            strokeOpacity={0.1 - i * 0.02}
            strokeWidth="0.3"
          />
        ))}
      </svg>
      <span className="relative font-serif text-[3.25rem] leading-none text-teal/45">
        {initials}
      </span>
      <span className="type-eyebrow relative mt-5 text-ink-mute">
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
          <span className="type-eyebrow text-ink-mute">
            Team member {String(n).padStart(2, "0")}
          </span>
        </div>
      </div>
      <p className="type-eyebrow mt-6 text-ink-mute">Awaiting KOFA content</p>
      <p className="type-body-xs mt-3 max-w-[32ch]">
        Add a member in the CMS with name, role, portrait, biography and LinkedIn,
        and a profile renders here automatically.
      </p>
    </div>
  );
}

export function TeamGrid() {
  const [open, setOpen] = useState<TeamMember | null>(null);
  const reduced = useMotionOff();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        lastTrigger.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {teamSorted.map((member, i) => (
          <article key={member.slug}>
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
                  <h2 className="font-serif text-[1.5rem] leading-tight tracking-[-0.017em] text-ink transition-colors duration-[400ms] ease-kofa group-hover/member:text-teal">
                    {member.name}
                  </h2>
                  <p className="type-eyebrow mt-3 text-ink-soft transition-colors duration-[400ms] ease-kofa group-hover/member:text-teal">
                    {member.role}
                  </p>
                </div>
                <span className="mt-1.5 shrink-0 text-ink-mute transition-all duration-[400ms] ease-kofa group-hover/member:translate-x-1 group-hover/member:text-teal">
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
                className="type-eyebrow mt-5 inline-block text-teal opacity-0 transition-opacity duration-[400ms] ease-kofa group-hover/member:opacity-100 group-focus-visible/member:opacity-100"
              >
                View profile
              </span>

              <span className="mt-5 block h-px w-full bg-rule">
                <span className="block h-px w-full origin-left scale-x-0 bg-teal transition-transform duration-[600ms] ease-kofa group-hover/member:scale-x-100" />
              </span>
            </button>
          </article>
        ))}

        {Array.from({ length: OPEN_TEAM_SLOTS }, (_, i) => (
          <OpenSlot key={i} n={teamSorted.length + i + 1} />
        ))}
      </div>

      {/* ---------- side panel ---------- */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-ink/25 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              // No exit under reduced motion => AnimatePresence unmounts at
              // once. Previously the overlay lingered, invisible, over the
              // whole viewport and swallowed every click.
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
              onClick={() => setOpen(null)}
            />

            <motion.div
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
                  onClick={() => {
                    setOpen(null);
                    lastTrigger.current?.focus();
                  }}
                  className="-mr-2 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-300 ease-kofa hover:text-teal"
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
                <p className="type-eyebrow mt-4 text-teal">{open.role}</p>

                {open.standfirst && (
                  <p className="type-body-lg mt-7">{open.standfirst}</p>
                )}

                <div className="mt-8 h-px w-full bg-rule" />

                {open.bioStatus === "placeholder" ? (
                  <div className="mt-8 border-l-2 border-dashed border-sage pl-6">
                    <p className="type-eyebrow text-ink-mute">
                      CMS placeholder
                    </p>
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
                    className="group/link mt-9 inline-flex items-center gap-2.5 text-[0.875rem] font-medium text-ink transition-colors duration-300 ease-kofa hover:text-teal"
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
