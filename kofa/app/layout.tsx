import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/footer/Footer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import {
  MotionPreferenceProvider,
  MOTION_PREFERENCE_SCRIPT,
} from "@/components/motion/MotionPreference";
import { socialMetadata, siteUrl } from "@/lib/metadata";
import { site } from "@/data/site";

/**
 * Display face. Fraunces replaces Instrument Serif.
 *
 * Instrument Serif is a single 400 weight, quite condensed, with didone-ish
 * contrast; at 100px it was elegant but thin, and it gave the page only one
 * lever (size) for display hierarchy. Fraunces is variable on three useful
 * axes, so the same family covers a 100px headline and a 22px card title
 * without either being a compromise:
 *
 *   opsz  optical size, tracked to font-size by the browser. High contrast and
 *         fine hairlines at display sizes, sturdier at text sizes. This is the
 *         axis Instrument Serif did not have and the reason the swap is worth
 *         making at all.
 *   SOFT  rounds the terminals. Held low: this is a healthcare fund, not a
 *         lifestyle brand.
 *   WONK  swaps in the singular italic-ish forms. Off by default; the italic
 *         style turns it on where it belongs.
 *
 * `weight` is deliberately absent. next/font refuses `axes` alongside an
 * explicit weight list ("Axes can only be defined for variable fonts when the
 * weight property is nonexistent or set to `variable`"), and omitting it is
 * what we want anyway: the whole 100-900 range ships in one variable file, so
 * display sizes can sit at 400 and card titles at 500 without a second
 * download.
 */
/**
 * Geist for navigation, body, buttons, labels and metadata; Fraunces
 * kept selective, for display headlines and editorial statements only. Geist
 * ships self-hosted with next/font, so there is no external font request.
 */
const sans = GeistSans;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.intro,
  alternates: { canonical: "/" },
  /*
    The openGraph and twitter blocks are built by lib/metadata.ts, the same as
    every other route's, so that the card image and the identity fields are
    declared in exactly one place. They are not inherited: a child segment's
    openGraph replaces this one outright rather than merging into it, which is
    the whole reason the helper exists. See the comment at the top of
    lib/metadata.ts before hand-writing an openGraph object anywhere.
  */
  ...socialMetadata({
    title: `${site.name} · ${site.tagline}`,
    description: site.intro,
    path: "/",
  }),
  robots: { index: true, follow: true },
};

/** Organization schema, §31. */
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: siteUrl,
  email: site.email,
  foundingDate: String(site.founded),
  description: site.intro,
  sameAs: [] as string[],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={sans.variable}
      /*
        MOTION_PREFERENCE_SCRIPT below stamps data-motion onto
        document.documentElement before <body> renders. It has to run
        pre-paint to do its job, which means <html> already carries an
        attribute React never put there by the time hydration compares the
        two trees. React reports that as "A tree hydrated but some attributes
        of the server rendered HTML didn't match the client properties",
        pointing at <html>, on every single page load.

        suppressHydrationWarning here silences exactly that, and nothing else:
        the flag covers this element's own attributes and does not propagate to
        the tree below, so a genuine mismatch inside <body>, the class of bug
        this warning exists to catch, still shouts. Deleting the script would
        also silence it and would reintroduce the flash of motion it was added
        to prevent; this attribute is the cheaper half of that trade.
      */
      suppressHydrationWarning
    >
      <head>
        {/*
          Entrance animations render their `initial` state into the server HTML,
          so every revealed element ships as opacity:0 and only becomes visible
          once Framer Motion hydrates. If JavaScript fails or is switched off,
          that would leave a blank page over fully-populated markup. This
          un-hides everything carrying data-reveal in exactly that case.
        */}
        <noscript>
          <style>{`[data-reveal],[data-lag]{opacity:1!important;transform:none!important;clip-path:none!important;height:auto!important}`}</style>
        </noscript>

        {/*
          The arrival curtain is gone, and so is its pre-paint flash guard.
          components/motion/Arrival.tsx was the only thing that rendered
          [data-arrival] or wrote the "kofa:arrival" session key, so the guard
          had become an inline script blocking first paint to read a key
          nothing writes, and a [data-arrival] clause in the noscript style
          above matching an element that no longer exists. Both are removed.
          The matching ARRIVAL block in app/globals.css goes with them.
        */}

        {/*
          Motion preference, stamped on <html> before <body> renders so the
          stylesheet is correct on the very first frame. Motion is ON by
          default for everyone; this only reads a choice the visitor made
          earlier through the footer control. See
          components/motion/MotionPreference.tsx.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: MOTION_PREFERENCE_SCRIPT }}
        />
      </head>
      <body className="min-h-dvh bg-white antialiased">
        <script
          type="application/ld+json"
          // Static, author-controlled object, no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <MotionPreferenceProvider>
          <MotionProvider>
            {/*
              Skip link. The header puts seven navigation stops in front of
              the content on every page, and a keyboard visitor had no way
              past them. Off-screen until focused, then it lands over the
              header as a normal control. WCAG 2.4.1.
            */}
            {/*
              Held off-screen by a transform rather than by sr-only /
              focus:not-sr-only. That pairing has to flip five properties at
              once (position, size, clip, overflow, whitespace) and depends on
              two utilities in the same group resolving in the right order;
              this flips one, so there is nothing to get wrong. The element
              stays `fixed`, so it never affects layout whether focused or
              not, and it stays in the accessibility tree either way.
            */}
            <a
              href="#main"
              className="fixed left-6 top-6 z-[60] inline-flex min-h-11 -translate-y-[200%] items-center rounded-sm bg-navy px-5 text-sm font-medium text-white transition-transform duration-200 focus:translate-y-0"
            >
              Skip to content
            </a>
            {/* SmoothScroll first: its mount effect constructs Lenis and puts the
              "lenis" class on <html> before any scroll consumer subscribes, so
              nobody measures a pre-Lenis frame and is then contradicted. */}
            <Navigation />
            {/* tabIndex -1 so the skip link actually moves focus here and not
                just the scroll position; scroll-mt clears the fixed header. */}
            <main id="main" tabIndex={-1} className="scroll-mt-[104px] focus:outline-none">
              {children}
            </main>
            <Footer />
            {/*
              The drawn cursor is OFF. It replaced the OS pointer with two
              rAF-followed bodies, and a pointer that trails your hand by even
              a few frames reads as the whole page lagging, because the pointer
              is the one element a person expects to be exactly where they put
              it. The native cursor has no such budget to blow.

              components/ui/Cursor.tsx has since been deleted outright, along
              with the CUSTOM CURSOR block in app/globals.css that was scoped to
              the `data-kofa-cursor` attribute only that component ever wrote,
              and components/ui/ViewCursor.tsx which depended on the same
              machinery. This is therefore no longer a one-line switch: bringing
              the drawn cursor back means restoring all three from version
              control together. See the tombstone comment in app/globals.css.
            */}
          </MotionProvider>
        </MotionPreferenceProvider>
      </body>
    </html>
  );
}
