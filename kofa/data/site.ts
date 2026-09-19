/**
 * SITE CONFIGURATION: CMS options page
 * ---------------------------------------------------------------------------
 * Global values a WordPress editor would set once under an ACF options page.
 * Every string here is taken from kofahealthcare.com or is structural.
 */

export const site = {
  name: "KOFA Healthcare",
  /** Verbatim from the current site's <h1>. */
  tagline: "Patient Capital for Transformative MedTech",
  /** Verbatim from the current site's hero paragraph. */
  intro:
    "KOFA Healthcare is an evergreen investment fund for early- to mid-stage medical device companies solving clear unmet needs in high-growth clinical markets.",
  /** Verbatim from the current site's About section. */
  about:
    "We invest globally in transformative medical devices across cardiovascular innovation, women’s health and other clinical specialties.",
  /** Verbatim from the current site's footer. */
  footerLead: "Have a Great Idea?",
  footerSub: "We want to hear about your innovations.",
  closingPhrase: "Advancing global health through innovation.",
  email: "info@kofahealthcare.com",
  url: "https://www.kofahealthcare.com",
  founded: 2016,
} as const;

export const nav = [
  { label: "About", href: "/about" },
  { label: "Our Approach", href: "/our-approach" },
  { label: "Focus Areas", href: "/focus-areas" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Team", href: "/team" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * FOCUS AREAS
 * ---------------------------------------------------------------------------
 * The three areas named in the supplied content document
 * (output/website-content-source.txt, "Focus Areas section"). Titles and
 * bodies are verbatim; nothing here is editorial.
 *
 * One array, read by both the homepage section and /focus-areas, because the
 * two had drifted into separate hardcoded copies of the same three strings
 * and only one of them would ever get corrected.
 *
 * Three is the number the client asked for. An earlier `investmentAreas`
 * export listed six — the OLD site's taxonomy, plus Digital Health and
 * Emerging Technologies — and it has been deleted rather than reconciled:
 * nothing imported it, it duplicated the live portfolio taxonomy
 * (HealthcareCategory in data/portfolio.ts), and rendering it would have put
 * three areas on the page the document does not name. If KOFA later adds a
 * focus area, it is added here, with copy they supply.
 *
 * `glyph` selects the drawn mark from components/visuals/plates.tsx; the
 * values are its FocusGlyphKind union, so a typo is a type error rather than
 * a blank space on the page.
 */
export const focusAreas = [
  {
    title: "Cardiovascular Innovation",
    glyph: "cardiovascular",
    body: "We invest in differentiated technologies across structural heart, electrophysiology, minimally invasive intervention and other high-growth areas.",
  },
  {
    title: "Advancing Women’s Health",
    glyph: "womens-health",
    body: "We invest across gynecology, maternal health, reproductive care and conditions that uniquely or disproportionately affect women.",
  },
  {
    title: "Beyond Our Core",
    glyph: "beyond",
    body: "The most important innovations do not always fit neatly into a category. We remain open to exceptional opportunities across other clinical specialties.",
  },
] as const;

/**
 * Reasons for contact. Marked for KOFA's approval, per §21 of the brief.
 */
export const contactReasons = [
  "Seeking Investment",
  "Portfolio / Partnership",
  "Media",
  "General Inquiry",
] as const;

/* An `investmentProcess` export used to sit here: five numbered stages
   (Clinical Need / Breakthrough Innovation / Partnership / Growth / Patient
   Impact) with a sentence of copy each. It was deleted rather than wired up.

   None of it appears in the supplied content document, which is the only
   source of approved copy for this site; it was written during an earlier
   pass and never imported by anything. Dead data that reads as finished copy
   is the most likely thing on the page to get shipped by someone who assumes
   it was signed off. The Our Approach narrative KOFA did supply is on
   /our-approach, verbatim. If the firm wants a staged process rendered, the
   stages come from them. */
