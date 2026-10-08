"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTablist } from "@/components/ui/useTablist";
import { formatNewsDate, type NewsItem, type NewsType } from "@/data/news";
import { getCompany } from "@/data/portfolio";

const TYPES: (NewsType | null)[] = [null, "KOFA News", "Portfolio News"];

/** A concise, article-first index. The actual filter controls remain keyboard tabs.
    `items` comes from the server so the 12-month window in data/news.ts is
    applied there, not against the visitor's clock. */
export function NewsBrowser({ items: newsSorted }: { items: NewsItem[] }) {
  const router = useRouter();
  const [type, setType] = useState<NewsType | null>(null);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("type");
    if (TYPES.includes(requested as NewsType)) {
      setType(requested as NewsType);
    }
  }, []);

  const select = useCallback(
    (next: NewsType | null) => {
      setType(next);
      router.replace(next ? `/news?type=${encodeURIComponent(next)}` : "/news", {
        scroll: false,
      });
    },
    [router],
  );

  const visible = useMemo(
    () => newsSorted.filter((item) => !type || item.type === type),
    [newsSorted, type],
  );
  const { register, onKeyDown } = useTablist(TYPES, select);

  return (
    <section aria-labelledby="news-list-heading" className="mx-auto max-w-[76rem]">
      <div className="border-b border-[#cfe0e3]">
        <div
          role="tablist"
          aria-label="Filter news"
          className="flex gap-5 sm:gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TYPES.map((itemType, index) => {
            const selected = type === itemType;
            const label = itemType ?? "All";
            const count = newsSorted.filter(
              (item) => !itemType || item.type === itemType,
            ).length;
            return (
              <button
                key={label}
                ref={register(index)}
                role="tab"
                id={`news-tab-${index}`}
                aria-selected={selected}
                aria-controls="news-panel"
                tabIndex={selected ? 0 : -1}
                onKeyDown={(event) => onKeyDown(event, index)}
                onClick={() => select(itemType)}
                className={`relative shrink-0 py-4 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#006a70] ${
                  selected
                    ? "text-[#12394b] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#008e95]"
                    : "text-[#4d626c] hover:text-[#12394b]"
                }`}
              >
                {label} <span className="ml-1 hidden tabular-nums text-[#4d626c] sm:inline">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="news-panel"
        role="tabpanel"
        aria-labelledby={`news-tab-${TYPES.indexOf(type)}`}
        tabIndex={-1}
        className="pt-8 sm:pt-10"
      >
        <h2 id="news-list-heading" className="sr-only">
          {type ?? "All news"}
        </h2>
        <p aria-live="polite" className="sr-only">
          {visible.length} articles shown.
        </p>
        <div className="border-t border-[#dbe8ea]">
          {visible.map((item) => {
            const company = item.company ? getCompany(item.company) : undefined;
            return (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className="group grid gap-3 border-b border-[#dbe8ea] py-7 outline-none transition-colors duration-200 hover:bg-[#edf6f7] focus-visible:bg-[#edf6f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#006a70] sm:grid-cols-[10rem_minmax(0,1fr)_8rem] sm:items-start sm:gap-8 sm:px-5"
              >
                <div className="text-[0.72rem] font-medium uppercase tracking-[0.1em] text-[#006a70]">
                  {company?.name ?? item.type}
                </div>
                <div>
                  <h3 className="max-w-[50ch] text-[1.125rem] font-medium leading-[1.38] tracking-[-0.015em] text-[#12394b] transition-colors duration-200 group-hover:text-[#006a70] sm:text-[1.25rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-[72ch] text-[0.9375rem] leading-6 text-[#4d626c]">
                    {item.excerpt}
                  </p>
                </div>
                <time
                  dateTime={item.date}
                  className="text-[0.8125rem] leading-5 text-[#4d626c] sm:text-right"
                >
                  {formatNewsDate(item.date)}
                </time>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
