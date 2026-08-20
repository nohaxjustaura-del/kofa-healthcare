"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { PortfolioCard } from "./PortfolioCard";
import { useTablist } from "@/components/ui/useTablist";
import {
  activeCategories,
  categoryCount,
  portfolioSorted,
  type HealthcareCategory,
} from "@/data/portfolio";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------------------------------------------------------------------
   FILTER + GRID
   ---------------------------------------------------------------------------
   The taxonomy is a row of text, not pills, with a single underline that
   travels between terms. Filtering is client-side and URL-synced, so a
   category is linkable and the back button behaves.

   Grid spans cycle 7/5 then 4/4/4 so no two rows read the same, but collapse
   to equal thirds when a filter leaves only a few companies, variation is
   there to create rhythm, not to make a short list look ragged.
--------------------------------------------------------------------------- */

const CYCLE = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
] as const;

const SIZE_FOR_SPAN: Record<string, "feature" | "standard" | "compact"> = {
  "lg:col-span-7": "feature",
  "lg:col-span-5": "standard",
  "lg:col-span-4": "compact",
};

export function PortfolioBrowser() {
  const router = useRouter();
  const reduced = useMotionOff();

  /* Deliberately NOT useSearchParams().
     On a statically prerendered route that hook forces its whole Suspense
     boundary to be client-rendered, which shipped /portfolio with zero
     companies in the HTML: the grid existed only after JS ran. The brief
     requires crawlable content, and a portfolio is the last thing that should
     depend on JavaScript to exist.

     Instead the full grid server-renders, and a deep link like
     ?category=Diagnostics is applied one tick after mount. */
  const [active, setActive] = useState<HealthcareCategory | null>(null);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("category");
    if (raw && activeCategories.includes(raw as HealthcareCategory)) {
      setActive(raw as HealthcareCategory);
    }
  }, []);

  const select = useCallback(
    (cat: HealthcareCategory | null) => {
      setActive(cat);
      const url = cat
        ? `/portfolio?category=${encodeURIComponent(cat)}`
        : "/portfolio";
      router.replace(url, { scroll: false });
    },
    [router],
  );

  const visible = useMemo(
    () =>
      active
        ? portfolioSorted.filter((c) => c.category === active)
        : portfolioSorted,
    [active],
  );

  const uniform = visible.length <= 3;

  const tabs = useMemo<(HealthcareCategory | null)[]>(
    () => [null, ...activeCategories],
    [],
  );
  const { register, onKeyDown } = useTablist(tabs, select);

  return (
    <>
      {/* --- taxonomy --- */}
      <div className="border-y border-rule">
        <div
          role="tablist"
          aria-label="Filter portfolio by category"
          className="-mx-6 flex gap-1 overflow-x-auto px-6 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((cat, i) => {
            const on = active === cat;
            const label = cat ?? "All";
            const count = cat ? categoryCount(cat) : portfolioSorted.length;
            return (
              <button
                key={label}
                ref={register(i)}
                role="tab"
                id={`portfolio-tab-${i}`}
                aria-selected={on}
                aria-controls="portfolio-panel"
                // Roving tabindex: the set is one Tab stop, arrows move inside.
                tabIndex={on ? 0 : -1}
                onKeyDown={(e) => onKeyDown(e, i)}
                onClick={() => select(cat)}
                className={`group relative shrink-0 whitespace-nowrap px-4 py-5 text-[0.875rem] font-medium tracking-[-0.005em] transition-colors duration-300 ease-kofa first:pl-0 ${
                  on ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {label}
                <span className="type-eyebrow ml-2 align-super text-[9px] tabular-nums text-ink-mute">
                  {count}
                </span>
                {on && (
                  <motion.span
                    layoutId="filter-underline"
                    className="absolute inset-x-0 -bottom-px h-px bg-teal"
                    transition={
                      reduced ? { duration: 0 } : { duration: 0.45, ease: EASE }
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- grid --- */}
      <div
        id="portfolio-panel"
        role="tabpanel"
        aria-labelledby={`portfolio-tab-${tabs.indexOf(active)}`}
        tabIndex={-1}
        className="mt-[clamp(3rem,5vw,4.5rem)]"
      >
        <p aria-live="polite" className="sr-only">
          {visible.length} companies shown
          {active ? ` in ${active}` : ""}.
        </p>

        <motion.div
          layout={!reduced}
          className="grid grid-cols-12 gap-x-0 sm:gap-x-8 gap-y-[clamp(3.5rem,6vw,5.5rem)]"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((company, i) => {
              const span = uniform ? "lg:col-span-4" : CYCLE[i % CYCLE.length];
              return (
                <motion.div
                  data-reveal
                  key={company.slug}
                  layout={!reduced}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -10 }}
                  transition={{
                    duration: reduced ? 0.15 : 0.5,
                    delay: reduced ? 0 : Math.min(i * 0.035, 0.25),
                    ease: EASE,
                  }}
                  className={`col-span-12 sm:col-span-6 ${span}`}
                >
                  <PortfolioCard
                    company={company}
                    size={uniform ? "compact" : SIZE_FOR_SPAN[span]}
                    index={i}
                    total={visible.length}
                    priority={i < 2}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
