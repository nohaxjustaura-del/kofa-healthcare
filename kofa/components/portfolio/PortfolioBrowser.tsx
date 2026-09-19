"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTablist } from "@/components/ui/useTablist";
import { PortfolioCard } from "./PortfolioCard";
import { portfolioSorted, type PortfolioStatus } from "@/data/portfolio";

const STATUSES: PortfolioStatus[] = ["Active", "Exits"];

/*
 * KOFA's existing useTablist supplies WAI-ARIA automatic activation, roving
 * tabindex, arrow keys, Home and End. The quiet underline convention was
 * informed by Origin UI's public Tabs component (https://21st.dev/@originui/
 * components/tabs, MIT; reviewed 2026-09-15). No Origin UI source or package
 * is included here.
 */
export function PortfolioBrowser({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState<PortfolioStatus>("Active");

  useEffect(() => {
    if (compact) return;
    const requested = new URLSearchParams(window.location.search).get("status");
    if (STATUSES.includes(requested as PortfolioStatus)) {
      setActive(requested as PortfolioStatus);
    }
  }, [compact]);

  const select = useCallback(
    (status: PortfolioStatus) => {
      setActive(status);
      if (!compact) {
        router.replace(`/portfolio?status=${encodeURIComponent(status)}`, {
          scroll: false,
        });
      }
    },
    [compact, router],
  );

  const visible = useMemo(
    () => portfolioSorted.filter((company) => company.portfolioStatus === active),
    [active],
  );
  const { register, onKeyDown } = useTablist(STATUSES, select);

  return (
    <section aria-labelledby="portfolio-companies-heading">
      <div className="border-b border-[#cfe0e3]">
        <div
          role="tablist"
          aria-label="Portfolio status"
          className="flex gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {STATUSES.map((status, index) => {
            const selected = status === active;
            const count = portfolioSorted.filter(
              (company) => company.portfolioStatus === status,
            ).length;
            return (
              <button
                key={status}
                ref={register(index)}
                id={`portfolio-tab-${status.toLowerCase()}`}
                role="tab"
                aria-selected={selected}
                aria-controls="portfolio-panel"
                tabIndex={selected ? 0 : -1}
                onKeyDown={(event) => onKeyDown(event, index)}
                onClick={() => select(status)}
                className={`relative shrink-0 py-4 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#006a70] ${
                  selected
                    ? "text-[#12394b] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#008e95]"
                    : "text-[#4d626c] hover:text-[#12394b]"
                }`}
              >
                {status} <span className="ml-1 tabular-nums text-[#4d626c]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="portfolio-panel"
        role="tabpanel"
        aria-labelledby={`portfolio-tab-${active.toLowerCase()}`}
        tabIndex={-1}
        className="pt-10 sm:pt-12"
      >
        <h2 id="portfolio-companies-heading" className="sr-only">
          {active} portfolio companies
        </h2>
        <p aria-live="polite" className="sr-only">
          Showing {visible.length} {active.toLowerCase()} companies.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {visible.map((company) => (
            <PortfolioCard key={company.slug} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
}
