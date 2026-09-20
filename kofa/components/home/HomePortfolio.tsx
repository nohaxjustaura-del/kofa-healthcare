"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useTablist } from "@/components/ui/useTablist";
import { portfolioSorted, type PortfolioStatus } from "@/data/portfolio";

const STATUSES: PortfolioStatus[] = ["Active", "Exits"];

/* ---------------------------------------------------------------------------
   HOMEPAGE PORTFOLIO
   ---------------------------------------------------------------------------
   Active / Exits, per the client's classification: Alydia Health and Aria CV
   are the two exits, the other fourteen are active. Selecting a filter stays
   on the homepage; /portfolio is where the full cards live.

   This declared role="tablist" but implemented none of the pattern: no roving
   tabindex, no arrow keys, no aria-labelledby on the panel. A screen reader
   announced "tab, 1 of 2" and then arrow keys did nothing, the interface
   promised a control it had not built. It now shares useTablist with the
   portfolio and news filters, so all three behave identically.

   The green checkmarks that used to sit on these tiles are gone, per the
   client's note. Nothing has replaced them: a logo on a white field with a
   hairline grid is the whole treatment, which is the point.
--------------------------------------------------------------------------- */

export function HomePortfolio() {
  const [active, setActive] = useState<PortfolioStatus>("Active");
  const select = useCallback((status: PortfolioStatus) => setActive(status), []);
  const { register, onKeyDown } = useTablist(STATUSES, select);

  const companies = portfolioSorted.filter(
    (company) => company.portfolioStatus === active,
  );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Portfolio status"
        className="flex gap-8 border-b border-[#cfe0e3]"
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
              id={`home-portfolio-tab-${status.toLowerCase()}`}
              role="tab"
              aria-selected={selected}
              aria-controls="home-portfolio-panel"
              tabIndex={selected ? 0 : -1}
              onKeyDown={(event) => onKeyDown(event, index)}
              onClick={() => select(status)}
              className={`relative shrink-0 py-4 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#006a70] ${
                selected
                  ? "text-[#12394b] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#008e95]"
                  : "text-[#4d626c] hover:text-[#12394b]"
              }`}
            >
              {status}{" "}
              <span className="ml-1 tabular-nums text-[#4d626c]">({count})</span>
            </button>
          );
        })}
      </div>

      <div
        id="home-portfolio-panel"
        role="tabpanel"
        aria-labelledby={`home-portfolio-tab-${active.toLowerCase()}`}
        tabIndex={-1}
        className="grid grid-cols-2 border-l border-t border-[#dbe8ea] sm:grid-cols-3 lg:grid-cols-4"
      >
        <p aria-live="polite" className="sr-only">
          Showing {companies.length} {active === "Exits" ? "exited" : "active"} companies.
        </p>
        {companies.map((company) => (
          <Link
            key={company.slug}
            href={`/portfolio/${company.slug}`}
            aria-label={`View ${company.name}`}
            className="group flex min-h-36 items-center justify-center border-b border-r border-[#dbe8ea] bg-white p-6 transition-colors duration-300 hover:bg-ice sm:min-h-[152px] sm:p-8"
          >
            <span className="relative block h-16 w-full max-w-[190px]">
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                fill
                sizes="(min-width: 1024px) 190px, 40vw"
                className="object-contain object-center transition-transform duration-500 ease-kofa group-hover:scale-[1.04]"
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
