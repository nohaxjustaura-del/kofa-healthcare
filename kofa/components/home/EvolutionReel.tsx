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
   the valve); slow dissolves and a slow camera drift; film grain; and one
   quiet caption. Nothing is drawn over the pictures.

     1895  X-ray imaging            Röntgen's radiograph of his wife's hand,
                                    22 December 1895, the actual first
     1929  Cardiac catheterization  a catheter in a coronary artery, contrast
                                    filling it (real cine angiography)
     1958  Obstetric ultrasound     a fetus at 21 weeks, hands to its face
     1960  Mechanical heart valve   a Starr-Edwards ball-and-cage valve, the
                                    first to succeed, photographed as an object
     1977  Balloon angioplasty      the balloon inflating inside the artery
     Today Live 3D ultrasound       the 1958 technology grown up: a fetus
                                    yawning, in real time, in three dimensions

   Dates are the published firsts; except 1895, the footage shows each
   technique as practised rather than the historic first case. Nothing is
   generated. Every file is openly licensed or public domain and credited at
   /credits; sources and every edit are in public/media/CREDITS.md.

   MOTION CONTRACT (same as the rest of the site)
   · Motion on (the default): the film loops, each clip loading only as its
     shot approaches, and everything pauses while the hero is off screen.
   · Motion off (footer control), or no JavaScript: nothing plays. The server
     markup IS the still — the 1895 radiograph — so those visitors get a
     composed picture. The grain holds still too (app/globals.css).
   · Before hydration with motion on, CSS holds the still back (the HERO FILM
     block in app/globals.css) so the film opens from darkness.
   · Save-Data: posters drift instead of clips playing; no video is fetched.

   GSAP is imported on demand after hydration; the film cannot start before
   then anyway, so bundling it would only add weight to the first load.
=========================================================================== */

type Shot = {
  year: string;
  label: string;
  media: { kind: "image"; src: string } | { kind: "video"; name: string };
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
    hold: 5.2,
    drift: [[0.97, 0, 1], [1.04, 1.5, -1.5]],
  },
  {
    year: "1929",
    label: "Cardiac catheterization",
    media: { kind: "video", name: "1929-catheterization" },
    hold: 5.4,
    drift: [[0.93, 0, 0], [0.97, -1, 0.5]],
  },
  {
    year: "1958",
    label: "Obstetric ultrasound",
    media: { kind: "video", name: "1958-obstetric-ultrasound" },
    hold: 5.4,
    // Below 1 wherever the source is small: a clip sits a little inside the
    // frame, darkness around it, rather than being magnified into softness.
    // The rule of thumb is no more than ~1.5x its source pixels on screen.
    drift: [[0.94, 0, 0], [0.98, 1, 1]],
  },
  {
    year: "1960",
    label: "Mechanical heart valve",
    media: { kind: "image", src: "/media/film/1960-heart-valve.jpg" },
    hold: 5.0,
    drift: [[0.94, 0, 1.5], [1.0, 0, -1]],
  },
  {
    year: "1977",
    label: "Balloon angioplasty",
    media: { kind: "video", name: "1977-balloon-angioplasty" },
    hold: 5.6,
    drift: [[0.9, 0, 0], [0.95, 0, -1]],
  },
  {
    year: "Today",
    label: "Live 3D ultrasound",
    media: { kind: "video", name: "today-live-3d-ultrasound" },
    hold: 6.2,
    drift: [[0.88, 0, 0], [0.92, -1, 1]],
  },
];

/** Dissolve length. Long on purpose: a cut reads as an edit, a slow
 *  dissolve reads as time passing, which is what the film is about. */
const FADE = 1.4;

/** The shot the still shows (motion off, no JS, first paint). */
const STILL = 0;

const DESCRIPTION =
  "A silent film of real medical imaging, in the order the technology arrived: Wilhelm Röntgen's 1895 X-ray of a hand; a catheter in a coronary artery; an ultrasound of a fetus; a 1960 Starr-Edwards mechanical heart valve; a balloon inflating inside an artery; and a live 3D ultrasound of a fetus yawning.";

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
    let current: HTMLVideoElement | null = null;

    const saveData =
      typeof navigator !== "undefined" &&
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

    const shots = Array.from(root.querySelectorAll<HTMLDivElement>(".ev-shot"));
    const drifts = Array.from(root.querySelectorAll<HTMLDivElement>(".ev-drift"));
    const videos = shots.map((s) => s.querySelector("video"));

    /** Clips load only as their shot approaches; posters cover any gap. */
    const warm = (i: number) => {
      const v = videos[i % videos.length];
      if (!v || saveData || v.dataset.warm) return;
      v.dataset.warm = "1";
      v.preload = "auto";
      v.load();
    };
    const play = (i: number) => {
      const v = videos[i];
      if (!v || saveData) return;
      current = v;
      v.muted = true;
      try {
        v.currentTime = 0;
      } catch {
        /* not seekable yet; it starts from 0 anyway */
      }
      if (visible) v.play().catch(() => {});
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
      setLive(true);
    }

    function destroy() {
      tl = null;
      videos.forEach((v) => v?.pause());
      current = null;
      ctx?.revert();
      ctx = null;
      setLive(false);
      setActive(stillIndex);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!tl) return;
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
      role="img"
      aria-label={DESCRIPTION}
    >
      {/* The picture. Square, full height, set right on wide screens so the
          headline owns the left; its edges dissolve into the ground through
          a soft mask (see .ev-stage in app/globals.css) rather than ending
          at a line. */}
      <div aria-hidden className="ev-stage">
        {SHOTS.map((s, i) => (
          <div key={s.year} className="ev-shot" style={{ opacity: i === stillIndex ? 1 : 0 }}>
            <div className="ev-drift">
              {s.media.kind === "image" ? (
                <Image
                  src={s.media.src}
                  alt=""
                  fill
                  quality={90}
                  priority={i === stillIndex}
                  sizes="(min-width: 1024px) min(62vw, 880px), 100vw"
                  className="object-cover"
                />
              ) : (
                <video
                  key={s.media.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  poster={`/media/film/${s.media.name}.jpg`}
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
          Re-keyed per shot so it re-runs its entrance. */}
      <div aria-hidden className="ev-caption-host">
        <div key={active} className="ev-caption">
          <span className="ev-caption__year">{shot.year}</span>
          <span className="ev-caption__label">{shot.label}</span>
        </div>
      </div>
    </div>
  );
}
