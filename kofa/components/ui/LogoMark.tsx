import Image from "next/image";
import Link from "next/link";

/* ---------------------------------------------------------------------------
   THE MARK
   ---------------------------------------------------------------------------
   The supplied artwork is the authority. public/brand/kofa-symbol-supplied.png
   is 1380 x 1268, i.e. WIDER THAN IT IS TALL, the hexagon is not square.
   It was previously rendered into a square box, which object-contain then
   letterboxed: the drawn mark came out at 92% of the height it was asked for
   and sat in a box with dead space above and below it, so every lockup on the
   site was quietly smaller and looser than its own measurements claimed.

   `size` is now the mark's HEIGHT in px, and the width follows from the real
   aspect ratio. Nothing is cropped, nothing is stretched, and the number in
   the call site is the number you measure on screen.
--------------------------------------------------------------------------- */

/** Intrinsic dimensions of the supplied symbol. Update both if the file is
 *  ever re-exported; they are the reason nothing here distorts. */
const SYMBOL_W = 1380;
const SYMBOL_H = 1268;
const SYMBOL_RATIO = SYMBOL_W / SYMBOL_H;

export function LogoGlyph({
  className = "",
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/brand/kofa-symbol-supplied.png"
      alt=""
      width={Math.round(size * SYMBOL_RATIO)}
      height={size}
      className={className}
    />
  );
}

/**
 * Header and footer lockup: the supplied mark with the wordmark beside it.
 *
 * `size` is the height of the mark. The wordmark is scaled from it rather
 * than set in absolute rem, so the lockup stays in proportion at any size and
 * the two parts cannot drift apart when one call site changes. The whole
 * lockup is driven by one font-size on the wrapper, which is what makes
 * `responsive` a one-line change rather than a media query per part.
 *
 * `responsive` clamps that height between 60px and `size` against the
 * viewport. The header is the reason: at the full 84px the lockup measures
 * 202px, which alongside the 101px menu button leaves a 320px phone with
 * nothing to spare. Floor of 60px keeps the mark the dominant thing in the
 * header on a phone, which is what the client asked for, without letting it
 * push the menu button off the edge.
 */
export function LogoMark({
  className = "",
  size = 64,
  href = "/",
  label = true,
  priority = false,
  responsive = false,
}: {
  className?: string;
  size?: number;
  href?: string | null;
  label?: boolean;
  priority?: boolean;
  responsive?: boolean;
}) {
  const showLabel = label && size >= 28;
  const fontSize = responsive
    ? `clamp(${Math.min(60, size)}px, 16vw, ${size}px)`
    : `${size}px`;

  const inner = (
    <span className={`inline-flex items-center gap-[0.38em] ${className}`} style={{ fontSize }}>
      <Image
        src="/brand/kofa-symbol-supplied.png"
        alt={showLabel ? "" : "KOFA Healthcare"}
        width={Math.round(size * SYMBOL_RATIO)}
        height={size}
        priority={priority}
        className="h-[1em] w-auto shrink-0"
      />
      {showLabel && (
        <span className="min-w-0 leading-none text-[var(--color-kofa-red)]">
          {/* Every length here is a fraction of the mark's height, so the two
              halves of the lockup keep their proportions at any `size`.
              Note the margin below is expressed in ITS OWN em, which is
              0.225 of the mark, hence 0.42 rather than 0.095. */}
          <span className="block text-[0.62em] font-bold leading-none tracking-[-0.055em]">
            KOFA
          </span>
          <span className="mt-[0.42em] block text-[0.225em] font-medium leading-none tracking-[0.02em]">
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
      /* shrink-0: as a flex child of the header row this would otherwise
         compress under pressure and squeeze the wordmark rather than being
         allowed to set its own width. The clamp is what handles small
         screens; the flex algorithm is not invited to have an opinion. */
      className="inline-flex shrink-0 items-center rounded-sm"
    >
      {inner}
    </Link>
  );
}
