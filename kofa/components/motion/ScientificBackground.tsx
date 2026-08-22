"use client";

import { useEffect, useRef } from "react";
import { isMotionOff } from "@/components/motion/MotionPreference";

/* ===========================================================================
   THE LIVING NETWORK
   ---------------------------------------------------------------------------
   A slow field of nodes that drift, connect and separate. Canvas 2D rather
   than WebGL: at this node count the visual result is identical and the cost
   is a fraction of it (§30 of the brief).

   Behaviour that matters:
   · Nodes wander on two sine terms, so no path is ever a straight line.
   · Connections appear and dissolve purely as a consequence of that drift,
     no scripted "join" events.
   · The pointer parallaxes the whole field a few pixels and lifts the opacity
     of nearby nodes, forming temporary links. It influences; it never disturbs.
   · After ~2.6s without pointer movement the field eases down to a low
     baseline. It is designed to fall away when nobody is looking at it.
   · Pauses entirely when off-screen or on a hidden tab.
   · prefers-reduced-motion renders one static frame and never starts a loop.
=========================================================================== */

interface Node {
  bx: number;
  by: number;
  vx: number;
  vy: number;
  /** wander amplitude / frequency / phase, two terms per axis */
  wa: number;
  wf: number;
  wp: number;
  r: number;
  /** parallax depth, 0.35-1: nearer nodes travel further with the pointer */
  depth: number;
  /** anchors carry a soft halo */
  anchor: boolean;
  x: number;
  y: number;
}

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

export interface ScientificBackgroundProps {
  /** Multiplies the node count. 1 = hero density. */
  density?: number;
  /** Global opacity ceiling. Lower for secondary sections. */
  intensity?: number;
  /** Distance (px, CSS) under which two nodes link. */
  linkDistance?: number;
  /** Pointer interaction. Disable for purely atmospheric use. */
  interactive?: boolean;
  /** "onLight" draws teal on ivory; "onDark" draws pale sage on deep teal. */
  tone?: "onLight" | "onDark";
  className?: string;
}

const PALETTE = {
  onLight: { line: "23,109,103", halo: "77,169,160", lineMax: 0.3, nodeMax: 0.46 },
  onDark: { line: "184,205,196", halo: "77,169,160", lineMax: 0.36, nodeMax: 0.6 },
} as const;

export function ScientificBackground({
  density = 1,
  intensity = 1,
  linkDistance = 168,
  interactive = true,
  tone = "onLight",
  className = "",
}: ScientificBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = isMotionOff();
    const { line: LINE, halo: HALO, lineMax: LINE_MAX, nodeMax: NODE_MAX } =
      PALETTE[tone];

    let w = 0;
    let h = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let motes: Mote[] = [];
    let halo: HTMLCanvasElement | null = null;

    /* --- pointer ------------------------------------------------------- */
    // cx/cy are raw viewport coordinates straight off the event; tx/ty are
    // the normalised target, resolved once per frame in draw(). See onPointer.
    const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, cx: 0, cy: 0, active: false };
    let lastMove = -1e9;

    /* --- lifecycle ----------------------------------------------------- */
    let raf = 0;
    let running = false;
    let visible = true;
    let inView = true;
    let t = 0;
    let last = 0;
    /** Eased 0.62 → 1. The field's "is anyone looking" coefficient. */
    let attention = 0.62;

    /* --- halo sprite ---------------------------------------------------
       Pre-rendered once, then blitted. Building a radial gradient per node
       per frame is the single easiest way to make a canvas field expensive. */
    function buildHalo() {
      const size = 260;
      const c = document.createElement("canvas");
      c.width = c.height = size * dpr;
      const g = c.getContext("2d");
      if (!g) return null;
      g.scale(dpr, dpr);
      const grad = g.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      );
      grad.addColorStop(0, `rgba(${HALO},0.13)`);
      grad.addColorStop(0.42, `rgba(${HALO},0.05)`);
      grad.addColorStop(1, `rgba(${HALO},0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      return c;
    }

    function seed() {
      // 34 nodes at hero density on desktop, ~18 on a phone.
      const areaFactor = Math.min(1, (w * h) / (1440 * 900));
      const count = Math.round(
        (w < 640 ? 18 : 26 + 8 * areaFactor) * density,
      );

      nodes = Array.from({ length: count }, (_, i) => {
        const anchor = i % 7 === 0;
        return {
          bx: Math.random() * w,
          by: Math.random() * h,
          // px per second, deliberately tiny
          vx: (Math.random() - 0.5) * 7,
          vy: (Math.random() - 0.5) * 7,
          wa: 9 + Math.random() * 16,
          wf: 0.045 + Math.random() * 0.075,
          wp: Math.random() * Math.PI * 2,
          r: anchor ? 2.1 + Math.random() * 1.1 : 1.1 + Math.random() * 0.9,
          depth: 0.35 + Math.random() * 0.65,
          anchor,
          x: 0,
          y: 0,
        };
      });

      motes = Array.from({ length: Math.round(count * 0.7) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 4.5,
        vy: (Math.random() - 0.5) * 4.5 - 1.5,
        r: 0.5 + Math.random() * 0.7,
        a: 0.1 + Math.random() * 0.24,
      }));
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      halo = buildHalo();
      seed();
      if (reduced) draw(0);
    }

    function draw(dt: number) {
      t += dt;

      // The layout read that used to sit in the pointermove handler. Once per
      // frame, and only while a frame is actually being drawn — which the
      // IntersectionObserver already gates on this field being on screen.
      if (interactive && ptr.active) {
        const rect = canvas!.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          ptr.tx = (ptr.cx - rect.left) / rect.width;
          ptr.ty = (ptr.cy - rect.top) / rect.height;
        }
      }

      // Pointer easing + idle fade. `attention` is the whole conceit: the
      // field only fully resolves while someone is engaging with it.
      ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 3.2);
      ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 3.2);

      const idle = (performance.now() - lastMove) / 1000;
      const engaged = interactive && ptr.active && idle < 2.6;
      const target = engaged ? 1 : 0.62;
      attention += (target - attention) * Math.min(1, dt * 1.1);

      const alpha = intensity * attention;
      const px = (ptr.x - 0.5) * 2; // -1 … 1
      const py = (ptr.y - 0.5) * 2;
      const pxAbs = ptr.x * w;
      const pyAbs = ptr.y * h;

      ctx!.clearRect(0, 0, w, h);

      /* --- positions ------------------------------------------------- */
      const m = 90; // wrap margin, keeps nodes from popping at the edge
      for (const n of nodes) {
        n.bx += n.vx * dt;
        n.by += n.vy * dt;
        if (n.bx < -m) n.bx = w + m;
        else if (n.bx > w + m) n.bx = -m;
        if (n.by < -m) n.by = h + m;
        else if (n.by > h + m) n.by = -m;

        // Two-term wander → organic, never linear.
        const wx = Math.sin(t * n.wf + n.wp) * n.wa;
        const wy = Math.cos(t * n.wf * 0.83 + n.wp * 1.4) * n.wa * 0.8;

        // Parallax: up to ~16px for the nearest layer.
        n.x = n.bx + wx - px * 16 * n.depth;
        n.y = n.by + wy - py * 16 * n.depth;
      }

      /* --- halos (behind everything) --------------------------------- */
      if (halo) {
        const hs = 260;
        for (const n of nodes) {
          if (!n.anchor) continue;
          ctx!.globalAlpha = 0.85 * alpha;
          ctx!.drawImage(halo, n.x - hs / 2, n.y - hs / 2, hs, hs);
        }
        ctx!.globalAlpha = 1;
      }

      /* --- connections ------------------------------------------------ */
      const maxD = linkDistance;
      const maxD2 = maxD * maxD;
      ctx!.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > maxD2) continue;
          const d = Math.sqrt(d2);
          // Ease the falloff so links dissolve rather than blink out.
          const k = 1 - d / maxD;
          const o = k * k * LINE_MAX * alpha;
          if (o < 0.004) continue;
          ctx!.strokeStyle = `rgba(${LINE},${o.toFixed(4)})`;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }

      /* --- pointer links --------------------------------------------- */
      if (engaged) {
        const pr = 210;
        const pr2 = pr * pr;
        for (const n of nodes) {
          const dx = n.x - pxAbs;
          const dy = n.y - pyAbs;
          const d2 = dx * dx + dy * dy;
          if (d2 > pr2) continue;
          const k = 1 - Math.sqrt(d2) / pr;
          const o = k * k * 0.26 * alpha;
          ctx!.strokeStyle = `rgba(${HALO},${o.toFixed(4)})`;
          ctx!.beginPath();
          ctx!.moveTo(n.x, n.y);
          ctx!.lineTo(pxAbs, pyAbs);
          ctx!.stroke();
        }
      }

      /* --- motes ------------------------------------------------------ */
      for (const p of motes) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
        ctx!.fillStyle = `rgba(${LINE},${(p.a * alpha * 0.55).toFixed(4)})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      /* --- nodes ------------------------------------------------------ */
      for (const n of nodes) {
        let o = (n.anchor ? NODE_MAX : NODE_MAX * 0.65) * alpha;
        if (engaged) {
          const dx = n.x - pxAbs;
          const dy = n.y - pyAbs;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 210) o += (1 - d / 210) * 0.3 * alpha;
        }
        ctx!.fillStyle = `rgba(${LINE},${o.toFixed(4)})`;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function frame(now: number) {
      if (!running) return;
      // Clamp dt so a backgrounded tab never fast-forwards the field.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduced || !visible || !inView) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    /* --- events --------------------------------------------------------- */
    /* RECORD RAW COORDINATES ONLY. NO LAYOUT READ IN HERE.
       This used to call canvas.getBoundingClientRect() on every pointermove,
       which forces a synchronous layout. Two things made that worse than it
       sounds: the listener is bound to `window` and is only detached on
       unmount, so it kept firing — and kept forcing layout — for every mouse
       movement over the news list, the team columns and the footer, long after
       the IntersectionObserver had stopped this field's animation frame; and
       it ran even for a visitor who had turned motion off, who is the one
       person on the site explicitly asking for less of this.

       Caching the rect instead would be wrong: the canvas moves under scroll
       and under the parallax layers, so a cached rect desynchronises the
       pointer from the field. The read belongs in the frame that already runs
       at animation rate, where it costs one layout per frame instead of one
       per event, and only while the field is actually drawing. */
    const onPointer = (e: PointerEvent) => {
      if (!interactive) return;
      ptr.cx = e.clientX;
      ptr.cy = e.clientY;
      ptr.active = true;
      lastMove = performance.now();
    };
    const onLeave = () => {
      ptr.active = false;
    };
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      visible ? start() : stop();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        inView ? start() : stop();
      },
      { rootMargin: "120px" },
    );
    io.observe(canvas);

    resize();

    // Fine pointers only, a touch device has no hover to reward.
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (interactive && finePointer) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerleave", onLeave, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibility);

    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density, intensity, linkDistance, interactive, tone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none h-full w-full ${className}`}
    />
  );
}
