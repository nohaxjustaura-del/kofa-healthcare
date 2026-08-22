import Link from "next/link";

/**
 * KOFA's hexagonal mark, vectorised from the official artwork (traced to 99.7%
 * of the original at 389 path characters, so it stays crisp at any size).
 *
 * IT IS RED, WHICH IS A REVERSAL. This was rendered monochrome for a while, on
 * the argument that the source red sits outside the ivory / ink / teal system
 * the rest of the redesign is built on and that a single-colour application is
 * the normal way to carry an existing mark into a new palette. That argument
 * is fine in the abstract and wrong here: a company's mark is not a design
 * element the site gets to restyle, it is the company's identity, and KOFA's
 * is red. The palette accommodates the mark, not the other way round.
 *
 * The red is `--color-kofa-red`, sampled from the supplied artwork at
 * public/brand/kofa-mark.png rather than eyeballed. That PNG is kept as the
 * reference original; nothing renders it, because a 161 KB bitmap with a baked
 * white background is strictly worse than this path at every size and on every
 * ground the site actually uses.
 *
 * The glyph no longer inherits `currentColor`. Nothing on the site is allowed
 * to recolour a brand mark by accident, so the fill is stated outright and the
 * old teal-on-hover was dropped with it: a mark that changes colour when you
 * point at it is a button, and this is a logo.
 */
export function LogoGlyph({
  className = "",
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 1000 866.21"
      width={size}
      height={(size * 866.21) / 1000}
      fill="var(--color-kofa-red)"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M550.6 0.0L751.3 0.0L1000.0 430.5L999.1 437.4L891.1 623.5L691.3 623.5L811.3 416.0L550.6 416.0L450.3 243.6L690.4 242.7ZM250.4 0.0L470.8 0.0L570.3 173.2L331.0 172.4L331.9 176.7L460.5 399.7L360.2 572.0L240.1 364.5L108.1 594.3L99.5 606.3L0.0 433.1ZM490.6 485.4L690.4 485.4L571.2 693.0L850.8 693.0L751.3 866.2L249.6 866.2L140.7 677.5L140.7 674.1L237.6 506.0L241.0 502.6L358.5 709.3L361.1 710.1Z"
      />
    </svg>
  );
}

/**
 * The full lockup: mark + wordmark. `tone` lets it sit on ivory or on a
 * dark surface without a second component.
 */
export function LogoMark({
  className = "",
  size = 21,
  tone = "ink",
  href = "/",
  label = true,
}: {
  className?: string;
  size?: number;
  tone?: "ink" | "white";
  href?: string | null;
  label?: boolean;
}) {
  const inner = (
    <span
      className={`group/logo inline-flex items-center gap-2.5 ${
        tone === "white" ? "text-white" : "text-ink"
      } ${className}`}
    >
      {/* The hover lives on the wordmark's colour and on the mark's opacity,
          never on the mark's hue. See the note on LogoGlyph above. */}
      <LogoGlyph
        size={size}
        className="shrink-0 opacity-100 transition-opacity duration-500 ease-kofa group-hover/logo:opacity-80"
      />
      {label && (
        /* Optically centred, not baseline-aligned.
           Both words are set in caps, so a shared baseline is technically
           correct and looks wrong: at 11px against 17px the label's cap height
           is barely two thirds of the wordmark's, so with their feet on one
           line the label's optical centre sits well below the wordmark's and
           the whole thing reads as having slipped down. Centring the two boxes
           puts the middles on one line instead of the feet, which is what the
           eye is actually measuring in a lockup this size. */
        <span className="flex items-center gap-[0.45em] leading-none">
          <span className="text-[1.0625rem] font-semibold tracking-[-0.012em]">
            KOFA
          </span>
          <span
            className={`type-eyebrow ${
              tone === "white" ? "text-white/60" : "text-ink-soft"
            } transition-colors duration-500 ease-kofa`}
          >
            Healthcare
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return inner;

  return (
    <Link
      href={href}
      aria-label="KOFA Healthcare home"
      // -my-2/py-2 gives the lockup a 24px+ hit area without moving it.
      className="-my-2 inline-flex py-2"
    >
      {inner}
    </Link>
  );
}
