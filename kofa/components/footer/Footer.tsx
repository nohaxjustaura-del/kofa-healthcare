import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { MotionToggle } from "@/components/ui/MotionToggle";
import { LogoMark } from "@/components/ui/LogoMark";
import { TextLink } from "@/components/ui/Button";
import { AnimatedDivider } from "@/components/motion/Reveal";
import { nav, site } from "@/data/site";
import { activeCategories } from "@/data/portfolio";

/** Faint scientific line graphic, concentric arcs, drawn as hairlines. */
function FooterLines() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -right-[14%] -top-[38%] h-[190%] w-auto text-teal opacity-[0.13] sm:-right-[6%]"
      viewBox="0 0 600 600"
      fill="none"
    >
      {[110, 168, 226, 284, 342, 400].map((r, i) => (
        <circle
          key={r}
          cx="300"
          cy="300"
          r={r}
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray={i % 2 ? "2 9" : undefined}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <line x1="0" y1="300" x2="600" y2="300" stroke="currentColor" strokeWidth="1" />
      <line x1="300" y1="0" x2="300" y2="600" stroke="currentColor" strokeWidth="1" />
      {[
        [300, 190],
        [358, 300],
        [242, 358],
        [416, 416],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="currentColor" />
      ))}
    </svg>
  );
}

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
    <footer className="relative overflow-hidden border-t border-rule bg-ivory-deep">
      <FooterLines />

      <Container className="relative">
        {/* Closing phrase, the last thing the page says. */}
        <div className="pt-[clamp(4.5rem,9vw,8.5rem)]">
          <p className="type-display max-w-[18ch] text-balance text-ink">
            Advancing global health{" "}
            <span className="accent-italic">through</span> innovation.
          </p>
        </div>

        <AnimatedDivider className="mt-[clamp(4rem,8vw,7rem)]" />

        {/* Directory */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-14 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <LogoMark />
            <p className="type-body-xs mt-5 max-w-[34ch]">
              An evergreen family office venture fund supporting biotech and
              healthcare innovations.
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3 md:col-start-6">
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

          <div className="md:col-span-3">
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
          </div>

          <div className="col-span-2 md:col-span-2">
            <Eyebrow tone="mute" className="mb-5">
              Contact
            </Eyebrow>
            <FooterLink href={`mailto:${site.email}`} external>{site.email}</FooterLink>
            <div className="mt-6">
              <TextLink href="/contact" tone="teal">
                Start a conversation
              </TextLink>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-rule" />

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
