/**
 * SITE CONFIGURATION: CMS options page
 * ---------------------------------------------------------------------------
 * Global values a WordPress editor would set once under an ACF options page.
 * Every string here is taken from kofahealthcare.com or is structural.
 */

export const site = {
  name: "KOFA Healthcare",
  /** Verbatim from the current site's <h1>. */
  tagline: "Empower Innovations to Advance Global Health",
  /** Verbatim from the current site's hero paragraph. */
  intro:
    "KOFA Healthcare is an evergreen family office venture fund supporting biotech and healthcare innovations. We actively invest in groundbreaking technologies that address clinical unmet needs.",
  /** Verbatim from the current site's About section. */
  about:
    "We invest in women’s health, orthopedics, diagnostics, cardiovascular, and more. Our previous successful investment stories range from seed stage startups to commercial stage corporations.",
  /** Verbatim from the current site's footer. */
  footerLead: "Have a Great Idea?",
  footerSub: "We want to hear about your innovations.",
  closingPhrase: "Advancing global health through innovation.",
  email: "info@kofahealthcare.com",
  url: "https://www.kofahealthcare.com",
  founded: 2016,
} as const;

export const nav = [
  { label: "Fund", href: "/fund" },
  { label: "Team", href: "/team" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Investment areas. The first four are named explicitly on KOFA's site
 * ("women's health, orthopedics, diagnostics, cardiovascular, and more");
 * the remainder are the categories its published portfolio actually covers.
 */
export const investmentAreas = [
  {
    title: "Women's Health",
    slug: "womens-health",
    note: "Pelvic health, maternal safety, fertility and the long tail of conditions medicine has under-studied.",
    stated: true,
  },
  {
    title: "Orthopedics",
    slug: "orthopedics",
    note: "Biologics and devices that help bone and soft tissue heal faster, and at higher rates.",
    stated: true,
  },
  {
    title: "Diagnostics",
    slug: "diagnostics",
    note: "Technologies that move detection earlier, closer to the patient, and further from guesswork.",
    stated: true,
  },
  {
    title: "Cardiovascular",
    slug: "cardiovascular",
    note: "Structural, vascular and hemodynamic interventions for conditions that remain leading causes of death.",
    stated: true,
  },
  {
    title: "Digital Health",
    slug: "digital-health",
    note: "Software and sensing that extend clinical-grade measurement beyond the hospital.",
    stated: false,
  },
  {
    title: "Emerging Technologies",
    slug: "emerging-technologies",
    note: "Platforms early enough that the clinical category has not been drawn around them yet.",
    stated: false,
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

export const investmentProcess = [
  {
    n: "01",
    title: "Clinical Need",
    body: "The work starts with a problem clinicians actually have, measured in outcomes rather than addressable market.",
  },
  {
    n: "02",
    title: "Breakthrough Innovation",
    body: "A technology credible enough to change the standard of care, not merely to compete inside it.",
  },
  {
    n: "03",
    title: "Partnership",
    body: "We invest from seed through commercial stage, and stay engaged well past the round that introduced us.",
  },
  {
    n: "04",
    title: "Growth",
    body: "Evergreen capital means our horizon is set by the science and the regulatory path, not by a fund clock.",
  },
  {
    n: "05",
    title: "Patient Impact",
    body: "The only result that finally counts: the technology reaches the people it was built for.",
  },
] as const;
