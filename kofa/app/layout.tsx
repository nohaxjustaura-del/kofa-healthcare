import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/footer/Footer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import {
  MotionPreferenceProvider,
  MOTION_PREFERENCE_SCRIPT,
} from "@/components/motion/MotionPreference";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Arrival } from "@/components/motion/Arrival";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
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
const serif = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK"],
  variable: "--font-display-serif",
  display: "swap",
});

/**
 * Geist for navigation, body, buttons, labels and metadata; Instrument Serif
 * kept selective, for display headlines and editorial statements only. Geist
 * ships self-hosted with next/font, so there is no external font request.
 */
const sans = GeistSans;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.intro,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} · ${site.tagline}`,
    description: site.intro,
    url: site.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} · ${site.tagline}`,
    description: site.intro,
  },
  robots: { index: true, follow: true },
};

/** Organization schema, §31. */
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
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
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
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
      <body className="min-h-dvh bg-ivory antialiased">
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
            <SmoothScroll />
            <ScrollProgress />
            <Arrival />
            <Navigation />
            <main id="main">{children}</main>
            <Footer />
            {/*
              The drawn cursor is OFF. It replaced the OS pointer with two
              rAF-followed bodies, and a pointer that trails your hand by even
              a few frames reads as the whole page lagging, because the pointer
              is the one element a person expects to be exactly where they put
              it. The native cursor has no such budget to blow.

              Removing this line is the entire switch: components/ui/Cursor.tsx
              is what stamps `data-kofa-cursor` on <html>, and every rule in the
              CUSTOM CURSOR block of app/globals.css is scoped to that
              attribute, so all of it is inert with the component unmounted.
              Put `<Cursor />` back here to re-enable.
            */}
          </MotionProvider>
        </MotionPreferenceProvider>
      </body>
    </html>
  );
}
