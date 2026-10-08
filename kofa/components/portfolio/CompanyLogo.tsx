import Image from "next/image";
import type { CSSProperties } from "react";
import type { PortfolioCompany } from "@/data/portfolio";

/* ===========================================================================
   COMPANY LOGO
   ---------------------------------------------------------------------------
   Every portfolio logo, everywhere it appears: the /portfolio grid, the
   homepage strip, a company's own page, and the company card under an
   article.

   Logos used to be dropped into one fixed box with object-contain. That
   makes a long wordmark and a square mark the same WIDTH or the same
   HEIGHT, never the same weight: Rivanna's wordmark filled its box while
   Zafrens' square mark sat small in the middle of its box, and CorFlow,
   whose file was a 140px logo on a 150px white square, rendered at a third
   of the width of its neighbours.

   So the files have had their blank margins trimmed (the artwork is
   otherwise untouched), and each logo is drawn at the same AREA instead:
   height = base / sqrt(aspect), which makes width x height = base², capped
   by a maximum width for long wordmarks and a maximum height for square
   marks. It is the usual way a logo wall is balanced by eye, done in CSS
   (.company-logo in app/globals.css) from `logoAspect` in data/portfolio.ts.
   Each call site sets the base and the caps as custom properties, so the
   same rule scales with the card it sits in.

   `width`/`height` below are the largest size the logo is drawn at, which is
   what next/image needs to choose files for 1x and 2x screens; they carry
   the aspect ratio but not the on-screen size.
=========================================================================== */

export function CompanyLogo({
  company,
  className = "",
  priority = false,
  decorative = false,
}: {
  company: Pick<PortfolioCompany, "name" | "logo" | "logoAspect">;
  className?: string;
  priority?: boolean;
  /** Empty alt, for a logo whose link or heading already names the company. */
  decorative?: boolean;
}) {
  const r = company.logoAspect;
  const height = Math.round(Math.min(72, 76 / Math.sqrt(r), 210 / r));
  const width = Math.round(height * r);

  return (
    <Image
      src={company.logo}
      alt={decorative ? "" : `${company.name} logo`}
      width={width}
      height={height}
      priority={priority}
      className={`company-logo ${className}`}
      style={{ "--logo-r": r } as CSSProperties}
    />
  );
}
