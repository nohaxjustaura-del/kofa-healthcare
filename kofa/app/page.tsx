import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomePortfolio } from "@/components/home/HomePortfolio";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} · ${site.tagline}`,
  description: site.intro,
  alternates: { canonical: "/" },
};

const focusAreas = [
  { title: "Cardiovascular Innovation", body: "We invest in differentiated technologies across structural heart, electrophysiology, minimally invasive intervention and other high-growth areas.", icon: "heart" },
  { title: "Advancing Women’s Health", body: "We invest across gynecology, maternal health, reproductive care and conditions that uniquely or disproportionately affect women.", icon: "care" },
  { title: "Beyond Our Core", body: "The most important innovations do not always fit neatly into a category. We remain open to exceptional opportunities across other clinical specialties.", icon: "path" },
] as const;

function FocusIcon({ type }: { type: (typeof focusAreas)[number]["icon"] }) {
  if (type === "heart") return <svg viewBox="0 0 72 72" aria-hidden className="focus-area-panel__icon fill-none stroke-teal stroke-[1.5]"><path d="M12 39h14l6-16 9 31 7-15h12" /><path d="M20 18c8-8 19 1 16 10-3-9 8-18 16-10 8 9-16 28-16 28S12 27 20 18Z" /></svg>;
  if (type === "care") return <svg viewBox="0 0 72 72" aria-hidden className="focus-area-panel__icon fill-none stroke-teal stroke-[1.5]"><path d="M36 13v46M13 36h46" /><circle cx="36" cy="36" r="20" /><path d="M27 42c5-11 13-11 18 0" /></svg>;
  return <svg viewBox="0 0 72 72" aria-hidden className="focus-area-panel__icon fill-none stroke-teal stroke-[1.5]"><path d="M13 55 29 39l10 8 20-23" /><path d="M46 24h13v13" /><circle cx="18" cy="55" r="4" /><circle cx="59" cy="24" r="4" /></svg>;
}

export default function Home() {
  return (
    <>
      <section className="relative mt-[104px] overflow-hidden bg-navy pb-24 text-white lg:min-h-[560px] lg:pt-20">
        <div className="relative h-[260px] sm:h-[360px] lg:absolute lg:inset-0 lg:h-auto">
          <Image src="/media/home/clinical-collaboration.png" alt="Illustrative scene of two clinicians reviewing a laptop" fill priority sizes="100vw" className="pointer-events-none object-cover object-right-top lg:object-top" />
        </div>
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(7,52,73,.96)_0%,rgba(7,52,73,.86)_40%,rgba(7,52,73,.18)_62%,transparent_100%)] lg:block" />
        <div className="relative mx-auto grid max-w-[1500px] px-6 pt-9 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-14 lg:pt-0">
          <div className="max-w-[650px]">
            <h1 className="text-balance text-[clamp(2.85rem,4.25vw,3.5rem)] font-normal leading-[1.1] tracking-[-0.035em]">Patient Capital for Transformative MedTech</h1>
            <p className="mt-7 max-w-[560px] border-l-2 border-teal pl-6 text-[1.125rem] leading-8 text-white/90">KOFA Healthcare is an evergreen investment fund that invests in early- to mid-stage medical device companies that solve a clear unmet need in high growth clinical markets. We invest in companies, not single product opportunities with a market size typically $1B + worldwide.</p>
          </div>
        </div>
        <div aria-hidden className="absolute -bottom-10 left-[-6%] h-20 w-[75%] rounded-[50%] border-t border-white bg-white" />
        <div aria-hidden className="absolute -bottom-7 left-[35%] h-14 w-[70%] rounded-[50%] border-t border-teal bg-white" />
      </section>

      <section id="portfolio" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
          <div className="grid gap-10 border-b border-slate-200 pb-14 lg:grid-cols-[.95fr_1fr] lg:items-center lg:gap-20">
            <div className="relative mx-auto aspect-square w-full max-w-[380px] overflow-hidden rounded-full border border-teal/30 p-2">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image src="/media/home/device-research.png" alt="Illustrative scene of a researcher examining a precision device" fill sizes="(min-width: 640px) 380px, 85vw" className="object-cover object-center" />
              </div>
            </div>
            <div>
            <h2 className="text-[clamp(2rem,3.1vw,2.5rem)] font-normal leading-tight tracking-[-0.028em] text-navy">Backing the Devices That Change Care</h2>
            <p className="mt-7 max-w-[53ch] text-base leading-7 text-slate-600">We strive to invest in companies with proven medtech founders that have experienced teams in technologies that will both improve patient outcomes and reduce healthcare costs.</p>
            </div>
          </div>
          <div className="mt-10"><HomePortfolio /></div>
          <Link href="/portfolio" className="mt-8 inline-flex border-b border-teal pb-1 text-sm font-medium text-teal-deep">View all portfolio companies</Link>
        </div>
      </section>

      <section id="focus-areas" className="bg-ice py-20 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-8 border-b border-slate-300 pb-10">
            <div>
            <h2 className="text-[clamp(2rem,3.1vw,2.5rem)] font-normal leading-tight tracking-[-0.028em] text-navy">Focus Areas</h2>
              <Link href="/focus-areas" className="mt-6 inline-flex border-b border-teal pb-1 text-sm font-medium text-teal-deep">Explore our focus areas</Link>
            </div>
            <div className="relative mx-auto aspect-square w-56 shrink-0 overflow-hidden rounded-full border border-teal/30 p-2 sm:mx-0">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image src="/media/home/healthy-longevity.png" alt="Illustrative scene of two older women enjoying a walk outdoors" fill sizes="224px" className="object-cover object-center" />
              </div>
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
            {focusAreas.map((area) => <article key={area.title} data-focus={area.icon} className="focus-area-panel">
              <div className="focus-area-panel__visual"><FocusIcon type={area.icon} /></div>
              <span aria-hidden className="focus-area-panel__rule" />
              <h3 className="mt-6 text-xl font-medium tracking-[-0.02em] text-navy">{area.title}</h3>
              <p className="mt-4 text-[0.95rem] leading-7 text-slate-600">{area.body}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-teal py-20 text-white sm:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 sm:px-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div><h2 className="max-w-[17ch] text-[clamp(2.4rem,4vw,3.5rem)] font-normal leading-[1.1] tracking-[-0.032em]">Building the Next Breakthrough in MedTech?</h2><p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-7 text-white/90">If you are developing a differentiated medical device for a significant unmet clinical need, let’s start a conversation.</p></div>
          <div className="lg:justify-self-end"><a href={`mailto:${site.email}`} className="inline-flex border border-white px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-teal">Connect With KOFA Healthcare</a><p className="mt-4 text-sm text-white/80">{site.email}</p></div>
        </div>
      </section>
    </>
  );
}
