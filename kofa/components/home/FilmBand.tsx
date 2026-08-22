"use client";

import { useEffect, useRef, useState } from "react";
import { Container, Eyebrow, Meta, Section } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/Reveal";
import { useMotionOff } from "@/components/motion/MotionPreference";

/* ===========================================================================
   FILM BAND
   ---------------------------------------------------------------------------
   One moving picture on an otherwise still page: a wide letterbox of a working
   hematology lab, running silently between the portfolio story and the team.

   WHY IT IS NOT A DARK SECTION. The obvious build here is full-bleed footage
   under a teal wash with a headline over it. That is exactly what
   components/home/Conviction.tsx already does two sections earlier, and its
   whole argument is that it is the page's ONE inverted moment. So this band
   stays on ivory and behaves like a plate in a book: a letterbox, a caption,
   a rule. The footage is the only thing that moves.

   WHY IT IS A CLIENT COMPONENT. Three reasons, all of them about not making
   the visitor pay for something they cannot see:

     · The file is 6.1 MB. `preload="none"` plus an IntersectionObserver means
       the first byte is fetched when the band is roughly one screen away, not
       during page load. On a homepage this section is several screens down,
       so most sessions never request it at all.
     · Autoplay is a promise that rejects, loudly and for perfectly ordinary
       reasons (Low Power Mode, a data saver, a browser that wants a gesture
       first). It is caught, and the poster frame simply stays up.
     · With motion off in the footer the video is never loaded and never
       played. The poster frame is a still photograph of the same lab, so the
       section is complete either way, which is the rule the whole site is
       built on.

   The markup does not branch on any of that. The <video> element and its
   poster are identical on the server and on the client; only what happens
   after mount differs. See the hydration note at the top of
   components/motion/Reveal.tsx.

   PROVENANCE. The footage is public domain, from the U.S. Centers for Disease
   Control and Prevention, and the credit is printed rather than assumed: this
   is library material, not KOFA's own facility, and the caption says so. See
   public/media/CREDITS.md. Swap the file, drop the credit.
=========================================================================== */

/** Three states, not a boolean.
 *  "idle" is what the server renders and what the client renders on its first
 *  pass, so the caption is byte-identical across hydration. Only a refusal we
 *  have actually SEEN prints anything, which is why "blocked" cannot be folded
 *  back into `!playing`: that would flash a "still frame" note on every load,
 *  in the fraction of a second before the loop starts. */
type Playback = "idle" | "playing" | "blocked";

/**
 * Where the loop starts, in seconds — NOT zero, and this is a content fix
 * rather than a stylistic one.
 *
 * The source file opens on about 0.09s of a CDC public-service title card:
 * navy pictogram figures and the words "Approximately 1,500 people are
 * diagnosed and treated for malaria in the US", with the sentence cropped
 * mid-phrase by the 21:9 letterbox. Three frames, but `loop` re-displays them
 * at the top of every 18-second cycle, directly under a caption that reads
 * "Hematology laboratory". A flashing statistic about malaria diagnoses is not
 * a claim KOFA's site should be making at all, let alone by accident.
 *
 * The right fix is to trim the file, but that needs a transcoder this machine
 * does not have. Seeking past the card costs nothing and cannot fail: 0.25s is
 * comfortably clear of the card at any frame rate, and 18.1s of footage minus
 * a quarter second is still 18s of loop.
 *
 * If the file is ever re-encoded with the head removed, set this to 0 and
 * delete the `ended` handler; `loop` on the element is then enough on its own.
 */
const LOOP_START = 0.25;

export function FilmBand() {
  const motionOff = useMotionOff();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playback, setPlayback] = useState<Playback>("idle");

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // Motion turned off, possibly while the loop was already running: stop it
    // and put the poster back. `motionOff` is in the dependency list, so this
    // runs the moment the footer control is used rather than on the next page.
    if (motionOff) {
      el.pause();
      el.currentTime = 0;
      setPlayback("idle");
      return;
    }

    /* Restart at LOOP_START rather than 0. `loop` is off on the element for
       exactly this reason — the browser's own loop always rewinds to zero,
       which is the one frame we must never show. */
    const onEnded = () => {
      el.currentTime = LOOP_START;
      void el.play().catch(() => setPlayback("blocked"));
    };
    el.addEventListener("ended", onEnded);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Seek before the first play too: without this the title card is
          // shown once per page view, which is the common case for a section
          // most readers scroll past exactly once.
          if (el.currentTime < LOOP_START) el.currentTime = LOOP_START;
          // play() rejects on any autoplay refusal. Nothing to recover from:
          // the poster is already showing the right frame.
          el.play().then(
            () => setPlayback("playing"),
            () => setPlayback("blocked"),
          );
        } else {
          el.pause();
        }
      },
      // A whole viewport of lead time, so the fetch starts before the band is
      // on screen and the loop is already running when it arrives.
      { rootMargin: "100% 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      el.removeEventListener("ended", onEnded);
    };
  }, [motionOff]);

  return (
    /* Section, not a hand-rolled <section> with its own py-[...]. This was
       the only block on the homepage inventing its own vertical rhythm, which
       is exactly how a page drifts out of step with itself one component at a
       time. The primitive owns the scale; a caller picks a density. */
    <Section
      space="default"
      aria-labelledby="film-band-caption"
      className="border-t border-rule bg-ivory"
    >
      <Container>
        <div className="grid grid-cols-12 items-end gap-y-6">
          <div className="col-span-12 lg:col-span-6">
            <Reveal>
              <Eyebrow tone="mute">In the lab</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <p
                id="film-band-caption"
                className="type-statement mt-6 max-w-[22ch] text-ink"
              >
                Every company here starts in a room like this one.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>

      {/* --- the letterbox ---
          Full bleed and deliberately shallow: 21:9 on a wide screen crops the
          footage to a band rather than a screen, which is what keeps it a
          plate in the page instead of a second hero. It opens up to 16:9 on
          phones, where 21:9 would be a stripe. */}
      <Reveal delay={0.1} y={28}>
        <figure className="mt-[clamp(2rem,3.5vw,3rem)]">
          <div className="relative w-full overflow-hidden bg-[#0B2E2C]">
          <video
            ref={videoRef}
            /* max-h is the ceiling the aspect ratios never had. 16:9 governs
               everything from 360px to 1023px, so an iPad in landscape got a
               band 74% of the viewport tall, and above lg the 21:9 height just
               tracked viewport width forever — 1093px at 2560. Capping on the
               <video> rather than the wrapper lets object-cover actually
               centre-crop instead of growing the box. svh so it does not
               resize as mobile chrome hides. */
            className="aspect-[16/9] max-h-[62svh] w-full object-cover opacity-95 lg:aspect-[21/9]"
            poster="/media/lab-loop-poster.jpg"
            preload="none"
            muted
            playsInline
            // Not focusable and not announced: it carries no information the
            // caption above does not already state, and a silent looping clip
            // with no controls is decoration by any reasonable reading.
            aria-hidden
            tabIndex={-1}
          >
            <source src="/media/lab-loop.webm" type="video/webm" />
          </video>

          {/* A whisper of the brand teal over the footage, which is otherwise
              lit in clinical fluorescent beige and sits oddly against ivory. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,46,44,0.16),rgba(11,46,44,0.04)_38%,rgba(11,46,44,0.22))] mix-blend-multiply"
          />
          </div>

          <figcaption>
            <Container>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
                <Meta>Hematology laboratory</Meta>
                <Meta>
                  Public-domain footage · U.S. Centers for Disease Control and
                  Prevention
                  {/* Silent while the loop runs, which is the normal case. It
                      speaks only when autoplay was actually refused, so nobody
                      is left wondering why a video is not moving. */}
                  {playback === "blocked" ? " · still frame" : ""}
                </Meta>
              </div>
            </Container>
          </figcaption>
        </figure>
      </Reveal>
    </Section>
  );
}
