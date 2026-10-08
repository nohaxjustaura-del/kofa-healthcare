import type { Metadata } from "next";
import Image from "next/image";
import { EvolutionReel } from "@/components/home/EvolutionReel";
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

   IMAGERY. Two rounds of client notes decide everything visual here.
   September 22: "the pictures look AI" — they were generated, and were
   replaced with real photographs. September 24, on those photographs: no
   people, and instead "one silent looping animation on an evolution of a
   medical equipment / medical field" for the hero, with "still images of
   medical tools ... catheter tip, angiogram images, fetus ultrasound, and
   vascular flow" elsewhere, because "a picture is worth more than a
   thousand words — definitely the focal point of the entire website".

   So:
     hero          <EvolutionReel>, a silent film of REAL clinical imaging
                   in the order the technology arrived: Röntgen's 1895
                   radiograph, cardiac catheterization, obstetric ultrasound,
                   a 1960 mechanical heart valve, balloon angioplasty, and,
                   today, a transcatheter heart valve opening, live 3D
                   ultrasound and a super-resolution ultrasound map of
                   microvessels, full-bleed and cinematic. Two earlier cuts
                   (a line drawing, then footage in a HUD lens) were sent
                   back as not realistic enough; see the note at the top of
                   components/home/EvolutionReel.tsx.
     portfolio     tissue-heart-valve.jpg, a Carpentier-Edwards tissue heart
                   valve photographed as an object: a device, legible at a
                   glance, beside "Backing the Devices That Change Care". (An
                   angiogram stood here first; the review note was that you
                   could not tell what was going on in it.)
     focus areas   one still per card, carried on the focusAreas records in
                   data/site.ts so /focus-areas shows the same three:
                   catheter tips, a fetal ultrasound, and a 3D-printed model
                   of the brain's blood vessels.

   Every frame is real, openly licensed medical imaging (Wikimedia Commons
   and Wellcome Collection; Röntgen's radiograph is public domain). The film
   and the portfolio valve keep natural tones on a clinical black; the Focus
   Area stills share one navy duotone. Nothing is generated. Sources,
   licences and every edit made are recorded in public/media/CREDITS.md,
   and the attributions those licences require are published at /credits.

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
          ground runs up behind it.

          On any landscape screen from 1024px (hero-wide, defined at the top
          of app/globals.css) the film is the hero's background, full-bleed,
          with its picture set right and the copy on the dark field to its
          left, the way OrbiMed's photographic hero is composed. On phones
          and portrait tablets the film is a square block that comes FIRST —
          the client called the picture "the focal point of the entire
          website" — and fades into the copy.

          This used to switch at 1280px, and the client's Windows laptop
          showed the stacked version: display scaling gave her browser about
          1195 x 590 CSS px. --hero-copy narrows the copy column with the
          window below 1280px so both halves fit, and hero-short tightens the
          vertical rhythm on screens under 760px tall so the headline, the
          paragraph and both actions stay above the fold.

          The ground is near-black rather than the site's navy: it is the
          black every clinical display uses, so real X-ray and ultrasound
          footage sits in it as it would on a monitor instead of floating on
          a colour. */}
      <section className="relative isolate mt-[104px] overflow-hidden bg-[#050d13] text-white [--hero-copy:min(37.5rem,47vw)] hero-wide:flex hero-wide:min-h-[clamp(520px,calc(100svh-104px),860px)] hero-wide:items-center">
        <EvolutionReel />

        <Container className="relative pb-[clamp(5.5rem,10vw,7.5rem)] pt-4 hero-wide:py-24 hero-short:pb-[4.5rem] hero-short:pt-12">
          <div className="max-w-[36rem] hero-wide:max-w-(--hero-copy)">
            {/* On a short screen the headline is sized by the height as well
                as the width, so it never takes the fold's share from the
                copy beneath it. */}
            <h1 className="type-display-sm text-balance hero-short:text-[length:clamp(2.25rem,8svh,1.4rem+3.2vw)]">
              {site.tagline}
            </h1>

            {/* The rule is the one piece of ornament in the copy, and it is
                the same gesture the interior page headers use to set off
                their standfirst.

                aqua, not teal. --color-teal is the site accent and is tuned
                against the pale grounds it sits on everywhere else; on this
                dark field it all but disappears. --color-aqua is the
                palette's light teal and holds its contrast here. */}
            <p className="mt-8 max-w-[52ch] border-l-2 border-aqua pl-6 text-[1.125rem] leading-8 text-white/90 hero-short:mt-6 hero-short:max-w-[58ch] hero-short:text-[1.0625rem] hero-short:leading-7">
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
            <div className="mt-11 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-9 hero-short:mt-8">
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
            {/* A tissue heart valve, photographed as an object on black: the
                section is about backing devices, so it shows one, clearly.
                Same natural grade and clinical black as the hero film. */}
            <div className="mx-auto aspect-square w-full max-w-[380px] rounded-full border border-teal/30 bg-ice p-2 sm:p-3">
              <div className="relative h-full overflow-hidden rounded-full bg-[#050d13]">
                <Image
                  src="/media/home/tissue-heart-valve.jpg"
                  alt="A Carpentier-Edwards tissue heart valve: three leaflets in a fabric-covered frame"
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
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-rule-strong pb-10">
            <h2 className="type-section">Focus Areas</h2>
            <TextLink href="/focus-areas">Explore our focus areas</TextLink>
          </div>

          {/* One array, shared with /focus-areas. These three used to be
              hardcoded in both places, which meant a copy correction had to be
              made twice and never was. See data/site.ts, which now also
              carries each card's image. The header's single circular photo is
              gone: with a still on every card it would have been a fourth
              image saying less than the three below it. From md each card is
              a subgrid over the same four rows, so the bodies line up even
              when one title wraps and its neighbours do not. */}
          <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
            {focusAreas.map((area) => (
              <article
                key={area.title}
                className="focus-area-panel group md:row-span-4 md:grid md:grid-rows-subgrid md:gap-0"
              >
                <div className="focus-area-panel__media">
                  <Image
                    src={area.image.src}
                    alt={area.image.alt}
                    fill
                    quality={90}
                    sizes="(min-width: 1200px) 370px, (min-width: 768px) 31vw, 100vw"
                    className="object-cover transition-transform duration-[1400ms] ease-kofa group-hover:scale-[1.035]"
                  />
                </div>
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
