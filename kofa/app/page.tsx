import type { Metadata } from "next";
import Image from "next/image";
import { PartnerMarquee } from "@/components/portfolio/PartnerMarquee";
import { CTASection } from "@/components/ui/CTASection";
import { Button, TextLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/primitives";
import { FocusGlyph } from "@/components/visuals/plates";
import { focusAreas, site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} · ${site.tagline}`,
  description: site.intro,
  alternates: { canonical: "/" },
};

/* ---------------------------------------------------------------------------
   HOMEPAGE
   ---------------------------------------------------------------------------
   Four sections, in this order: Home, Portfolio, Focus Areas, Contact. That
   is the shape the September brief fixes
   (docs/website-refresh-2026-09-15.md), and the same brief records that Our
   Conviction and Portfolio Stories were taken OFF this page. So nothing new
   is bolted on here — no latest-news strip, no statistics band, no team
   teaser. Anything that wants to be on the homepage has to displace one of
   the four, which is the client's call and not a build decision.

   PHOTOGRAPHY. The three images here are real photographs, which is a
   correction rather than a preference: the previous set was generated, and
   the client's note on it was one line — "the pictures look AI". They were.
   Generated people have a particular plastic quality around skin and hair
   that reads as fake to anyone who looks twice, and on a page whose whole
   job is to make a fund look credible that is not a small problem.

   What replaced them, and why each one:

     hero-lab-research.jpg     a researcher at a bench, photographed for
                               ThisisEngineering (the Royal Academy of
                               Engineering's campaign). Subject right of
                               centre, equipment filling the left, which is
                               exactly the shape this hero needs.
     portfolio-microscope.jpg  a gloved hand setting a dish under a
                               microscope. This is the same photograph
                               already running on kofahealthcare.com, so it
                               is the one image on the page KOFA has
                               already approved in another context.
     focus-clinician.jpg       a clinician with a stethoscope. High-key and
                               bright, which is what the pale Focus Areas
                               ground wants; a darker operating-theatre
                               frame was tried first and fought the band.

   All three are Unsplash, whose licence grants commercial use with no
   attribution required, and all three were uploaded before 2022 — that
   cutoff was the selection rule, because Unsplash has since filled with
   generated images and the point of this exercise was to stop shipping
   them. Provenance is recorded in public/media/CREDITS.md.

   The three Focus cards keep the shared SVG FocusGlyph icons.

   The type scale changed too. This page used to set every heading with its own
   one-off `text-[clamp(...)]` while the other eight pages used the scale in
   app/globals.css. Two type systems on one site read as two templates stitched
   together, and the homepage is the page most people judge it by. Headings
   here are now .type-display-sm and .type-section, which is the same ladder
   CTASection and PageHero sit on.
--------------------------------------------------------------------------- */

export default function Home() {
  return (
    <>
      {/* --- Home ---------------------------------------------------------
          mt-[104px] clears the fixed header. That height is load-bearing and
          is declared in components/navigation/Navigation.tsx; the interior
          pages clear the same band with padding instead, because their teal
          ground runs up behind it. */}
      <section className="relative isolate mt-[104px] overflow-hidden bg-navy text-white">
        <div className="relative h-[250px] sm:h-[320px] lg:absolute lg:inset-0 lg:h-auto">
          <Image
            src="/media/home/hero-lab-research.jpg"
            alt=""
            fill
            priority
            quality={90}
            sizes="100vw"
            /* 72% across, vertically centred. The researcher stands just
               right of centre in this frame and the bench fills the left,
               which is what the navy gradient and the headline sit over.
               `top` was right for the previous image and is wrong for this
               one: on a wide desktop hero the crop is about 2.9:1 against a
               2.25:1 file, so anchoring to the top would shave her off the
               bottom of the band. */
            className="object-cover object-[72%_center]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(7,52,73,0.97)_0%,rgba(7,52,73,0.92)_42%,rgba(7,52,73,0.5)_66%,rgba(7,52,73,0.08)_100%)] lg:block"
          />
        </div>

        <Container className="relative py-[clamp(3.5rem,7vw,6.5rem)]">
          <div className="max-w-[54rem] lg:max-w-[38rem] xl:max-w-[44rem]">
            <h1 className="type-display-sm text-balance">{site.tagline}</h1>

            {/* The rule is the one piece of ornament in the hero, and it is
                the same gesture the interior page headers use to set off
                their standfirst.

                aqua, not teal. --color-teal is the site accent and is tuned
                against the pale grounds it sits on everywhere else; on this
                navy it measures 3.1:1 and the gesture all but disappears.
                --color-aqua is the palette's light teal and makes 5.3:1 on
                the same ground, which is what the interior headers get from
                white-on-teal. Same gesture, legible on a dark field. */}
            <p className="mt-8 max-w-[52ch] border-l-2 border-aqua pl-6 text-[1.125rem] leading-8 text-white/90">
              KOFA Healthcare is an evergreen investment fund that invests in
              early- to mid-stage medical device companies that solve a clear
              unmet need in high growth clinical markets. We invest in
              companies, not single product opportunities with a market size
              typically $1B + worldwide.
            </p>

            {/* The hero shipped with no action of any kind: the first screen
                of the site asked the reader to do nothing and offered nowhere
                to go. Two routes, weighted — the portfolio is the evidence
                most visitors came for, the approach is for the founder who
                wants to know how the fund behaves before they write in. */}
            <div className="mt-11 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-9">
              <Button href="/portfolio" variant="onDark">
                View the portfolio
              </Button>
              <TextLink href="/our-approach" tone="white">
                How we invest
              </TextLink>
            </div>
          </div>
        </Container>

        {/* The site's one soft gesture, shared with PageHero: two overlapping
            ellipses rather than an image, so it costs nothing and scales. */}
        <div
          aria-hidden
          className="absolute -bottom-10 left-[-6%] h-20 w-[75%] rounded-[50%] border-t border-white bg-white"
        />
        <div
          aria-hidden
          className="absolute -bottom-7 left-[35%] h-14 w-[70%] rounded-[50%] bg-white"
        />
      </section>

      {/* --- Portfolio ---------------------------------------------------- */}
      <Section id="portfolio" className="bg-white">
        <Container>
          <div className="grid gap-10 border-b border-rule pb-14 lg:grid-cols-[.95fr_1fr] lg:items-center lg:gap-20">
            <div className="mx-auto aspect-square w-full max-w-[380px] rounded-full border border-teal/30 bg-ice p-2 sm:p-3">
              <div className="relative h-full overflow-hidden rounded-full">
                <Image
                  src="/media/home/portfolio-microscope.jpg"
                  alt=""
                  fill
                  quality={90}
                  sizes="(min-width: 1024px) 380px, min(100vw - 3rem, 380px)"
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="type-section max-w-[18ch]">
                Backing the Devices That Change Care
              </h2>
              <p className="type-body-lg mt-7 max-w-[53ch]">
                We strive to invest in companies with proven medtech founders
                that have experienced teams in technologies that will both
                improve patient outcomes and reduce healthcare costs.
              </p>
            </div>
          </div>

        </Container>

        {/* The revolving strip, back at the client's request. It sits between
            two <Container>s rather than inside one because it is full-bleed
            by design: the row has to run out of both edges of the screen for
            the loop to read as endless. See PartnerMarquee.tsx.

            It replaces the static Active/Exits tab grid that stood here. The
            grid showed the same sixteen companies in a fixed four-column
            block; this shows all sixteen in a fifth of the height and moves,
            which is what was asked for. The Active/Exits split has not been
            lost — /portfolio still filters on it, and that page is the one
            the client signed off. */}
        <PartnerMarquee className="mt-12" />

        <Container>
          <div className="mt-10">
            <TextLink href="/portfolio">View all portfolio companies</TextLink>
          </div>
        </Container>
      </Section>

      {/* --- Focus Areas -------------------------------------------------- */}
      <Section id="focus-areas" className="bg-ice">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-8 border-b border-rule-strong pb-10">
            <div>
              <h2 className="type-section">Focus Areas</h2>
              <div className="mt-6">
                <TextLink href="/focus-areas">
                  Explore our focus areas
                </TextLink>
              </div>
            </div>
            <div className="mx-auto aspect-square w-56 shrink-0 rounded-full border border-teal/30 bg-white p-2 sm:mx-0 sm:p-3">
              <div className="relative h-full overflow-hidden rounded-full">
                <Image
                  src="/media/home/focus-clinician.jpg"
                  alt=""
                  fill
                  quality={90}
                  sizes="224px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* One array, shared with /focus-areas. These three used to be
              hardcoded in both places, which meant a copy correction had to be
              made twice and never was. See data/site.ts. */}
          <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
            {focusAreas.map((area) => (
              <article key={area.title} className="focus-area-panel">
                <div className="focus-area-panel__head">
                  <span className="focus-area-panel__badge">
                    <FocusGlyph
                      kind={area.glyph}
                      className="focus-area-panel__glyph"
                    />
                  </span>
                </div>
                <h3 className="focus-area-panel__title">{area.title}</h3>
                <p className="focus-area-panel__body">{area.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* --- Contact -------------------------------------------------------
          The shared closing section, not a local copy of it. What stood here
          was a hand-rolled teal band whose only action was a mailto: link,
          while every other page on the site closed with CTASection pointing
          at /contact. That meant the homepage — the page most enquiries
          start from — routed people away from the working contact form and
          into whatever their browser does with a mail link, which on a
          machine with no mail client configured is nothing at all. The copy
          below is unchanged and still verbatim from the supplied document.

          tone="teal" keeps the filled band the homepage had. The seven
          interior pages stay on the default pale ground: a cold visitor
          lands here, so the closing block earns the stronger treatment on
          this page and would only shout on the others. */}
      <CTASection
        id="contact"
        tone="teal"
        lines={["Building the Next Breakthrough in MedTech?"]}
        body="If you are developing a differentiated medical device for a significant unmet clinical need, let’s start a conversation."
        action={{ label: "Connect With KOFA Healthcare", href: "/contact" }}
      />
    </>
  );
}
