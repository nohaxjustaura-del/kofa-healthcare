import Link from "next/link";
import { nav, site } from "@/data/site";
import { LogoMark } from "@/components/ui/LogoMark";
import { MEASURE } from "@/components/ui/primitives";

/* ---------------------------------------------------------------------------
   FOOTER
   ---------------------------------------------------------------------------
   Sits on the same measure as the header and every page body, so the mark at
   the bottom of the page lines up with the mark at the top of it.

   The seven primary links are repeated here deliberately. Google assembles
   sitelinks from the pages it can reach and understand, and a footer link on
   every page is the strongest internal signal a small site can give for the
   six the client wants surfaced: About, Focus Areas, Team, Portfolio, Our
   Approach and News. Selection is still Google's; this is the part we control.
--------------------------------------------------------------------------- */

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className={`${MEASURE} py-16`}>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          <div>
            <LogoMark size={56} />
            <p className="mt-6 max-w-[38ch] text-sm leading-6 text-slate-600">
              Patient capital for early- to mid-stage medical device companies
              addressing significant unmet clinical needs.
            </p>
          </div>

          <nav aria-labelledby="footer-explore">
            <p
              id="footer-explore"
              className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
            >
              Explore
            </p>
            {/* gap-y-2 rather than gap-y-3.5: the links below now carry
                py-1.5 of their own, so the visual spacing between rows is
                unchanged while the hit areas no longer touch. */}
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-navy">
              {nav.map((item) => (
                <li key={item.href}>
                  {/* inline-block + py-1.5 lifts the target from 18px to 30px
                      tall, clearing the 24px floor in WCAG 2.2 SC 2.5.8.
                      These are seven standalone navigation links stacked in a
                      list, not links inline in a sentence, so the "inline"
                      exception to that criterion does not cover them — and at
                      18px on a phone they were the hardest thing on the site
                      to hit. Same technique and the same reasoning as
                      TextLink in components/ui/Button.tsx; see the note there.
                      The negative margin is absent here because the row gap
                      above was reduced to pay for the padding instead, which
                      keeps the two columns aligned. */}
                  <Link
                    className="inline-block py-1.5 transition-colors hover:text-teal-deep"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Contact
            </p>
            {/* -my-1.5 keeps the address optically where it was while py-1.5
                gives it a 30px target. WCAG 2.2 SC 2.5.8, as above. */}
            <a
              className="-my-1.5 inline-block py-1.5 text-sm font-medium text-teal-deep underline decoration-teal/40 underline-offset-4 transition-colors hover:decoration-teal"
              href={`mailto:${site.email}`}
            >
              {site.email}
            </a>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Boston and the San Francisco Bay Area
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          {/* The smallest target on the site at 16px tall before this.
              WCAG 2.2 SC 2.5.8, as above. */}
          <Link
            href="/privacy"
            className="-my-2 inline-block py-2 text-xs text-slate-500 transition-colors hover:text-teal-deep"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
