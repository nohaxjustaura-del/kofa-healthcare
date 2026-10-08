import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND, OG_IMAGE_ALT, OG_IMAGE_SIZE } from "@/lib/metadata";
import { site } from "@/data/site";

/**
 * THE SHARE CARD
 * ---------------------------------------------------------------------------
 * The one image behind every og:image and twitter:image on the site. Rendered
 * at build time, not shipped as a PNG, so it stays in step with data/site.ts
 * and with the brand tokens rather than drifting from them the first time a
 * string changes.
 *
 * Nothing here attaches the image to any page. That is deliberate and it is
 * not an oversight: Next's file convention only injects a generated image into
 * a segment whose own metadata has no `images` key, and every route here
 * declares its own openGraph, so the convention would attach the card to the
 * homepage and nowhere else. lib/metadata.ts names this route's URL explicitly
 * instead; the full explanation is in the comment at the top of that file.
 *
 * TYPOGRAPHY, AND WHY IT LOOKS LIKE THIS
 * satori (what ImageResponse renders through) has no access to the machine's
 * fonts and no stylesheet. Next's ImageResponse registers exactly one face , 
 * the bundled noto-sans-v27-latin-regular.ttf, declared at weight 700, and
 * every fontFamily and fontWeight in this file would resolve to it no matter
 * what we asked for. So there is no bold, no italic and no serif available:
 * asking for Fraunces here would not fail loudly, it would silently render
 * Noto Sans and look like a mistake.
 *
 * The composition therefore builds hierarchy the only ways that actually
 * survive that constraint, size, colour, letter-spacing and a rule, which is
 * the same set of levers the ink-mute note in app/globals.css describes for
 * small type. Do not add fontWeight here expecting it to do anything.
 *
 * THE LOGO IS THE ARTWORK. It used to be the hexagon plus "KOFA" and
 * "HEALTHCARE" typeset beside it in Noto Sans: the same wrong font, wrong
 * layout and wrong spacing the client flagged in the site header, repeated
 * on every link preview. It is now public/brand/kofa-lockup.png, the
 * supplied stacked artwork cropped to its ink (a pixel-exact crop), embedded
 * as a data URI because satori cannot fetch a relative URL at build time.
 *
 * SATORI LAYOUT RULES, so the next edit does not break the build:
 *   - every element that has more than one child needs an explicit
 *     `display: "flex"`; satori throws otherwise;
 *   - text is composed into single template strings rather than mixed
 *     children, because a span holding ["FOUNDED ", 2016] is two children;
 *   - horizontal rules are 1px divs, not `borderTop`, which keeps us off
 *     satori's shorthand parsing entirely.
 */

export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = OG_IMAGE_ALT;

/* Display form of the canonical domain. Matches how the portfolio company
   pages present an external host: protocol and www stripped. */
const displayHost = site.url.replace(/^https?:\/\//, "").replace(/^www\./, "");

/* 1021 x 1188, the lockup's own ink box; see components/ui/LogoMark.tsx. */
const LOCKUP = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/brand/kofa-lockup.png"),
).toString("base64")}`;
const LOCKUP_H = 132;
const LOCKUP_W = Math.round((LOCKUP_H * 1021) / 1188);

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BRAND.ground,
          color: BRAND.ink,
          padding: "76px 88px",
        }}
      >
        {/* ---------- lockup ---------- */}
        <div style={{ display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori renders <img>, not next/image */}
          <img src={LOCKUP} width={LOCKUP_W} height={LOCKUP_H} alt="" />
        </div>

        {/* ---------- statement ---------- */}
        {/* site.tagline, verbatim from the current site's <h1>. The card's job
            is to tell someone who has never heard of KOFA what they are being
            sent, and the tagline is the sentence the firm already uses for
            that. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              width: 88,
              height: 4,
              backgroundColor: BRAND.teal,
              marginBottom: 40,
            }}
          />
          <div
            style={{
              display: "flex",
              maxWidth: 940,
              fontSize: 78,
              lineHeight: 1.06,
              letterSpacing: -2,
            }}
          >
            {site.tagline}
          </div>
        </div>

        {/* ---------- footer ---------- */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 1,
              backgroundColor: BRAND.rule,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 30,
              fontSize: 21,
              letterSpacing: 2.2,
              color: BRAND.inkSoft,
            }}
          >
            <span>{`FOUNDED ${site.founded}`}</span>
            <span style={{ color: BRAND.teal }}>{displayHost}</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
