/* ---------------------------------------------------------------------------
   TECHNICAL PLATES
   ---------------------------------------------------------------------------
   KOFA's illustration set, drawn entirely by this file. No photography, no
   stock art, no licence to track, nothing to re-clear if the site moves.

   The September brief asked for something clinically credible, quietly
   institutional and explicitly NOT hospital photography: "technical drawings
   or subtle patent illustrations; abstract forms suggesting movement, flow
   and precision; natural images suggesting longevity and quality of life."

   So the plates borrow the conventions of an engineering drawing, hairline
   strokes, dash-dot centrelines, dimension ticks and numbered leaders. Two of
   them are not stylised at all:

     FlowPlate     traces genuine streamlines of potential flow around a
                   cylinder, solved from the stream function in `streamline`.
     LatticePlate  projects a real cylindrical strut lattice, the geometry a
                   braided scaffold actually has, with struts on the far wall
                   drawn fainter because they are behind the near ones.

   Drawing them properly costs a few lines of arithmetic and buys the one
   thing a decorative squiggle cannot: the drawing holds up when a clinician
   or a device engineer looks at it.

   Every plate takes its colour from `currentColor`, so the parent sets the
   tone with a text colour and the plate needs no dark/light variant. All of
   them are server components: the geometry resolves once, at build time, and
   ships as markup. Nothing here runs in the browser.
--------------------------------------------------------------------------- */

const num = (n: number) => Number(n.toFixed(2));

/* --- Geometry --------------------------------------------------------- */

/**
 * One streamline of ideal flow past a cylinder of radius `a` centred on the
 * origin, for stream-function value `psi`.
 *
 *   ψ = y · (1 − a²/(x² + y²))
 *
 * There is no closed form for y(x), so each station is solved by Newton from
 * the previous one; far upstream y ≈ ψ, which seeds the march. Only ψ above
 * ~0.4a is used, so no line is ever asked to pass through the body itself.
 * Returned in SVG space, y inverted, translated to (cx, cy).
 */
function streamline(
  psi: number,
  a: number,
  cx: number,
  cy: number,
  x0: number,
  x1: number,
  steps = 80,
) {
  let y = psi;
  const points: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;

    for (let k = 0; k < 24; k++) {
      const r2 = x * x + y * y;
      const f = y - (y * a * a) / r2 - psi;
      const df = 1 - (a * a * (x * x - y * y)) / (r2 * r2);
      if (Math.abs(df) < 1e-9) break;
      const step = f / df;
      y -= step;
      if (Math.abs(step) < 1e-9) break;
    }

    points.push(`${num(cx + x)},${num(cy - y)}`);
  }

  return `M${points.join("L")}`;
}

/**
 * A strut on the wall of a cylinder, from (θ0, y0) to (θ1, y1), projected as
 * an axonometric ellipse of half-width `rx` and depth `ry`. Subdivided so the
 * strut curves around the wall rather than cutting across it.
 * `depth` is the cosine at the midpoint: positive is the near wall.
 */
function strut(
  t0: number,
  t1: number,
  y0: number,
  y1: number,
  cx: number,
  rx: number,
  ry: number,
  segments = 7,
) {
  const points: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const k = i / segments;
    const t = t0 + (t1 - t0) * k;
    const y = y0 + (y1 - y0) * k;
    points.push(`${num(cx + rx * Math.sin(t))},${num(y + ry * Math.cos(t))}`);
  }
  return {
    d: `M${points.join("L")}`,
    depth: Math.cos((t0 + t1) / 2),
  };
}

/**
 * One growth ring. Radius is modulated by three low harmonics, so the ring is
 * closed and smooth but never a circle, which is what makes a stack of them
 * read as something grown rather than something plotted.
 */
function ring(cx: number, cy: number, r: number, phase: number, steps = 132) {
  const points: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const rr =
      r *
      (1 +
        0.048 * Math.sin(3 * t + phase) +
        0.026 * Math.cos(5 * t - phase * 0.6) +
        0.014 * Math.sin(7 * t + phase * 1.7));
    points.push(`${num(cx + rr * Math.cos(t))},${num(cy + rr * Math.sin(t) * 0.94)}`);
  }
  return `M${points.join("L")}Z`;
}

/* --- Shared drawing furniture ------------------------------------------ */

/** Dash-dot, the centreline convention on every technical drawing. */
const CENTRELINE = "16 4 2 4";

function Grid({
  id,
  step = 44,
  opacity = 0.16,
}: {
  id: string;
  step?: number;
  opacity?: number;
}) {
  return (
    <>
      <defs>
        <pattern id={id} width={step} height={step} patternUnits="userSpaceOnUse">
          <path
            d={`M${step} 0V${step}H0`}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.6}
            strokeOpacity={opacity}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </>
  );
}

/** Leader line with a terminal dot and a two-digit index. */
function Leader({
  from,
  to,
  label,
  anchor = "start",
}: {
  from: [number, number];
  to: [number, number];
  label: string;
  anchor?: "start" | "end";
}) {
  return (
    <g strokeOpacity={0.55}>
      <path
        d={`M${from[0]} ${from[1]}L${to[0]} ${to[1]}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.8}
      />
      <circle cx={from[0]} cy={from[1]} r={2.4} fill="currentColor" stroke="none" />
      <text
        x={anchor === "start" ? to[0] + 8 : to[0] - 8}
        y={to[1] + 3.5}
        textAnchor={anchor}
        fill="currentColor"
        stroke="none"
        fillOpacity={0.85}
        fontSize={11}
        letterSpacing="0.16em"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {label}
      </text>
    </g>
  );
}

/* ===========================================================================
   FLOW PLATE
   ---------------------------------------------------------------------------
   The homepage hero. Movement, flow and precision, stated literally: real
   streamlines, a real body in the path, and the drawing furniture that says
   this was measured rather than imagined.
=========================================================================== */

export function FlowPlate({ className = "" }: { className?: string }) {
  const W = 760;
  const H = 560;
  const cx = 352;
  const cy = 278;
  const a = 104;

  // ψ from 0.44a outwards, spaced so the lines crowd slightly where the flow
  // accelerates over the body, which is the point of the drawing.
  const levels = [0.44, 0.9, 1.44, 2.06, 2.76, 3.54].map((k) => k * a);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      aria-hidden
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <Grid id="flow-grid" step={44} opacity={0.1} />

      {/* Centreline */}
      <path
        d={`M0 ${cy}H${W}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.8}
        strokeOpacity={0.3}
        strokeDasharray={CENTRELINE}
      />
      <path
        d={`M${cx} 40V${H - 40}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.8}
        strokeOpacity={0.22}
        strokeDasharray={CENTRELINE}
      />

      {/* Streamlines, mirrored about the centreline */}
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {levels.map((psi, i) => {
          const fade = 0.62 - i * 0.07;
          return (
            <g key={psi} strokeOpacity={fade} strokeWidth={i === 0 ? 1.35 : 1.05}>
              <path d={streamline(psi, a, cx, cy, -cx - 20, W - cx + 20)} />
              <path
                d={streamline(psi, a, cx, cy, -cx - 20, W - cx + 20)}
                transform={`matrix(1 0 0 -1 0 ${2 * cy})`}
              />
            </g>
          );
        })}
      </g>

      {/* The body in the flow. Construction circle outside it, section arc
          inside: the two marks a drawing uses to say "this is the part". */}
      <circle
        cx={cx}
        cy={cy}
        r={a}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.9}
      />
      <circle
        cx={cx}
        cy={cy}
        r={a + 22}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.7}
        strokeOpacity={0.25}
        strokeDasharray="3 6"
      />
      <path
        d={`M${cx - a * 0.62} ${cy + a * 0.5}A${a * 0.82} ${a * 0.82} 0 0 1 ${cx + a * 0.62} ${cy + a * 0.5}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.9}
        strokeOpacity={0.4}
      />
      <circle cx={cx} cy={cy} r={3} fill="currentColor" fillOpacity={0.8} stroke="none" />

      {/* Stagnation points, the two places the flow is exactly still */}
      {[-a, a].map((dx) => (
        <circle
          key={dx}
          cx={cx + dx}
          cy={cy}
          r={4.2}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeOpacity={0.75}
        />
      ))}

      {/* Diameter dimension */}
      <g stroke="currentColor" strokeOpacity={0.4} strokeWidth={0.8} fill="none">
        <path d={`M${cx - a} ${cy + a + 34}H${cx + a}`} />
        <path d={`M${cx - a} ${cy + a + 28}v12M${cx + a} ${cy + a + 28}v12`} />
        <path d={`M${cx - a} ${cy + a + 4}v${30}M${cx + a} ${cy + a + 4}v${30}`} strokeOpacity={0.2} />
      </g>
      <text
        x={cx}
        y={cy + a + 30}
        textAnchor="middle"
        fill="currentColor"
        fillOpacity={0.7}
        fontSize={11}
        letterSpacing="0.16em"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        UNMET NEED
      </text>

      <Leader from={[cx - a * 0.72, cy - a * 0.72]} to={[cx - a - 96, cy - a - 46]} label="01" anchor="end" />
      <Leader from={[cx + a * 0.76, cy - a * 0.66]} to={[cx + a + 92, cy - a - 24]} label="02" />
      <Leader from={[cx + a * 0.3, cy + a * 0.96]} to={[cx + a + 116, cy + a * 0.72]} label="03" />
    </svg>
  );
}

/* ===========================================================================
   LATTICE PLATE
   ---------------------------------------------------------------------------
   The "Backing the Devices That Change Care" figure. A cylindrical strut
   lattice in axonometric projection: the load-bearing geometry shared by
   stents, scaffolds and every expandable implant, drawn as an instrument
   maker would draw it and belonging to no company in the portfolio.
=========================================================================== */

export function LatticePlate({ className = "" }: { className?: string }) {
  const W = 520;
  const H = 520;
  const cx = 260;
  const rx = 132;
  const ry = 34;
  const top = 150;
  const rows = 5;
  const rowH = 44;
  const cells = 11;
  const bottom = top + rows * rowH;

  const step = (Math.PI * 2) / cells;
  const struts: { d: string; depth: number }[] = [];

  for (let r = 0; r < rows; r++) {
    const y0 = top + r * rowH;
    const y1 = y0 + rowH;
    const offset = (r % 2) * (step / 2);
    for (let k = 0; k < cells; k++) {
      const t = k * step + offset;
      struts.push(strut(t, t + step / 2, y0, y1, cx, rx, ry));
      struts.push(strut(t + step, t + step / 2, y0, y1, cx, rx, ry));
    }
  }

  // Far wall first, so the near wall genuinely occludes it in reading order.
  struts.sort((p, q) => p.depth - q.depth);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      aria-hidden
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Axis */}
      <path
        d={`M${cx} 58V${H - 58}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.8}
        strokeOpacity={0.24}
        strokeDasharray={CENTRELINE}
      />

      {/* Rims */}
      {[top, bottom].map((y) => (
        <ellipse
          key={y}
          cx={cx}
          cy={y}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.1}
          strokeOpacity={0.5}
        />
      ))}

      {/* Struts */}
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {struts.map((s, i) => (
          <path
            key={i}
            d={s.d}
            strokeWidth={s.depth > 0 ? 1.35 : 0.8}
            strokeOpacity={s.depth > 0 ? 0.78 : 0.2}
          />
        ))}
      </g>

      {/* Wall thickness callout on the near rim */}
      <g stroke="currentColor" strokeWidth={0.8} strokeOpacity={0.42} fill="none">
        <path d={`M${cx - rx} ${top}H${cx - rx - 54}`} />
        <path d={`M${cx - rx} ${bottom}H${cx - rx - 54}`} />
        <path d={`M${cx - rx - 40} ${top}V${bottom}`} />
        <path d={`M${cx - rx - 45} ${top + 7}l5-7 5 7`} />
        <path d={`M${cx - rx - 45} ${bottom - 7}l5 7 5-7`} />
      </g>

      {/* Expansion arrows: what the geometry is for */}
      <g stroke="currentColor" strokeWidth={1} strokeOpacity={0.45} fill="none">
        <path d={`M${cx + rx + 26} ${(top + bottom) / 2}h44`} />
        <path d={`M${cx + rx + 62} ${(top + bottom) / 2 - 5.5}l8 5.5-8 5.5`} />
      </g>

      <Leader from={[cx - rx * 0.44, top + rowH * 0.5]} to={[cx - rx - 12, 92]} label="01" anchor="end" />
      <Leader from={[cx + rx * 0.5, bottom - rowH * 0.5]} to={[cx + rx - 6, H - 74]} label="02" />
    </svg>
  );
}

/* ===========================================================================
   LONGEVITY PLATE
   ---------------------------------------------------------------------------
   The Focus Areas figure. The brief's "natural images suggesting longevity
   and quality of life", taken literally and drawn rather than photographed:
   growth rings, one season per ring, with a sight line through them. Nothing
   here is a person, a hospital or a metaphor for either.
=========================================================================== */

export function LongevityPlate({ className = "" }: { className?: string }) {
  const S = 320;
  const c = S / 2;
  const rings = Array.from({ length: 13 }, (_, i) => ({
    r: 14 + i * 10.6,
    phase: i * 0.85,
    // Rings widen then tighten, the way a long-lived section actually reads.
    weight: i === 6 ? 1.5 : 0.85,
    opacity: i === 6 ? 0.85 : 0.34 + Math.sin(i * 0.9) * 0.1,
  }));

  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      className={className}
      aria-hidden
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <g fill="none" stroke="currentColor">
        {rings.map((g) => (
          <path
            key={g.r}
            d={ring(c, c, g.r, g.phase)}
            strokeWidth={g.weight}
            strokeOpacity={g.opacity}
          />
        ))}
      </g>

      {/* Pith */}
      <circle cx={c} cy={c} r={3.4} fill="currentColor" fillOpacity={0.7} stroke="none" />

      {/* Radial sight line with season ticks */}
      <g stroke="currentColor" strokeWidth={0.8} strokeOpacity={0.4} fill="none">
        <path d={`M${c} ${c}L${c + 138} ${c - 42}`} strokeDasharray="3 5" />
        {rings.map((g, i) =>
          i % 3 === 0 ? (
            <path
              key={g.r}
              d={`M${num(c + g.r * 0.956)} ${num(c - g.r * 0.292 - 5)}l3 9.5`}
            />
          ) : null,
        )}
      </g>
    </svg>
  );
}

/* ===========================================================================
   FOCUS GLYPHS
   ---------------------------------------------------------------------------
   One per focus area, drawn to the same conventions as the plates above so
   the three cards read as three sheets from the same drawing set rather than
   three icons from a library.
=========================================================================== */

export type FocusGlyphKind = "cardiovascular" | "womens-health" | "beyond";

/**
 * These are drawn on a 64-unit box, not the 120 the plates use, and at
 * stroke weights three to four times heavier. A glyph is displayed at about
 * 90px: a 0.7 stroke on a 120 box lands at half a device pixel there and
 * simply disappears, taking the fine hatching and the dimension ticks with
 * it. Each glyph is therefore ONE idea, centred, with at most one piece of
 * drawing furniture. The detailed work belongs on the full-size plates.
 */
export function FocusGlyph({
  kind,
  className = "",
}: {
  kind: FocusGlyphKind;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 64 64",
    className,
    "aria-hidden": true as const,
    focusable: "false" as const,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (kind === "cardiovascular") {
    /* A pressure trace running into a vessel drawn in section. The two sit
       side by side rather than on top of each other: overlapping them put
       the waveform's peaks inside the lumen, where at this size the whole
       thing collapsed into a tangle. */
    return (
      <svg {...common}>
        <path
          d="M22 32h40"
          strokeWidth={1.1}
          strokeOpacity={0.3}
          strokeDasharray="9 3.5 1.6 3.5"
        />
        <path
          d="M3 32h4l3-10 4 20 3-12 2 2h3"
          strokeWidth={1.7}
          strokeOpacity={0.9}
        />
        {/* r matched to the other two glyphs' 21 as closely as the trace
            allows, so none of the three reads lighter than its neighbours. */}
        <circle cx={42} cy={32} r={18} strokeWidth={1.6} strokeOpacity={0.9} />
        <circle cx={42} cy={32} r={10} strokeWidth={1.2} strokeOpacity={0.45} />
      </svg>
    );
  }

  if (kind === "womens-health") {
    // A measured aperture: fourfold symmetry opening outward from a centre.
    return (
      <svg {...common}>
        <circle cx={32} cy={32} r={21} strokeWidth={1.6} strokeOpacity={0.9} />
        {/* One petal, drawn to fit, then rotated. No nested scale/translate:
            the petal's own coordinates are already the ones on screen. */}
        {[0, 90, 180, 270].map((deg) => (
          <path
            key={deg}
            d="M32 32C32 32 24 24.5 24 18C24 12.8 27.6 9.5 32 9.5C36.4 9.5 40 12.8 40 18C40 24.5 32 32 32 32Z"
            transform={`rotate(${deg} 32 32)`}
            strokeWidth={1.35}
            strokeOpacity={0.55}
          />
        ))}
        <circle cx={32} cy={32} r={4} strokeWidth={1.5} strokeOpacity={0.9} />
        <path
          d="M32 57a25 25 0 0 0 22-13"
          strokeWidth={1.2}
          strokeOpacity={0.4}
          strokeDasharray="2.5 4"
        />
      </svg>
    );
  }

  /* Beyond our core: a path that starts inside the drawn boundary and
     leaves it. The barbs are placed from the curve's own end tangent, (10,
     −8) normalised, rotated ±30° and stepped back 7 units, so the head sits
     on the direction of travel instead of being eyeballed. The dot marks
     where the path crosses the boundary, at r = 21 from the centre. */
  return (
    <svg {...common}>
      <circle
        cx={32}
        cy={32}
        r={21}
        strokeWidth={1.4}
        strokeOpacity={0.5}
        strokeDasharray="4 5"
      />
      <path
        d="M18 44C25 44 26 33 32 30C42 25 48 22 58 14"
        strokeWidth={1.7}
        strokeOpacity={0.9}
      />
      <path
        d="M51.1 15.1L58 14L55.5 20.5"
        strokeWidth={1.6}
        strokeOpacity={0.9}
      />
      <circle cx={49} cy={20.6} r={2.5} fill="currentColor" stroke="none" fillOpacity={0.85} />
    </svg>
  );
}

/* ===========================================================================
   FIELD PLATE
   ---------------------------------------------------------------------------
   Background furniture for the interior page headers and the closing CTA.
   A sparse contour field: offset arcs, a centreline and a handful of ticks.
   It replaces a canvas particle field that ran an animation frame loop on
   every page for an effect nobody was looking at.
=========================================================================== */

export function FieldPlate({ className = "" }: { className?: string }) {
  const W = 720;
  const H = 420;
  const arcs = Array.from({ length: 9 }, (_, i) => 118 + i * 46);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      aria-hidden
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {arcs.map((r, i) => (
          <circle
            key={r}
            cx={W - 96}
            cy={H + 38}
            r={r}
            strokeWidth={i % 3 === 0 ? 1.1 : 0.7}
            strokeOpacity={0.26 - i * 0.015}
          />
        ))}
        <path
          d={`M0 ${H * 0.34}H${W}`}
          strokeWidth={0.8}
          strokeOpacity={0.22}
          strokeDasharray={CENTRELINE}
        />
        {[0.18, 0.5, 0.82].map((k) => (
          <path
            key={k}
            d={`M${num(W * k)} ${num(H * 0.34 - 7)}v14`}
            strokeWidth={0.9}
            strokeOpacity={0.3}
          />
        ))}
      </g>
    </svg>
  );
}
