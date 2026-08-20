import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { MotionToggle } from "@/components/ui/MotionToggle";
import { LogoMark } from "@/components/ui/LogoMark";
import { TextLink } from "@/components/ui/Button";
import { AnimatedDivider } from "@/components/motion/Reveal";
import { Rise } from "@/components/motion/Rise";
import { nav, site } from "@/data/site";
import { activeCategories } from "@/data/portfolio";

/* The concentric-arc graphic that used to sit here (six circles, a full-width
   horizontal and a full-height vertical crossing at their centre, plus four
   seated dots) has been removed. At 190% of the footer's height it put a large
   crosshair behind the directory, and a crosshair is a targeting reticle, not
   a network motif — it read as decoration for its own sake rather than as part
   of the living-network language the rest of the site uses.

   Its removal is also why this file no longer needs `overflow-hidden` on the
   root element: that clip existed solely as a bleed guard for the graphic. */

/**
 * Standalone footer link.
 * Padding lifts the hit area past the 24px WCAG 2.2 minimum; the underline
 * lives on a nested span so it stays welded to the text rather than drifting
 * to the bottom of the padding box.
 */
function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls =
    "group/f -my-1.5 inline-block py-1.5 text-[0.875rem] text-ink-soft transition-colors duration-300 ease-kofa hover:text-teal";
  const inner = (
    <span className="relative">
      {children}
      <span
        aria-hidden
        className="absolute -bottom-[3px] left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-[420ms] ease-kofa group-hover/f:scale-x-100 group-focus-visible/f:scale-x-100"
      />
    </span>
  );

  if (external) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-rule bg-ivory-deep">
      <Container className="relative">
        {/* The closing phrase that used to open the footer — "Advancing global
            health through innovation.", set at `type-display` — has been
            removed.

            CTASection renders immediately above this on every page and already
            ends with a display-size serif statement ("Building something that
            could change healthcare?"), one that carries a button and therefore
            has a job. Two display headlines separated by nothing but a rule
            made the page look like it ended twice, and the second one was the
            weaker of the pair: a restatement of the tagline with nothing to
            act on. The directory below now starts the footer, which is what a
            footer is for.

            With the arc graphic gone too, this element no longer clips, so the
            Rise entrances below have no overflow-hidden ancestor at all. */}
        <AnimatedDivider className="pt-[clamp(3.5rem,6vw,5.5rem)]" />

        {/* Directory.

            All four lean from the same side rather than toward each other.
            The inward lean is for a PAIR, where the two columns are halves of
            one statement and the gesture is the pair closing; this is a
            directory, four peers read left to right, and leaning the outer two
            inward would imply a relationship between the logo block and the
            contact block that is not there. One direction plus a 0.07 stagger
            reads as the row arriving in reading order, which is what it is. */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-14 md:grid-cols-12">
          <Rise from="left" className="col-span-2 md:col-span-4">
            <LogoMark />
            <p className="type-body-xs mt-5 max-w-[34ch]">
              An evergreen family office venture fund supporting biotech and
              healthcare innovations.
            </p>
          </Rise>

          {/* Rise renders div/section/article/li/header/figure/aside and not
              nav, so the landmark stays inside the wrapper instead of becoming
              it. The grid placement moves out to the wrapper so the row is
              laid out exactly as before. */}
          <Rise
            from="left"
            delay={0.07}
            className="md:col-span-3 md:col-start-6"
          >
            <nav aria-label="Footer">
              <Eyebrow tone="mute" className="mb-5">
                Navigate
              </Eyebrow>
              <ul className="space-y-3">
                {nav.map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          </Rise>

          <Rise from="left" delay={0.14} className="md:col-span-3">
            <Eyebrow tone="mute" className="mb-5">
              Focus
            </Eyebrow>
            <ul className="space-y-3">
              {activeCategories.map((cat) => (
                <li key={cat}>
                  <FooterLink href={`/portfolio?category=${encodeURIComponent(cat)}`}>{cat}</FooterLink>
                </li>
              ))}
            </ul>
          </Rise>

          <Rise from="left" delay={0.21} className="col-span-2 md:col-span-2">
            <Eyebrow tone="mute" className="mb-5">
              Contact
            </Eyebrow>
            <FooterLink href={`mailto:${site.email}`} external>{site.email}</FooterLink>
            <div className="mt-6">
              <TextLink href="/contact" tone="teal">
                Start a conversation
              </TextLink>
            </div>
          </Rise>
        </div>

        <div className="h-px w-full bg-rule" />

        {/* No entrance on the legal bar, on purpose. It is chrome rather than
            content, and the row it would animate contains the control for
            switching motion off — a thing that performs on its way in before
            offering to stop things performing. The gesture ends at the rule. */}
        <div className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-eyebrow text-ink-mute">
            © {year} {site.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
            <MotionToggle />
            <Link href="/privacy" className="type-eyebrow -my-2 inline-block py-2 text-ink-mute transition-colors duration-300 ease-kofa hover:text-teal">Privacy Policy</Link>
            {/* LinkedIn intentionally omitted: no profile is published on
                KOFA's current site. Add here once confirmed. */}
          </div>
        </div>
      </Container>
    </footer>
  );
}
