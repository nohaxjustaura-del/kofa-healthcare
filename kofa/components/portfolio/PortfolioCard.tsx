import Image from "next/image";
import Link from "next/link";
import type { PortfolioCompany } from "@/data/portfolio";

/** A logo-led directory tile. Dedicated portfolio browsing intentionally has no media. */
export function PortfolioCard({ company }: { company: PortfolioCompany }) {
  return (
    <Link
      href={`/portfolio/${company.slug}`}
      className="group flex min-h-36 items-center justify-center bg-white p-6 outline-none transition-colors duration-200 hover:bg-[#edf6f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#006a70] sm:min-h-[9.5rem] sm:p-8"
      aria-label={`View ${company.name}`}
    >
      <article className="relative h-10 w-32 sm:h-12 sm:w-40">
          <Image
            src={company.logo}
            alt={`${company.name} logo`}
            fill
            sizes="(max-width: 639px) 128px, 160px"
            className="object-contain"
          />
      </article>
    </Link>
  );
}
