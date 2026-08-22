"use client";

import { useEffect, useRef, useState } from "react";
import { Container, Eyebrow, Meta } from "@/components/ui/primitives";
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
    return () => observer.disconnect();
  }, [motionOff]);

  return (
    <section
      aria-labelledby="film-band-caption"
      className="border-t border-rule bg-ivory py-[clamp(3.5rem,6vw,6rem)]"
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
            className="aspect-[16/9] w-full object-cover opacity-95 lg:aspect-[21/9]"
            poster="/media/lab-loop-poster.jpg"
            preload="none"
            muted
            loop
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
    </section>
  );
}
