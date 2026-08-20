/* ===========================================================================
   CELLULAR FORM
   ---------------------------------------------------------------------------
   The single large organic shape that sits half outside the viewport on the
   right of the hero. Concentric membranes, drawn as hairlines, rotating at
   different rates so the form reads as breathing rather than spinning.

   Paths are generated deterministically at module scope, identical on server
   and client, so there is no hydration mismatch and no runtime cost per frame.
   All motion is CSS; the browser can composite the whole thing off the main
   thread.
=========================================================================== */

/** Closed Catmull-Rom spline through points, emitted as cubic béziers. */
function spline(points: [number, number][]): string {
  const n = points.length;
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d + " Z";
}

/** An organic near-circle: radius modulated by two low harmonics. */
function membrane(r: number, amp: number, phase: number, k1 = 3, k2 = 5) {
  const steps = 48;
  const pts: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr =
      r * (1 + amp * Math.sin(k1 * a + phase) + amp * 0.55 * Math.cos(k2 * a - phase * 1.7));
    pts.push([500 + Math.cos(a) * rr, 500 + Math.sin(a) * rr]);
  }
  return spline(pts);
}

const RINGS = [
  { d: membrane(455, 0.032, 0.4), dur: "58s", dir: "normal", o: 0.5 },
  { d: membrane(372, 0.042, 2.1, 4, 6), dur: "44s", dir: "reverse", o: 0.62 },
  { d: membrane(288, 0.05, 4.3, 3, 7), dur: "36s", dir: "normal", o: 0.7 },
  { d: membrane(196, 0.062, 1.2, 5, 3), dur: "28s", dir: "reverse", o: 0.8 },
];

/** Nodes seated on the membranes: the network motif, carried through. */
const SEEDS: [number, number, number][] = [
  [455, 0.55, 2.4],
  [455, 3.1, 1.8],
  [372, 1.35, 2.1],
  [372, 4.4, 1.6],
  [288, 0.2, 2.6],
  [288, 2.55, 1.9],
  [196, 5.2, 2.2],
];

export function CellularForm({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <div className="animate-drift h-full w-full">
        <svg
          viewBox="0 0 1000 1000"
          className="animate-breathe h-full w-full overflow-visible"
          fill="none"
        >
          <defs>
            <radialGradient id="kofa-cyto" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4DA9A0" stopOpacity="0.085" />
              <stop offset="55%" stopColor="#176D67" stopOpacity="0.045" />
              <stop offset="100%" stopColor="#176D67" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="kofa-nucleus" cx="46%" cy="42%" r="52%">
              <stop offset="0%" stopColor="#B8CDC4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#B8CDC4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Cytoplasm */}
          <circle cx="500" cy="500" r="470" fill="url(#kofa-cyto)" />
          <circle cx="500" cy="500" r="250" fill="url(#kofa-nucleus)" />

          {/* Membranes, each rotates at its own rate about the shared centre */}
          {RINGS.map((ring, i) => (
            <g
              key={i}
              style={{
                transformOrigin: "500px 500px",
                animation: `kofa-spin ${ring.dur} linear infinite ${ring.dir}`,
              }}
            >
              <path
                d={ring.d}
                stroke="#176D67"
                strokeWidth="1"
                strokeOpacity={0.14 * ring.o}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}

          {/* Seated nodes */}
          {SEEDS.map(([r, a, size], i) => (
            <circle
              key={i}
              cx={500 + Math.cos(a) * r}
              cy={500 + Math.sin(a) * r}
              r={size}
              fill="#176D67"
              fillOpacity="0.24"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
