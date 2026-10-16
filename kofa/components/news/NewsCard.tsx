import Link from "next/link";
import { formatNewsDate, type NewsItem } from "@/data/news";
import { getCompany } from "@/data/portfolio";
import { getSiteContent } from "@/lib/site-content";
import { CompanyVisual } from "@/components/portfolio/CompanyVisual";
import { Arrow } from "@/components/ui/Arrow";

/* ===========================================================================
   NEWS CARD
   ---------------------------------------------------------------------------
   Three shapes from one component:
     feature, a lead item with a generated visual
     stack  , the typographic rows that sit beside a feature
     row    , a full-width row for index listings

   No item invents photography. Where there is no supplied hero image the card
   stays purely typographic, which the brief prefers to fake imagery, and
   which, at this scale of headline, reads better anyway.
=========================================================================== */

async function Kicker({ item }: { item: NewsItem }) {
  const { companies } = await getSiteContent();
  const company = item.company ? getCompany(item.company, companies) : undefined;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="type-eyebrow text-teal-deep">
        {company ? company.name : "KOFA Healthcare"}
      </span>
      {item.source && (
        <>
          <span aria-hidden className="h-2.5 w-px bg-rule" />
          <span className="type-eyebrow text-ink-soft">{item.source}</span>
        </>
      )}
    </div>
  );
}

export async function NewsCard({
  item,
  variant = "stack",
}: {
  item: NewsItem;
  variant?: "feature" | "stack" | "row";
}) {
  const { companies } = await getSiteContent();
  const company = item.company ? getCompany(item.company, companies) : undefined;
  const href = `/news/${item.slug}`;

  if (variant === "feature") {
    return (
      <Link href={href} className="group/news block">
        <article>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] border border-rule-soft transition-colors duration-[400ms] ease-kofa group-hover/news:border-rule-teal">
            <div className="absolute inset-0 transition-transform duration-[900ms] ease-kofa group-hover/news:scale-[1.03]">
              {company ? (
                <CompanyVisual
                  slug={company.slug}
                  category={company.category}
                  name={company.name}
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(140deg,#ffffff_0%,#e4f0f1_100%)]" />
              )}
            </div>
          </div>

          <div className="pt-7">
            <Kicker item={item} />
            <h3 className="type-statement mt-4 max-w-[24ch] text-ink transition-transform duration-[400ms] ease-kofa group-hover/news:-translate-y-0.5">
              {item.title}
            </h3>
            <p className="type-body-sm mt-4 max-w-[54ch]">
              {item.excerpt}
            </p>
            <div className="mt-6 flex items-center justify-between">
              <time
                dateTime={item.date}
                className="type-eyebrow text-ink-soft"
              >
                {formatNewsDate(item.date)}
              </time>
              <span className="text-ink-mute transition-all duration-[400ms] ease-kofa group-hover/news:translate-x-1 group-hover/news:-translate-y-1 group-hover/news:text-teal-deep">
                <Arrow size={16} dir="up-right" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  /* --- typographic variants --- */
  const isRow = variant === "row";

  return (
    <Link
      href={href}
      className="group/news block border-t border-rule transition-colors duration-[400ms] ease-kofa hover:border-rule-teal"
    >
      <article className={isRow ? "py-8 md:py-9" : "py-7"}>
        <div
          className={
            isRow
              ? "grid grid-cols-12 items-baseline gap-x-0 gap-y-3 md:gap-x-6"
              : "block"
          }
        >
          <div className={isRow ? "col-span-12 md:col-span-3" : ""}>
            <Kicker item={item} />
          </div>

          <div className={isRow ? "col-span-12 md:col-span-7" : "mt-3.5"}>
            <h3
              className={`${
                isRow
                  ? "text-[1.1875rem] leading-[1.3] md:text-[1.3125rem]"
                  : "text-[1.0625rem] leading-[1.34]"
              } max-w-[46ch] font-serif tracking-[-0.012em] text-ink transition-transform duration-[400ms] ease-kofa group-hover/news:-translate-y-0.5`}
            >
              {item.title}
            </h3>
            {isRow && (
              <p className="type-body-xs mt-3 max-w-[62ch]">
                {item.excerpt}
              </p>
            )}
          </div>

          <div
            className={
              isRow
                ? "col-span-12 flex items-center justify-between md:col-span-2 md:justify-end md:gap-5"
                : "mt-4 flex items-center justify-between"
            }
          >
            <time dateTime={item.date} className="type-eyebrow text-ink-soft">
              {formatNewsDate(item.date)}
            </time>
            <span className="text-ink-mute transition-all duration-[400ms] ease-kofa group-hover/news:translate-x-1 group-hover/news:-translate-y-1 group-hover/news:text-teal-deep">
              <Arrow size={15} dir="up-right" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
