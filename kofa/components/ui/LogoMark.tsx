import Image from "next/image";
import Link from "next/link";

/* ---------------------------------------------------------------------------
   THE LOGO
   ---------------------------------------------------------------------------
   This file used to BUILD a lockup: the supplied hexagon, and beside it the
   words "KOFA" and "Healthcare" set in Geist Bold at hand-picked sizes and
   tracking. The client's note on it was exact — "the logo is slightly
   different from the one we are using right now (the fonts and layout, the
   distance between the logo and the name)" — and all three observations were
   correct, because all three were things this file had invented:

     fonts     "KOFA" was Geist Bold standing in for the artwork's own
               heavier, wider letterforms. Close, and visibly not the same.
     layout    The artwork stacks the name UNDER the mark. This set it
               beside, and added a second line, "Healthcare", that does not
               appear in the supplied logo at all.
     distance  Two compounding errors. The gap was a hand-chosen 0.38em,
               where the artwork's own is 0.133 of the mark's height; and
               kofa-symbol-supplied.png carries ~10% transparent padding
               (ink occupies 1167x1012 of a 1380x1268 canvas), so every
               measurement taken against the file was against the canvas
               rather than the drawing, and the mark rendered smaller and
               looser than the numbers claimed.

   So nothing is typeset here any more. public/brand/kofa-lockup.png is the
   supplied artwork cropped to its own ink and otherwise untouched, which
   makes the letterforms, the arrangement and the gap the client's rather
   than ours, by construction. There is no font to match and no spacing to
   tune, and re-exporting the logo is a file swap.

   The crop is reproducible: the supplied file is 1272 x 1364, the mark's ink
   occupies x148-1168 / y87-970 and the wordmark's x215-1102 / y1089-1274, so
   the lockup is the box x148-1168 / y87-1274, or 1021 x 1188.
--------------------------------------------------------------------------- */

/** Intrinsic dimensions of the cropped assets. Both are cut from the same
 *  master, so they share a width and cannot drift apart. Update these if the
 *  artwork is ever re-exported; they are the reason nothing here distorts. */
const LOCKUP_W = 1021;
const LOCKUP_H = 1188;
const LOCKUP_RATIO = LOCKUP_W / LOCKUP_H; // 0.8594, portrait

const SYMBOL_W = 1021;
const SYMBOL_H = 884;
const SYMBOL_RATIO = SYMBOL_W / SYMBOL_H; // 1.1550, landscape

/**
 * The hexagon on its own, for the places that want a mark rather than a
 * logo. `size` is its HEIGHT in px; the width follows from the real ink
 * ratio, so the number at the call site is the number on screen.
 */
export function LogoGlyph({
  className = "",
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/brand/kofa-symbol-trimmed.png"
      alt=""
      width={Math.round(size * SYMBOL_RATIO)}
      height={size}
      className={className}
    />
  );
}

/**
 * The logo, as supplied: hexagon above the KOFA wordmark.
 *
 * `size` is the height of the WHOLE lockup, not of the mark. That is a change
 * from the previous signature, where it meant the mark's height and the
 * wordmark was extra; call sites have been rescaled to match and the two
 * numbers are related by LOCKUP_H / SYMBOL_H, about 1.34.
 *
 * `responsive` clamps that height against the viewport so the header still
 * fits a 320px phone alongside the menu button. The floor is 52px, which is
 * where the wordmark stops being comfortably readable.
 *
 * `label` is gone. It used to switch the typeset "KOFA / Healthcare" on and
 * off; the name is part of the artwork now, so there is nothing to toggle.
 * Anywhere that genuinely wants the bare hexagon should use LogoGlyph.
 */
export function LogoMark({
  className = "",
  size = 72,
  href = "/",
  priority = false,
  responsive = false,
}: {
  className?: string;
  size?: number;
  href?: string | null;
  priority?: boolean;
  responsive?: boolean;
}) {
  const height = responsive
    ? `clamp(${Math.min(52, size)}px, 13vw, ${size}px)`
    : `${size}px`;

  const inner = (
    <Image
      src="/brand/kofa-lockup.png"
      alt="KOFA Healthcare"
      width={Math.round(size * LOCKUP_RATIO)}
      height={size}
      priority={priority}
      /* Height drives, width follows. The intrinsic attributes above are
         what Next uses to reserve space and pick srcset widths; the style
         below is what actually sizes it, so `responsive` can hand it a
         clamp() without the two disagreeing. */
      style={{ height, width: "auto" }}
      className={className}
    />
  );

  if (!href) return inner;

  return (
    <Link
      href={href}
      aria-label="KOFA Healthcare home"
      /* shrink-0: as a flex child of the header row this would otherwise
         compress under pressure and squash the artwork rather than being
         allowed to set its own width. The clamp is what handles small
         screens; the flex algorithm is not invited to have an opinion. */
      className="inline-flex shrink-0 items-center rounded-sm"
    >
      {inner}
    </Link>
  );
}
