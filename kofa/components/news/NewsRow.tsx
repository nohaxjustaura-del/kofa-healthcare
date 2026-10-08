import Link from "next/link";
import { formatNewsDate, type NewsItem } from "@/data/news";
import { getCompany } from "@/data/portfolio";

/* One row of the /news index. A server component: the index's client code
   (components/news/NewsBrowser.tsx) only filters rows, it never renders
   them, so none of this text travels to the browser as JavaScript.

   `data-type` is what the filter's stylesheet rules key on. The excerpt is
   clamped to three lines here; the article page carries it in full. */
export function NewsRow({ item }: { item: NewsItem }) {
  const company = item.company ? getCompany(item.company) : undefined;
  return (
    <li
      className="news-row"
      data-type={item.type === "KOFA News" ? "kofa" : "portfolio"}
    >
      <Link
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
          <p className="mt-3 line-clamp-3 max-w-[72ch] text-[0.9375rem] leading-6 text-[#4d626c]">
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
    </li>
  );
}
