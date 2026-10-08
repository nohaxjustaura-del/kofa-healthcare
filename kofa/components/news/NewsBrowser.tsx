"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTablist } from "@/components/ui/useTablist";

/* ===========================================================================
   NEWS INDEX FILTER
   ---------------------------------------------------------------------------
   The rows are rendered on the SERVER (components/news/NewsRow.tsx, passed
   in as children by app/news/page.tsx). This component owns only the tabs,
   the "Show more" button and two attributes on the list; the stylesheet does
   the hiding (the NEWS INDEX block in app/globals.css).

   It used to import the whole news collection and the portfolio records
   and render every row in the browser, which put every headline and
   excerpt on the site into this page's JavaScript a second time: about
   19 KB gzipped, parsed before the tabs would respond.

   Every article is in the server HTML, so each one is a crawlable link and
   the full list works with JavaScript off (a <noscript> rule reveals the
   rows the "Show more" would have). With JavaScript, the index opens on the
   newest PAGE items of the selected filter and grows by PAGE at a time.
=========================================================================== */

export type NewsFilterKey = "all" | "kofa" | "portfolio";

const FILTERS: { key: NewsFilterKey; label: string; param?: string }[] = [
  { key: "all", label: "All" },
  { key: "kofa", label: "KOFA News", param: "KOFA News" },
  { key: "portfolio", label: "Portfolio News", param: "Portfolio News" },
];
const KEYS = FILTERS.map((f) => f.key);

/** Rows shown before "Show more", and added by each press of it. */
const PAGE = 12;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Hide every row past `limit` within the current filter. `:nth-child(of S)`
 *  counts only the rows of that type; where a browser lacks it, the rule is
 *  dropped and the filtered list simply shows in full. Each selector is its
 *  own rule so one it cannot parse never takes the others with it. */
function limitRules(limit: number) {
  const n = limit + 1;
  return [
    `.news-index[data-filter="all"]>.news-row:nth-child(n+${n}){display:none}`,
    `.news-index[data-filter="kofa"]>.news-row:nth-child(n+${n} of [data-type="kofa"]){display:none}`,
    `.news-index[data-filter="portfolio"]>.news-row:nth-child(n+${n} of [data-type="portfolio"]){display:none}`,
  ].join("");
}

export function NewsBrowser({
  counts,
  children,
}: {
  counts: Record<NewsFilterKey, number>;
  children: ReactNode;
}) {
  const [filter, setFilter] = useState<NewsFilterKey>("all");
  const [limit, setLimit] = useState(PAGE);
  const listRef = useRef<HTMLUListElement>(null);
  const focusRow = useRef<number | null>(null);

  // A shared link such as /news?type=Portfolio%20News opens on that tab.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("type");
    const match = FILTERS.find((f) => f.param && f.param === requested);
    if (match) setFilter(match.key);
  }, []);

  const select = useCallback((next: NewsFilterKey) => {
    setFilter(next);
    setLimit(PAGE);
    // Not router.replace: the page is static and nothing needs refetching,
    // so the address bar is updated directly and nothing re-renders.
    const param = FILTERS.find((f) => f.key === next)?.param;
    window.history.replaceState(
      null,
      "",
      param ? `/news?type=${encodeURIComponent(param)}` : "/news",
    );
  }, []);

  const { register, onKeyDown } = useTablist(KEYS, select);

  // After "Show more", move focus to the first row it revealed, so a
  // keyboard visitor carries on reading rather than landing back on the
  // button below everything they just asked to see.
  useIsomorphicLayoutEffect(() => {
    const index = focusRow.current;
    focusRow.current = null;
    if (index === null || !listRef.current) return;
    const visible = Array.from(
      listRef.current.querySelectorAll<HTMLElement>(":scope > .news-row"),
    ).filter((row) => row.getClientRects().length > 0);
    visible[index]?.querySelector<HTMLElement>("a")?.focus();
  }, [limit]);

  const total = counts[filter];
  const shown = Math.min(total, limit);
  const remaining = total - shown;
  const active = FILTERS.find((f) => f.key === filter)!;

  return (
    <section aria-labelledby="news-list-heading" className="mx-auto max-w-[76rem]">
      {/* Raw rather than as text children, so nothing in the selectors is
          ever entity-escaped. The content is built from a number. */}
      <style dangerouslySetInnerHTML={{ __html: limitRules(limit) }} />
      {/* Without JavaScript "Show more" cannot work, so show everything. */}
      <noscript
        dangerouslySetInnerHTML={{
          __html:
            "<style>.news-index .news-row{display:block!important}.news-more{display:none!important}</style>",
        }}
      />

      <div className="border-b border-[#cfe0e3]">
        <div
          role="tablist"
          aria-label="Filter news"
          className="flex gap-5 overflow-x-auto [scrollbar-width:none] sm:gap-8 [&::-webkit-scrollbar]:hidden"
        >
          {FILTERS.map((f, index) => {
            const selected = filter === f.key;
            return (
              <button
                key={f.key}
                ref={register(index)}
                role="tab"
                id={`news-tab-${f.key}`}
                aria-selected={selected}
                aria-controls="news-panel"
                tabIndex={selected ? 0 : -1}
                onKeyDown={(event) => onKeyDown(event, index)}
                onClick={() => select(f.key)}
                className={`relative min-h-11 shrink-0 py-4 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#006a70] ${
                  selected
                    ? "text-[#12394b] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#008e95]"
                    : "text-[#4d626c] hover:text-[#12394b]"
                }`}
              >
                {f.label}{" "}
                <span className="ml-1 hidden tabular-nums text-[#4d626c] sm:inline">
                  ({counts[f.key]})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="news-panel"
        role="tabpanel"
        aria-labelledby={`news-tab-${filter}`}
        tabIndex={-1}
        className="pt-8 sm:pt-10"
      >
        <h2 id="news-list-heading" className="sr-only">
          {filter === "all" ? "All news" : active.label}
        </h2>
        <p aria-live="polite" className="sr-only">
          Showing {shown} of {total} articles.
        </p>

        <ul
          ref={listRef}
          role="list"
          className="news-index border-t border-[#dbe8ea]"
          data-filter={filter}
        >
          {children}
        </ul>

        {remaining > 0 && (
          <div className="news-more mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={() => {
                focusRow.current = shown;
                setLimit((value) => value + PAGE);
              }}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-rule-strong px-7 text-[0.875rem] font-medium text-ink transition-[background-color,border-color] duration-300 ease-kofa hover:border-teal hover:bg-[rgba(0,142,149,0.05)]"
            >
              Show more news
            </button>
            <p className="text-[0.8125rem] tabular-nums text-[#4d626c]">
              Showing {shown} of {total}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
