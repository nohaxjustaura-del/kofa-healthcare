"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { Arrow } from "@/components/ui/Arrow";
import { investmentAreas } from "@/data/site";
import { portfolioSorted, type HealthcareCategory } from "@/data/portfolio";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------------------------------------------------------------------
   AREAS OF INTEREST
   ---------------------------------------------------------------------------
   Expandable rows that reveal something real: the companies KOFA has actually
   backed in that area, plus a small field visualisation. An area with no
   published companies says so rather than pretending otherwise.
--------------------------------------------------------------------------- */

function AreaField({ n, open }: { n: number; open: boolean }) {
  // Deterministic ring of nodes, count driven by the area's activity.
  const count = Math.max(4, Math.min(n + 4, 11));
  const pts = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    const r = 26 + ((i * 37) % 13);
    return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r, i };
  });

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" aria-hidden>
      {pts.flatMap((p, i) =>
        pts.slice(i + 1).map((q, j) => (
          <line
            key={`${i}-${j}`}
            x1={p.x}
            y1={p.y}
            x2={q.x}
            y2={q.y}
            stroke="#176D67"
            strokeWidth="0.22"
            strokeOpacity={open ? 0.26 : 0.1}
            className="transition-all duration-[700ms] ease-kofa"
          />
        )),
      )}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={open ? 1.5 : 1}
          fill="#176D67"
          fillOpacity={open ? 0.55 : 0.28}
          className="transition-all duration-[700ms] ease-kofa"
        />
      ))}
    </svg>
  );
}

export function AreasAccordion() {
  const [open, setOpen] = useState<string | null>(investmentAreas[0].slug);
  const reduced = useMotionOff();

  return (
    <div className="border-t border-rule">
      {investmentAreas.map((area, i) => {
        const isOpen = open === area.slug;
        const companies = portfolioSorted.filter(
          (c) => c.category === (area.title as HealthcareCategory),
        );

        return (
          <div key={area.slug} className="border-b border-rule">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : area.slug)}
                aria-expanded={isOpen}
                aria-controls={`area-panel-${area.slug}`}
                className="group/row flex w-full items-center gap-6 py-7 text-left md:gap-9"
              >
                <span className="type-eyebrow w-6 shrink-0 tabular-nums text-ink-mute">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span
                  className={`flex-1 font-serif text-[1.5rem] leading-tight tracking-[-0.018em] transition-[transform,color] duration-[450ms] ease-kofa md:text-[2rem] ${
                    isOpen ? "text-teal" : "text-ink group-hover/row:text-teal"
                  } ${!reduced ? "group-hover/row:translate-x-1.5" : ""}`}
                >
                  {area.title}
                </span>

                {companies.length > 0 && (
                  <span className="type-eyebrow shrink-0 tabular-nums text-ink-mute">
                    {companies.length}
                  </span>
                )}

                <span
                  aria-hidden
                  className={`relative block h-3 w-3 shrink-0 transition-transform duration-[450ms] ease-kofa ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current text-ink-soft" />
                  <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current text-ink-soft" />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  data-reveal
                  id={`area-panel-${area.slug}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.55, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-12 gap-x-0 sm:gap-x-8 gap-y-8 pb-11 md:pl-[3.75rem]">
                    <div className="col-span-12 lg:col-span-6">
                      <p className="type-body max-w-[46ch]">{area.note}</p>

                      {companies.length > 0 ? (
                        <ul className="mt-7 flex flex-wrap gap-x-2 gap-y-2">
                          {companies.map((c) => (
                            <li key={c.slug}>
                              <Link
                                href={`/portfolio/${c.slug}`}
                                className="group/chip inline-flex items-center gap-2 rounded-md border border-rule px-3.5 py-2 text-[0.8125rem] text-ink-soft transition-colors duration-300 ease-kofa hover:border-rule-teal hover:text-teal"
                              >
                                {c.name}
                                <Arrow
                                  size={12}
                                  dir="up-right"
                                  className="opacity-0 transition-all duration-300 ease-kofa group-hover/chip:opacity-100"
                                />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="type-meta mt-6 text-ink-mute">
                          No companies published in this area yet.
                        </p>
                      )}

                      {!area.stated && (
                        <p className="type-meta mt-6 text-ink-mute">
                          Derived from the published portfolio. Confirm with
                          KOFA before promoting as a stated mandate.
                        </p>
                      )}
                    </div>

                    <div className="col-span-12 hidden lg:col-span-3 lg:col-start-9 lg:block">
                      <div className="aspect-square w-full max-w-[13rem]">
                        <AreaField n={companies.length} open={isOpen} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
