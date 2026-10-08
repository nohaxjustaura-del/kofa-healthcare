import Link from "next/link";
import type { PortfolioCompany } from "@/data/portfolio";
import { CompanyLogo } from "./CompanyLogo";

/** A logo-led directory tile. Dedicated portfolio browsing intentionally has
 *  no media. The logo is sized by area (see CompanyLogo.tsx); the custom
 *  properties below set its base size and caps for this tile.
 *
 *  Hovering (or keyboard-focusing) a tile swaps the logo for the company's
 *  name and one-line summary, so a visitor can tell what each company does
 *  without opening it. The summary is `shortDescription`, the same line the
 *  company page and its meta description use. The swap is CSS only
 *  (.portfolio-tile in app/globals.css) and is limited to devices that can
 *  hover, so a tap on a phone still goes straight to the company page. The
 *  text is always in the accessibility tree, so the link's name is the
 *  company and what it does. */
export function PortfolioCard({ company }: { company: PortfolioCompany }) {
  return (
    <Link
      href={`/portfolio/${company.slug}`}
      className="portfolio-tile group relative flex min-h-36 items-center justify-center overflow-hidden bg-white p-6 outline-none transition-colors duration-200 [--logo-base:3.1rem] [--logo-max-h:2.75rem] [--logo-max-w:7.5rem] hover:bg-[#edf6f7] focus-visible:bg-[#edf6f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#006a70] sm:min-h-[9.5rem] sm:p-8 sm:[--logo-base:4.25rem] sm:[--logo-max-h:4rem] sm:[--logo-max-w:10rem]"
    >
      <span className="portfolio-tile__logo flex items-center justify-center">
        <CompanyLogo company={company} decorative />
      </span>
      <span className="portfolio-tile__blurb absolute inset-0 flex flex-col justify-center gap-2 p-4 sm:p-6">
        <span className="type-eyebrow text-teal-deep">{company.name}</span>
        <span className="portfolio-tile__summary text-ink">
          {company.shortDescription}
        </span>
      </span>
    </Link>
  );
}
