import Link from "next/link";
import { nav, site } from "@/data/site";
import { LogoMark } from "@/components/ui/LogoMark";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1.35fr_1fr_1fr] lg:px-14">
        <div>
          <LogoMark size={92} />
          <p className="mt-5 max-w-[38ch] text-sm leading-6 text-slate-600">Patient capital for early- to mid-stage medical device companies addressing significant unmet clinical needs.</p>
        </div>
        <nav aria-label="Footer navigation">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Explore</p>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm text-navy">
            {nav.map((item) => <li key={item.href}><Link className="hover:text-teal" href={item.href}>{item.label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Contact</p>
          <a className="text-sm font-medium text-teal-deep underline underline-offset-4" href={`mailto:${site.email}`}>{site.email}</a>
          <p className="mt-8 text-xs text-slate-500">© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
