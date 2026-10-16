"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { gsap as Gsap } from "gsap";
import {
  isMotionOff,
  onMotionChange,
} from "@/components/motion/MotionPreference";

/* ===========================================================================
   THE HERO FILM
   ---------------------------------------------------------------------------
   The client's brief, in her words: "one silent looping animation on an
   evolution of a medical equipment / medical field ... could be a cartoon or
   real medical clips. The main idea here is to show the innovation in the
   medtech field to promote patient care." No people.

   Two earlier cuts were sent back. A line-drawn film ("make the animations
   way more realistic"), then real footage set inside a glowing HUD lens with
   a tick-marked ring and a teal filter ("way too vibe coded and
   generated"). The second note was right about the frame, not the footage:
   rings, glows and duotones are what make real imaging look synthetic.

   So this is shot like a documentary title sequence. Full-bleed, on the
   near-black every clinical display uses; the footage in its natural tones
   (silver for X-ray and ultrasound, true colour for the 3D ultrasound and
   the valves); dissolves and a slow camera drift; film grain; and one
   quiet caption. Nothing is drawn over the pictures.

     1895  X-ray imaging            Röntgen's radiograph of his wife's hand,
                                    22 December 1895, the actual first
     1929  Cardiac catheterization  a catheter in a coronary artery, contrast
                                    filling it (real cine angiography)
     1958  Obstetric ultrasound     a fetus at 21 weeks, hands to its face
     1960  Mechanical heart valve   a Starr-Edwards ball-and-cage valve, the
                                    first to succeed, photographed as an object
     1977  Balloon angioplasty      the balloon inflating inside the artery
     Today Transcatheter heart      the 1960 valve on the 1977 catheter: a
           valve                    self-expanding valve opening on a test
                                    bench, seen down its axis
     Today Live 3D ultrasound       the 1958 technology grown up: a fetus
                                    yawning, in real time, in three dimensions
     Future Precision surgery       an original AI-generated operating-room
                                    concept, animated with a slow camera drift

   The client's September 25 note asked for "one or two additional images or
   clips" in Today (her ideas: "a modern angiogram, AI-enabled microvascular
   imaging, and a futuristic scene that represents the types of technologies
   we are backing"), and for the whole sequence to "feel more dynamic". The
   October 12 follow-up replaces the microvessel map with a non-imaging
   future scene. Its caption identifies the generated concept explicitly.

   Dates are the published firsts; except 1895, the footage shows each
   technique as practised rather than the historic first case. The final
   Future shot is conceptual, not a historical or clinical claim. Sources,
   licences and generation provenance are recorded at /credits and in
   public/media/CREDITS.md.

   MOTION CONTRACT (same as the rest of the site)
   · Motion on (the default): the film loops, and everything pauses while
     the hero is off screen. A small pause button beside the caption stops
     the film where it is (WCAG 2.2.2); it appears only once the film is
     running and affects only the film. The footer control stops all motion
     on the site and remembers the choice.
   · Motion off (footer control), or no JavaScript: nothing plays. The server
     markup IS the still — the 1895 radiograph — so those visitors get a
     composed picture. The grain holds still too (app/globals.css).
   · Before hydration with motion on, CSS holds the still back (the HERO FILM
     block in app/globals.css) so the film opens from darkness.
   · Save-Data: posters drift instead of clips playing; no video is fetched.

   LOADING. Only the still is in the server markup's network budget. Every
   other picture waits for the film to reach it: a clip's poster and the
   clip itself are requested one shot ahead, and the two later stills two
   shots ahead, so none of them competes with the first paint. They used to
   be requested with the page, about 390 KB of pictures, most of them for
   shots twenty seconds away.

   GSAP is imported on demand after hydration; the film cannot start before
   then anyway, so bundling it would only add weight to the first load.
=========================================================================== */

type Shot = {
  year: string;
  label: string;
  media:
    | { kind: "image"; src: string }
    /** rate: playback speed. The clip has to outlast its time on screen
     *  (rate × (hold + 2 × FADE) ≤ its length) or it loops mid-shot, and
     *  a clip jumping back to its first frame reads as a glitch. */
    | { kind: "video"; name: string; rate: number };
  /** Seconds fully on screen; each shot also spends FADE arriving. */
  hold: number;
  /** Camera drift over the shot: [scale, x%, y%] from → to. */
  drift: [[number, number, number], [number, number, number]];
};

const SHOTS: readonly Shot[] = [
  {
    year: "1895",
    label: "X-ray imaging",
    media: { kind: "image", src: "/media/film/1895-x-ray.jpg" },
    hold: 2.4,
    drift: [[0.97, 0, 1], [1.04, 1.5, -1.5]],
  },
  {
    year: "1929",
    label: "Cardiac catheterization",
    media: { kind: "video", name: "1929-catheterization", rate: 1.25 },
    hold: 2.6,
    drift: [[0.93, 0, 0], [0.97, -1, 0.5]],
  },
  {
    year: "1958",
    label: "Obstetric ultrasound",
    media: { kind: "video", name: "1958-obstetric-ultrasound", rate: 1.25 },
    hold: 2.6,
    // Below 1 wherever the source is small: a clip sits a little inside the
    // frame, darkness around it, rather than being magnified into softness.
    // The rule of thumb is no more than ~1.5x its source pixels on screen.
    drift: [[0.94, 0, 0], [0.98, 1, 1]],
  },
  {
    year: "1960",
    label: "Mechanical heart valve",
    media: { kind: "image", src: "/media/film/1960-heart-valve.jpg" },
    hold: 2.4,
    drift: [[0.94, 0, 1.5], [1.0, 0, -1]],
  },
  {
    year: "1977",
    label: "Balloon angioplasty",
    media: { kind: "video", name: "1977-balloon-angioplasty", rate: 1.25 },
    hold: 2.8,
    drift: [[0.9, 0, 0], [0.95, 0, -1]],
  },
  {
    // the 1960 valve's descendant, delivered on the 1977 catheter: a
    // self-expanding transcatheter valve, looking down its axis on a test
    // bench as its leaflets open. The source is high-speed footage, already
    // slowed, so it gets the smallest speed-up: the valve is seen closed once
    // the dissolve lands, and opens about 0.85 s later.
    year: "Today",
    label: "Transcatheter heart valve",
    media: { kind: "video", name: "today-transcatheter-valve", rate: 1.15 },
    hold: 3.0,
    drift: [[0.9, 0, 1], [0.96, 0, -1]],
  },
  {
    year: "Today",
    label: "Live 3D ultrasound",
    media: { kind: "video", name: "today-live-3d-ultrasound", rate: 1.25 },
    hold: 3.0,
    drift: [[0.88, 0, 0], [0.92, -1, 1]],
  },
  {
    year: "Future",
    label: "Precision surgery · AI-generated concept",
    media: { kind: "image", src: "/media/film/future-precision-surgery.jpg" },
    hold: 3.2,
    drift: [[1.0, 0, 0], [1.08, -1, 1]],
  },
];

/** Dissolve length. A dissolve rather than a cut: a cut reads as an edit,
 *  a dissolve as time passing, which is what the film is about. It was
 *  1.4 s, with holds of 5 to 6 s, a shot every 7 s or so. The client asked
 *  for the sequence to "feel more dynamic", and then for faster still: a
 *  shot now arrives every 3.2 to 4 s, and the whole loop runs about 29 s.
 *  Much shorter and the dissolves turn into cuts and the captions stop
 *  being readable. */
const FADE = 0.8;

/** The shot the still shows (motion off, no JS, first paint). */
const STILL = 0;

const DESCRIPTION =
  "A silent film tracing medical technology: Wilhelm Röntgen's 1895 X-ray of a hand; a catheter in a coronary artery; an ultrasound of a fetus; a 1960 Starr-Edwards mechanical heart valve; a balloon inflating inside an artery; today's transcatheter heart valve and live 3D ultrasound; then an AI-generated concept of a future operating room for precision surgery.";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function EvolutionReel({
  className = "",
  still: stillIndex = STILL,
  animate = true,
}: {
  className?: string;
  /** Which shot the still shows. It should be an image. */
  still?: number;
  /** False renders the still only, whatever the motion preference. */
  animate?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number>(stillIndex);
  const [live, setLive] = useState(false);
  const [paused, setPaused] = useState(false);
  /** Stills other than the opening one, mounted as the film approaches them. */
  const [warmStills, setWarmStills] = useState<readonly number[]>([]);
  /** Set while the film is running; the pause button talks to it. */
  const control = useRef<{ pause: () => void; resume: () => void } | null>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !animate) return;

    let cancelled = false;
    let stop: (() => void) | null = null;
    import("gsap").then((core) => {
      if (cancelled) return;
      stop = start(root, core.gsap);
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [animate, stillIndex]);

  /** Everything that needs GSAP. Returns its own teardown. */
  function start(root: HTMLDivElement, gsap: typeof Gsap): () => void {
    let ctx: gsap.Context | null = null;
    let tl: gsap.core.Timeline | null = null;
    let visible = true;
    let held = false;
    let current: HTMLVideoElement | null = null;

    const saveData =
      typeof navigator !== "undefined" &&
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

    const shots = Array.from(root.querySelectorAll<HTMLDivElement>(".ev-shot"));
    const drifts = Array.from(root.querySelectorAll<HTMLDivElement>(".ev-drift"));
    const videos = shots.map((s) => s.querySelector("video"));

    /** Fetch a shot's pictures ahead of it. A clip gets its poster (which
     *  also covers any gap while the clip buffers) and, unless the visitor
     *  has asked to save data, the clip; a still is mounted. */
    const warm = (n: number) => {
      const i = n % SHOTS.length;
      const m = SHOTS[i].media;
      if (m.kind === "image") {
        if (i !== stillIndex) {
          setWarmStills((prev) => (prev.includes(i) ? prev : [...prev, i]));
        }
        return;
      }
      const v = videos[i];
      if (!v || v.dataset.warm) return;
      v.dataset.warm = "1";
      v.poster = `/media/film/${m.name}.jpg`;
      if (saveData) return;
      v.preload = "auto";
      v.load();
    };
    const play = (i: number) => {
      const v = videos[i];
      const m = SHOTS[i].media;
      if (!v || saveData || m.kind !== "video") return;
      current = v;
      v.muted = true;
      // both: load() resets playbackRate to defaultPlaybackRate
      v.defaultPlaybackRate = m.rate;
      v.playbackRate = m.rate;
      try {
        v.currentTime = 0;
      } catch {
        /* not seekable yet; it starts from 0 anyway */
      }
      if (visible && !held) v.play().catch(() => {});
    };
    const pause = (i: number) => {
      const v = videos[i];
      if (!v) return;
      v.pause();
      if (current === v) current = null;
    };

    function build() {
      ctx = gsap.context(() => {
        gsap.set(shots, { opacity: 0 });
        setActive(0);
        warm(1);

        tl = gsap.timeline({ repeat: -1 });
        const T = tl;
        let t = 0.2;
        SHOTS.forEach((shot, i) => {
          const at = t;
          const [from, to] = shot.drift;
          T.call(() => {
            setActive(i);
            play(i);
            warm(i + 1);
            // Stills are cheap to hold and slow to arrive at their largest
            // size, so they get a second shot of lead time.
            if (SHOTS[(i + 2) % SHOTS.length].media.kind === "image") warm(i + 2);
          }, [], at);
          T.fromTo(shots[i], { opacity: 0 }, { opacity: 1, duration: FADE, ease: "sine.inOut" }, at);
          T.fromTo(
            drifts[i],
            { scale: from[0], xPercent: from[1], yPercent: from[2] },
            { scale: to[0], xPercent: to[1], yPercent: to[2], duration: shot.hold + FADE * 2, ease: "none" },
            at,
          );
          T.to(shots[i], { opacity: 0, duration: FADE, ease: "sine.inOut" }, at + FADE + shot.hold);
          T.call(() => pause(i), [], at + FADE * 2 + shot.hold);
          // the next shot dissolves in over this one's exit
          t = at + FADE + shot.hold;
        });
        T.set({}, {}, t + FADE);
      }, root);
      held = false;
      setPaused(false);
      control.current = {
        pause() {
          held = true;
          tl?.pause();
          current?.pause();
          setPaused(true);
        },
        resume() {
          held = false;
          if (visible) {
            tl?.resume();
            current?.play().catch(() => {});
          }
          setPaused(false);
        },
      };
      setLive(true);
    }

    function destroy() {
      tl = null;
      control.current = null;
      videos.forEach((v) => v?.pause());
      current = null;
      ctx?.revert();
      ctx = null;
      setLive(false);
      setPaused(false);
      setActive(stillIndex);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!tl || held) return;
        if (visible) {
          tl.resume();
          current?.play().catch(() => {});
        } else {
          tl.pause();
          current?.pause();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(root);

    if (!isMotionOff()) build();
    const unsubscribe = onMotionChange((off) => {
      if (off) destroy();
      else if (!tl) build();
    });

    return () => {
      unsubscribe();
      io.disconnect();
      destroy();
    };
  }

  const shot = SHOTS[active];

  return (
    <div
      ref={rootRef}
      className={`ev-film ${className}`}
      data-animate={animate ? "true" : "false"}
      data-live={live ? "true" : "false"}
      data-paused={paused ? "true" : "false"}
    >
      {/* The picture. Square, full height, set right on wide screens so the
          headline owns the left; its edges dissolve into the ground through
          a soft mask (see .ev-stage in app/globals.css) rather than ending
          at a line.

          role="img" lives here, on the picture, rather than on the whole
          film, because the pause button below is a real control and an
          image's contents are presentational to assistive technology. */}
      <div className="ev-stage" role="img" aria-label={DESCRIPTION}>
        {SHOTS.map((s, i) => (
          <div key={`${s.year} ${s.label}`} className="ev-shot" style={{ opacity: i === stillIndex ? 1 : 0 }}>
            <div className="ev-drift">
              {s.media.kind === "image" ? (
                (i === stillIndex || warmStills.includes(i)) && (
                  <Image
                    src={s.media.src}
                    alt=""
                    fill
                    quality={90}
                    priority={i === stillIndex}
                    sizes="(min-width: 1024px) min(62vw, 880px), 100vw"
                    className="object-cover"
                  />
                )
              ) : (
                /* No poster attribute: warm() sets it when the film is a
                   shot away, so it is not fetched with the page. */
                <video
                  key={s.media.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  muted
                  playsInline
                  loop
                  preload="none"
                  disablePictureInPicture
                  disableRemotePlayback
                >
                  <source src={`/media/film/${s.media.name}.webm`} type="video/webm" />
                  <source src={`/media/film/${s.media.name}.mp4`} type="video/mp4" />
                </video>
              )}
            </div>
          </div>
        ))}
        {/* Grain on the picture only, the way a print carries it; the
            headline beside it stays clean. */}
        <div className="ev-grain" />
      </div>

      {/* Desktop only: a shade from the left edge, so the copy always sits
          on clean black however far a shot drifts toward it. */}
      <div aria-hidden className="ev-shade" />

      {/* The caption: a year and a name, like a label beside an exhibit.
          Re-keyed per shot so it re-runs its entrance. The pause button
          rides beside it, rendered only once the film is actually running:
          with motion off or before the film starts there is nothing to
          pause, and the server markup never offers a control that cannot
          work. */}
      <div className="ev-caption-host">
        <div aria-hidden key={active} className="ev-caption">
          <span className="ev-caption__year">{shot.year}</span>
          <span className="ev-caption__label">{shot.label}</span>
        </div>
        {live && (
          <button
            type="button"
            className="ev-toggle"
            aria-label={paused ? "Play the film" : "Pause the film"}
            onClick={() =>
              paused ? control.current?.resume() : control.current?.pause()
            }
          >
            {paused ? (
              <svg aria-hidden viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor">
                <path d="M3 1.6v8.8a.6.6 0 0 0 .92.5l6.6-4.4a.6.6 0 0 0 0-1L3.92 1.1A.6.6 0 0 0 3 1.6Z" />
              </svg>
            ) : (
              <svg aria-hidden viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor">
                <rect x="2" y="1.5" width="2.6" height="9" rx="0.6" />
                <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.6" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
