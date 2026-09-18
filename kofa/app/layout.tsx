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
        Two of the scripts below stamp attributes onto document.documentElement
        before <body> renders: the arrival guard writes data-arrival-seen, and
        MOTION_PREFERENCE_SCRIPT writes data-motion. Both have to run pre-paint
        to do their job, which means <html> already carries attributes React
        never put there by the time hydration compares the two trees. React
        reports that as "A tree hydrated but some attributes of the server
        rendered HTML didn't match the client properties", pointing at <html>,
        on every single page load.

        suppressHydrationWarning here silences exactly that, and nothing else:
        the flag covers this element's own attributes and does not propagate to
        the tree below, so a genuine mismatch inside <body> — the class of bug
        this warning exists to catch — still shouts. Deleting the scripts would
        also silence it and would reintroduce the flash of motion and the
        repeat-visit curtain flash they were added to prevent; this attribute
        is the cheaper half of that trade.
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
          <style>{`[data-reveal],[data-lag]{opacity:1!important;transform:none!important;clip-path:none!important;height:auto!important}[data-arrival]{display:none!important}`}</style>
        </noscript>

        {/*
          Repeat-visit flash guard for the arrival curtain. The curtain ships in
          the server HTML and is only taken away once React hydrates, which on a
          repeat visit is long enough after first paint to read as a flash. This
          runs before <body> renders and stamps the decision onto <html>, so on
          visits 2..n the curtain is display:none from the very first paint.
          The session flag is *written* by components/motion/Arrival.tsx; this
          only reads it, so a first visit is unaffected. The key string must stay
          in sync with SESSION_KEY there.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("kofa:arrival")==="1")document.documentElement.setAttribute("data-arrival-seen","")}catch(e){}`,
          }}
        />

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
            {/* SmoothScroll first: its mount effect constructs Lenis and puts the
              "lenis" class on <html> before any scroll consumer subscribes, so
              nobody measures a pre-Lenis frame and is then contradicted. */}
            <Navigation />
            <main id="main">{children}</main>
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
