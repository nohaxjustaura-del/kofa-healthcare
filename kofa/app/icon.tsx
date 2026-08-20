import { ImageResponse } from "next/og";
import { BRAND, KOFA_GLYPH_PATH, KOFA_GLYPH_VIEWBOX } from "@/lib/metadata";

/**
 * FAVICON
 * ---------------------------------------------------------------------------
 * The site had no icon at all, so every tab, bookmark and history entry fell
 * back to the browser's blank-document glyph.
 *
 * Generated from the same path data as the header logo (LogoGlyph in
 * components/ui/LogoMark.tsx, viewBox "0 0 1000 866.21") rather than redrawn,
 * because a favicon that is merely *similar* to the mark is worse than none:
 * it reads as a different company's tab. The path lives in lib/metadata.ts,
 * with a note there about keeping the two copies together.
 *
 * Inverted on purpose. On the site the mark is ink on ivory, but a favicon is
 * 16px inside browser chrome that may be light or dark and is not ours to
 * predict. A filled ink ground with the glyph knocked out in ivory holds its
 * silhouette against either, where an ivory tile disappears into a light
 * toolbar and a bare ink glyph disappears into a dark one.
 *
 * Next serves this at /icon and emits the <link rel="icon"> itself, with a
 * content hash on the URL — no `icons` entry in any metadata export is needed,
 * and adding one would take over from this file rather than complement it.
 */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BRAND.ink,
        }}
      >
        {/* 23x20 keeps the mark's 1000:866.21 aspect and leaves roughly 4px of
            ground on the short sides, so the hexagon is not clipped by the
            rounding some platforms apply to the tile. `fillRule="evenodd"` is
            load-bearing: the counters in the mark are holes. */}
        <svg
          width={23}
          height={20}
          viewBox={KOFA_GLYPH_VIEWBOX}
          fill={BRAND.ivory}
        >
          <path fillRule="evenodd" d={KOFA_GLYPH_PATH} />
        </svg>
      </div>
    ),
    { ...size },
  );
}
