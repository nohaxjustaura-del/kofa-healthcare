"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav } from "@/data/site";
import { LogoMark } from "@/components/ui/LogoMark";

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[104px] border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-6 sm:px-10 lg:px-14">
        <LogoMark size={260} />
        <nav aria-label="Primary" className="hidden items-center gap-6 xl:flex">
          {nav.map((item) => {
            const href = String(item.href);
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`border-b-2 py-2 text-[0.9rem] font-medium tracking-[0.01em] transition-colors ${active ? "border-teal text-teal-deep" : "border-transparent text-slate-700 hover:border-teal hover:text-teal-deep"}`}>{item.label}</Link>;
          })}
        </nav>
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="site-menu" className="inline-flex min-h-11 min-w-11 items-center justify-center border border-slate-300 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-navy xl:hidden">
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav id="site-menu" aria-label="Primary mobile" className="border-t border-slate-200 bg-white px-6 py-5 shadow-lg xl:hidden">
          <ul className="mx-auto grid max-w-[1500px] gap-1 sm:grid-cols-2">
            {nav.map((item) => <li key={item.href}><Link href={item.href} onClick={() => setOpen(false)} className="block border-b border-slate-100 py-3 text-base font-medium text-navy hover:text-teal">{item.label}</Link></li>)}
          </ul>
        </nav>
      )}
    </header>
  );
}
