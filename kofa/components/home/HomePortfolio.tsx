"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { portfolioSorted, type PortfolioStatus } from "@/data/portfolio";

const states: PortfolioStatus[] = ["Active", "Exits"];

export function HomePortfolio() {
  const [status, setStatus] = useState<PortfolioStatus>("Active");
  const companies = portfolioSorted.filter((company) => company.portfolioStatus === status);

  return (
    <div>
      <div role="tablist" aria-label="Portfolio status" className="flex gap-7 border-b border-slate-200">
        {states.map((item) => {
          const selected = item === status;
          const count = portfolioSorted.filter((company) => company.portfolioStatus === item).length;
          return <button key={item} role="tab" aria-selected={selected} aria-controls="home-portfolio-panel" onClick={() => setStatus(item)} className={`border-b-2 px-1 pb-4 text-sm font-medium ${selected ? "border-teal text-teal" : "border-transparent text-slate-500 hover:text-navy"}`}>{item} <span className="ml-1 text-xs">{count}</span></button>;
        })}
      </div>
      <div id="home-portfolio-panel" role="tabpanel" className="grid grid-cols-2 border-l border-t border-slate-200 sm:grid-cols-3 lg:grid-cols-4">
        {companies.map((company) => (
          <Link key={company.slug} href={`/portfolio/${company.slug}`} aria-label={`View ${company.name}`} className="group flex min-h-36 items-center justify-center border-b border-r border-slate-200 bg-white p-6 transition-colors hover:bg-ice sm:min-h-[152px] sm:p-8">
            <span className="relative block h-16 w-full max-w-[190px]"><Image src={company.logo} alt={`${company.name} logo`} fill sizes="(min-width: 1024px) 190px, 40vw" className="object-contain object-center transition-transform duration-300 group-hover:scale-[1.03]" /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
