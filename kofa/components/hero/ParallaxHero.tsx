import { Container } from "@/components/ui/primitives";
import { Button, TextLink } from "@/components/ui/Button";

const RAIL = [
  { k: "Established", v: "2016" },
  { k: "Structure", v: "Evergreen fund" },
  { k: "Focus", v: "Medical devices" },
];

export function ParallaxHero() {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden pb-[clamp(7rem,10vw,9rem)] pt-[108px]">
      <div aria-hidden className="absolute inset-0 -z-20">
        <div className="bg-grid absolute inset-0 opacity-45 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
        <div className="absolute -right-[18vw] top-[8%] h-[min(72vw,62rem)] w-[min(72vw,62rem)] rounded-full border border-rule-teal" />
        <div className="absolute -right-[7vw] top-[23%] h-[min(48vw,40rem)] w-[min(48vw,40rem)] rounded-full border border-rule" />
        <svg className="absolute inset-y-0 right-0 h-full w-[62%] text-teal/20" viewBox="0 0 900 900" preserveAspectRatio="none">
          <path d="M900 78C650 164 755 324 502 420S252 690 86 865" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M900 224C704 300 758 444 548 520S342 704 250 900" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <Container className="relative">
        <div className="max-w-[70rem]">
          <h1 className="type-display max-w-[14ch] text-ink">Patient Capital for Transformative MedTech</h1>
          <p className="type-body-lg mt-10 max-w-[60ch]">KOFA Healthcare is an evergreen investment fund that invests in early- to mid-stage medical device companies that solve a clear unmet need in high-growth clinical markets. We invest in companies, not single-product opportunities, with a market size typically exceeding $1 billion worldwide.</p>
          <div className="mt-11 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-9">
            <Button href="/portfolio">Explore our portfolio</Button>
            <TextLink href="/our-approach">Our approach</TextLink>
          </div>
        </div>

        <dl className="absolute inset-x-6 -bottom-[6.5rem] flex flex-wrap gap-x-12 gap-y-3 border-t border-rule pt-5 sm:inset-x-8 lg:inset-x-12 xl:inset-x-20">
          {RAIL.map((item) => (
            <div key={item.k} className="flex items-baseline gap-2.5">
              <dt className="type-eyebrow text-ink-mute">{item.k}</dt>
              <dd className="type-eyebrow text-ink">{item.v}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
