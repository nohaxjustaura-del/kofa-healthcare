"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { Rise } from "@/components/motion/Rise";
import { NewsCard } from "./NewsCard";
import { useTablist } from "@/components/ui/useTablist";
import { companiesWithNews, newsSorted, type NewsType } from "@/data/news";
import { getCompany } from "@/data/portfolio";

const EASE = [0.22, 1, 0.36, 1] as const;
const TYPES: (NewsType | null)[] = [null, "KOFA News", "Portfolio News"];

export function NewsBrowser() {
  const router = useRouter();
  const reduced = useMotionOff();

  /* Deliberately NOT useSearchParams(), see the note in
     components/portfolio/PortfolioBrowser.tsx. That hook made this whole list
     client-only, so all 60 articles were absent from the server HTML. Now the
     full list is prerendered and a ?type= / ?company= deep link is applied
     one tick after mount. */
  const [type, setType] = useState<NewsType | null>(null);
  const [company, setCompany] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("type");
    if (t && TYPES.includes(t as NewsType)) setType(t as NewsType);
    const c = q.get("company");
    if (c) setCompany(c);
  }, []);

  const sync = useCallback(
    (t: NewsType | null, c: string | null) => {
      const q = new URLSearchParams();
      if (t) q.set("type", t);
      if (c) q.set("company", c);
      const s = q.toString();
      router.replace(s ? `/news?${s}` : "/news", { scroll: false });
    },
    [router],
  );

  const pickType = (t: NewsType | null) => {
    setType(t);
    // The company filter only makes sense against portfolio news.
    const c = t === "KOFA News" ? null : company;
    setCompany(c);
    sync(t, c);
  };

  const pickCompany = (c: string | null) => {
    setCompany(c);
    sync(type, c);
  };

  const visible = useMemo(
    () =>
      newsSorted.filter(
        (n) =>
          (!type || n.type === type) && (!company || n.company === company),
      ),
    [type, company],
  );

  const companyOptions = useMemo(() => {
    const slugs = companiesWithNews();
    return slugs
      .map((s) => getCompany(s))
      .filter(Boolean)
      .sort((a, b) => a!.name.localeCompare(b!.name)) as NonNullable<
      ReturnType<typeof getCompany>
    >[];
  }, []);

  const count = (t: NewsType | null) =>
    newsSorted.filter((n) => !t || n.type === t).length;

  const { register, onKeyDown } = useTablist(TYPES, pickType);

  return (
    <>
      {/* --- primary: news type ---
          Outside the tablist's overflow-x-auto and leaning from "up", for the
          reasons written out over the same strip in
          components/portfolio/PortfolioBrowser.tsx. */}
      <Rise from="up" as="div" className="border-y border-rule">
        <div
          role="tablist"
          aria-label="Filter by news type"
          className="-mx-6 flex gap-1 overflow-x-auto px-6 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TYPES.map((t, i) => {
            const on = type === t;
            return (
              <button
                key={t ?? "all"}
                ref={register(i)}
                role="tab"
                id={`news-tab-${i}`}
                aria-selected={on}
                aria-controls="news-panel"
                // Roving tabindex: one Tab stop, arrows move within the set.
                tabIndex={on ? 0 : -1}
                onKeyDown={(e) => onKeyDown(e, i)}
                onClick={() => pickType(t)}
                className={`relative shrink-0 whitespace-nowrap px-4 py-5 text-[0.875rem] font-medium tracking-[-0.005em] transition-colors duration-300 ease-kofa first:pl-0 ${
                  on ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {t ?? "All news"}
                <span className="type-eyebrow ml-2 align-super text-[9px] tabular-nums text-ink-mute">
                  {count(t)}
                </span>
                {on && (
                  <motion.span
                    layoutId="news-underline"
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
      </Rise>

      {/* --- secondary: company (portfolio news only) ---
          No Rise on this row: it is height-animated open and shut by the
          AnimatePresence below, and the element doing that is necessarily
          overflow-hidden, which is the one place a skew must never go. Its
          entrance is the collapse itself. */}
      <AnimatePresence initial={false}>
        {type !== "KOFA News" && (
          <motion.div
            data-reveal
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
            className="overflow-hidden border-b border-rule"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 py-4">
              <span className="type-eyebrow mr-3 text-ink-mute">Company</span>
              <button
                onClick={() => pickCompany(null)}
                aria-pressed={company === null}
                className={`link-draw px-2 py-1 text-[0.8125rem] transition-colors duration-300 ease-kofa ${
                  company === null ? "text-teal" : "text-ink-soft hover:text-ink"
                }`}
              >
                All companies
              </button>
              {companyOptions.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => pickCompany(c.slug)}
                  aria-pressed={company === c.slug}
                  className={`link-draw px-2 py-1 text-[0.8125rem] transition-colors duration-300 ease-kofa ${
                    company === c.slug
                      ? "text-teal"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- list ---
          And none below here either, same reasoning as the portfolio grid:
          the rows are AnimatePresence children animating their own layout, and
          a deep-linked ?type= / ?company= re-filters one tick after mount,
          which would put the re-projection inside any entrance the panel had.
          The rows already arrive; the filter furniture above them did not. */}
      <div
        id="news-panel"
        role="tabpanel"
        aria-labelledby={`news-tab-${TYPES.indexOf(type)}`}
        tabIndex={-1}
        className="mt-[clamp(2rem,4vw,3.5rem)]"
      >
        {/* Same heading-outline fix as /portfolio: NewsCard renders h3, which
            is right on the homepage under HomeNews's h2 and wrong here, where
            nothing sits between the page h1 and the cards. */}
        <h2 className="sr-only">All news</h2>
        <p aria-live="polite" className="sr-only">
          {visible.length} articles shown.
        </p>

        {visible.length === 0 ? (
          <p className="type-body py-20 text-center">
            No articles match this combination yet.
          </p>
        ) : (
          <motion.div layout={!reduced}>
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((item, i) => (
                <motion.div
                  data-reveal
                  key={item.slug}
                  layout={!reduced}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -8 }}
                  transition={{
                    duration: reduced ? 0.12 : 0.45,
                    delay: reduced ? 0 : Math.min(i * 0.022, 0.22),
                    ease: EASE,
                  }}
                >
                  <NewsCard item={item} variant="row" />
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="h-px w-full bg-rule" />
          </motion.div>
        )}
      </div>
    </>
  );
}
