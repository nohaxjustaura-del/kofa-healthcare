import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/footer/Footer";
import {
  MotionPreferenceProvider,
  MOTION_PREFERENCE_SCRIPT,
} from "@/components/motion/MotionPreference";
import { socialMetadata, siteUrl } from "@/lib/metadata";
import { site } from "@/data/site";

/**
 * TYPE.
 *
 * There is no next/font call here any more, and that is deliberate.
 *
 * The site is set in General Sans, standing in for OrbiMed's Graphik until
 * KOFA licenses the real thing. The same ITF Free Font Licence that makes
 * General Sans free also forbids subsetting and format conversion, and
 * next/font's whole value is that it does both. So the official woff2 files
 * are served verbatim from public/fonts/general-sans and declared by hand at
 * the top of app/globals.css, which is also where the note on swapping in
 * Graphik lives.
 *
 * The practical consequence: no font variable is stamped onto <html> below.
 * globals.css sets font-family on <body> from --font-sans instead, so the
 * family is declared in exactly one place.
 */

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

/* The header is white on every page, so the phone's browser chrome is too. */
export const viewport: Viewport = {
  themeColor: "#ffffff",
};

/** Organization schema, §31. */
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: siteUrl,
  logo: `${siteUrl}/brand/kofa-lockup.png`,
  email: site.email,
  foundingDate: String(site.founded),
  description: site.intro,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
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
          The three weights on screen before anything else: Light carries
          every heading, Regular every paragraph, Medium the navigation and
          every button. Because the faces are declared in a hand-written
          @font-face block rather than through next/font, the browser would
          not discover them until it had parsed the stylesheet and matched a
          rule, which on a cold load is well after first paint; Medium used
          to arrive late enough that the header visibly swapped typefaces.
          Italic and Semibold are used sparsely enough that font-display:swap
          covers them.
        */}
        <link
          rel="preload"
          href="/fonts/general-sans/GeneralSans-Light.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/general-sans/GeneralSans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/general-sans/GeneralSans-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/*
          Motion preference, stamped on <html> before <body> renders so the
          stylesheet is correct on the very first frame. Motion is ON by
          default for everyone; this only reads a choice the visitor made
          earlier through the footer control. See
          components/motion/MotionPreference.tsx.

          Nothing on the site is rendered hidden waiting for JavaScript, so
          there is no <noscript> escape hatch any more: the entrances only
          ever hide an element that is already off screen, after hydration
          (components/motion/useEnter.ts).
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
          {/*
            Skip link. The header puts seven navigation stops in front of
            the content on every page, and a keyboard visitor had no way
            past them. Off-screen until focused, then it lands over the
            header as a normal control. WCAG 2.4.1.

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
          <Navigation />
          {/* tabIndex -1 so the skip link actually moves focus here and not
              just the scroll position; scroll-mt clears the fixed header. */}
          <main id="main" tabIndex={-1} className="scroll-mt-[104px] focus:outline-none">
            {children}
          </main>
          <Footer />
        </MotionPreferenceProvider>
      </body>
    </html>
  );
}
