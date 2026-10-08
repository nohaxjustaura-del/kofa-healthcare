"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTablist } from "@/components/ui/useTablist";
import type { PortfolioStatus } from "@/data/portfolio";

const STATUSES: PortfolioStatus[] = ["Active", "Exits"];

/*
 * KOFA's existing useTablist supplies WAI-ARIA automatic activation, roving
 * tabindex, arrow keys, Home and End. The quiet underline convention was
 * informed by Origin UI's public Tabs component (https://21st.dev/@originui/
 * components/tabs, MIT; reviewed 2026-09-15). No Origin UI source or package
 * is included here.
 *
 * The cards are rendered on the server by app/portfolio/page.tsx and passed
 * in as children, each carrying `data-status`; this component only sets
 * `data-filter` on the grid, and the PORTFOLIO INDEX rule in app/globals.css
 * hides the other status. It used to import the portfolio records and
 * render the cards itself, which shipped every company's copy to the
 * browser as JavaScript.
 */
export function PortfolioBrowser({
  counts,
  children,
}: {
  counts: Record<PortfolioStatus, number>;
  children: ReactNode;
}) {
  const [active, setActive] = useState<PortfolioStatus>("Active");

  // /portfolio?status=Exits opens on the Exits tab.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("status");
    if (STATUSES.includes(requested as PortfolioStatus)) {
      setActive(requested as PortfolioStatus);
    }
  }, []);

  const select = useCallback((status: PortfolioStatus) => {
    setActive(status);
    // The page is static; update the address without a router navigation.
    window.history.replaceState(
      null,
      "",
      status === "Active" ? "/portfolio" : `/portfolio?status=${status}`,
    );
  }, []);

  const { register, onKeyDown } = useTablist(STATUSES, select);

  return (
    <section aria-labelledby="portfolio-companies-heading">
      {/* Without JavaScript the tabs cannot switch, so show both statuses. */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: "<style>.portfolio-index>li{display:grid!important}</style>",
        }}
      />
      <div className="border-b border-[#cfe0e3]">
        <div
          role="tablist"
          aria-label="Portfolio status"
          className="flex gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {STATUSES.map((status, index) => {
            const selected = status === active;
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
                className={`relative min-h-11 shrink-0 py-4 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#006a70] ${
                  selected
                    ? "text-[#12394b] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#008e95]"
                    : "text-[#4d626c] hover:text-[#12394b]"
                }`}
              >
                {status}{" "}
                <span className="ml-1 tabular-nums text-[#4d626c]">
                  ({counts[status]})
                </span>
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
          Showing {counts[active]} {active === "Exits" ? "exited" : "active"}{" "}
          companies.
        </p>
        <ul
          role="list"
          data-filter={active.toLowerCase()}
          className="portfolio-index grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5"
        >
          {children}
        </ul>
      </div>
    </section>
  );
}
