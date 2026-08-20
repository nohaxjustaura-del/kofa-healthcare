import Link from "next/link";
import Image from "next/image";
import type { PortfolioCompany } from "@/data/portfolio";
import { CompanyVisual } from "./CompanyVisual";
import { Arrow } from "@/components/ui/Arrow";

/* ===========================================================================
   PORTFOLIO CARD
   ---------------------------------------------------------------------------
   One tile, three sizes. Everything moves on the same 400ms curve so the whole
   grid reacts as one material rather than as a set of independent widgets.

   On hover: ground warms, visual scales 1.03, logo lifts 3px and takes on its
   own colour, description lifts 4px, arrow travels up-right, and a hairline
   draws across the bottom edge.
=========================================================================== */

const RATIO = {
  feature: "aspect-[16/11]",
  standard: "aspect-[4/3]",
  compact: "aspect-[3/2]",
} as const;

const NAME_SIZE = {
  feature: "type-statement",
  standard: "text-[1.375rem] leading-[1.2] tracking-[-0.017em]",
  compact: "text-[1.1875rem] leading-[1.25] tracking-[-0.015em]",
} as const;

export function PortfolioCard({
  company,
  size = "standard",
  index,
  total,
  priority = false,
}: {
  company: PortfolioCompany;
  size?: keyof typeof RATIO;
  index?: number;
  total?: number;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/portfolio/${company.slug}`}
      className="group/card block focus-visible:outline-none"
      aria-label={`${company.name}, ${company.category}`}
    >
      <article className="relative">
        {/* --- visual --- */}
        <div
          className={`relative overflow-hidden rounded-[10px] border border-rule-soft ${RATIO[size]}`}
        >
          <div className="absolute inset-0 transition-transform duration-[900ms] ease-kofa group-hover/card:scale-[1.035]">
            <CompanyVisual
              slug={company.slug}
              category={company.category}
              featuredImage={company.featuredImage}
              name={company.name}
              priority={priority}
            />
          </div>

          {/* ground warms very slightly on hover */}
          <div className="absolute inset-0 bg-teal/0 transition-colors duration-[400ms] ease-kofa group-hover/card:bg-teal/[0.045]" />

          {company.status && (
            <span className="type-eyebrow absolute left-4 top-4 rounded-[4px] bg-[rgba(247,248,244,0.9)] px-2.5 py-1.5 text-ink-soft backdrop-blur-sm">
              {company.status}
            </span>
          )}

          {index !== undefined && total !== undefined && (
            <span className="type-eyebrow absolute right-4 top-4 tabular-nums text-ink-mute opacity-0 transition-opacity duration-[400ms] ease-kofa group-hover/card:opacity-100">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          )}
        </div>

        {/* --- content --- */}
        <div className="pt-6">
          {/* Logo, lifts and regains its colour on hover */}
          <div className="relative h-[26px] w-[132px] transition-transform duration-[400ms] ease-kofa group-hover/card:-translate-y-[3px]">
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              fill
              sizes="132px"
              className="logo-mono object-contain object-left"
            />
          </div>

          <div className="mt-5 flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="type-eyebrow text-teal">{company.category}</p>
              <h3
                className={`${NAME_SIZE[size]} mt-2.5 font-serif text-ink transition-colors duration-[400ms] ease-kofa`}
              >
                {company.name}
              </h3>
            </div>

            <span className="mt-1 shrink-0 text-ink-mute transition-all duration-[400ms] ease-kofa group-hover/card:translate-x-1 group-hover/card:-translate-y-1 group-hover/card:text-teal">
              <Arrow size={17} dir="up-right" />
            </span>
          </div>

          <p className="type-body-sm mt-3.5 max-w-[46ch] transition-transform duration-[400ms] ease-kofa group-hover/card:-translate-y-1">
            {company.shortDescription}
          </p>
        </div>

        {/* --- hairline draws across the bottom --- */}
        <div className="relative mt-7 h-px w-full bg-rule">
          <span className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-teal transition-transform duration-[600ms] ease-kofa group-hover/card:scale-x-100 group-focus-visible/card:scale-x-100" />
        </div>
      </article>
    </Link>
  );
}
