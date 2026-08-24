"use client";

import { useEffect, useRef } from "react";
import { useMotionOff } from "@/components/motion/MotionPreference";

/* ===========================================================================
   PORTFOLIO VIDEO
   ---------------------------------------------------------------------------
   A muted, looping company clip that behaves itself: it is never fetched on
   page load (`preload="none"`), only starts when it scrolls near the viewport,
   pauses when it leaves, and holds its poster frame whenever it is not
   playing — which covers autoplay refusals (Low Power Mode, data savers) and
   the motion-off preference alike.

   The markup does NOT branch on the preference or on playback state, so the
   element is byte-identical on the server and on the client's first render;
   only the effect that calls play() differs. Same hydration rule as
   components/motion/Reveal.tsx and components/home/FilmBand.tsx.

   The poster still is what a portfolio CARD shows: cards render the poster as
   an ordinary image and never mount this component, so a grid of sixteen
   companies never loads a single video. This plays only where the visual is
   the subject — the company detail hero and the homepage story. */
export function PortfolioVideo({
  src,
  poster,
  alt,
  fit = "cover",
  position = "center",
  sizes,
  className = "",
}: {
  src: string;
  poster: string;
  alt: string;
  fit?: "cover" | "contain";
  position?: string;
  /** Kept for API symmetry with the image path; unused by <video>. */
  sizes?: string;
  className?: string;
}) {
  void sizes;
  const motionOff = useMotionOff();
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (motionOff) {
      el.pause();
      el.currentTime = 0;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Rejects on any autoplay refusal; nothing to recover, the poster
          // is already the right frame.
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [motionOff]);

  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full ${fitClass} ${className}`}
      style={{ objectPosition: position }}
      poster={poster}
      preload="none"
      muted
      loop
      playsInline
      aria-label={alt}
      tabIndex={-1}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
