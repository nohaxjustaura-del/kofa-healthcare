import type { ReactNode } from "react";
import { Container } from "@/components/ui/primitives";

export function PageHero({ eyebrow, lines, intro, meta, aside }: { eyebrow: string; lines: ReactNode[]; intro?: ReactNode; meta?: { k: string; v: string }[]; aside?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-teal pb-16 pt-[164px] text-white sm:pb-20">
      <svg aria-hidden viewBox="0 0 640 330" className="absolute right-0 top-[104px] hidden h-[330px] w-[42%] fill-none stroke-white/25 lg:block">
        <path d="M55 298 230 118l88 92L525 0M0 165h405M318 210h260M525 0v245" />
        <path d="M182 298h255M230 118V0" className="stroke-white/15" />
      </svg>
      <Container className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white">{eyebrow}</p>
        <div className="mt-7 grid gap-9 lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,.72fr)] lg:items-end">
          <h1 className="max-w-[19ch] text-balance text-[clamp(2.7rem,4.25vw,3.4rem)] font-normal leading-[1.1] tracking-[-0.032em]">{lines.map((line, index) => <span key={index} className="block">{line}</span>)}</h1>
          {(intro || aside) && <div className="border-l border-white/60 pl-6 text-[1.0625rem] leading-7 text-white/90">{intro}{aside}</div>}
        </div>
        {meta && meta.length > 0 && <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/35 pt-5 text-sm text-white/90">{meta.map((item) => <div key={item.k}><dt className="inline text-white/65">{item.k}: </dt><dd className="inline font-medium">{item.v}</dd></div>)}</dl>}
      </Container>
      <div aria-hidden className="absolute -bottom-9 left-[-5%] h-16 w-[78%] rounded-[50%] border-t border-white bg-white" />
      <div aria-hidden className="absolute -bottom-7 left-[36%] h-12 w-[70%] rounded-[50%] border-t border-white/75" />
    </section>
  );
}
