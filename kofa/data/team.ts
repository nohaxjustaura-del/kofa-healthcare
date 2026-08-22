/**
 * TEAM MEMBERS: CMS content type
 * ---------------------------------------------------------------------------
 * Maps 1:1 to a WordPress custom post type `team_member`.
 *
 * KOFA's current website has no team page, so nothing here is lifted from it.
 * The one filled entry is the founder, written from her own public
 * professional record; see the note on that entry for exactly which facts it
 * rests on and which were left out.
 *
 * The rest of the roster is still outstanding. Rather than invent people, the
 * count of unfilled profiles lives in `OPEN_TEAM_SLOTS` below and renders as
 * visibly marked empty columns, so KOFA can see what is missing instead of
 * seeing a shorter row that looks finished.
 *
 * `bioStatus: "placeholder"` remains on the interface for the same purpose:
 * set it on any entry whose copy has not been approved and it renders inside a
 * marked editorial slot. Delete it when real copy lands.
 */

export interface TeamMember {
  /** cms: post_title */
  name: string;
  /** cms: post_name */
  slug: string;
  /** cms: field_role */
  role: string;
  /** cms: field_portrait, omitted until KOFA supplies approved photography */
  portrait?: string;
  /** cms: field_biography */
  biography: string;
  /** Editorial pull-quote or one-line positioning. Optional. */
  standfirst?: string;
  /**
   * cms: field_focus_areas, repeater.
   * Three to five short lines, each a few words: the areas of medicine this
   * person actually spends time in, e.g. "Structural heart", "Pelvic health".
   * Rendered as the list under the numeral in the homepage team section
   * (components/home/TeamNumbers.tsx) and nowhere else, so a profile without
   * one is not broken, it is just quieter.
   *
   * Fill it only from what the person has actually said they work on. The
   * founder's list below comes from a statement she published herself;
   * deriving a list from the portfolio instead would invent the one fact the
   * list exists to carry, which is who covers what.
   */
  focusAreas?: string[];
  /** cms: field_linkedin */
  linkedin?: string;
  /** cms: menu_order */
  sortOrder: number;
  /** Internal: marks unapproved copy so it renders as a labelled slot. */
  bioStatus?: "placeholder";
}

export const team: TeamMember[] = [
  {
    name: "Jing Lin",
    slug: "jing-lin",
    role: "Founder & Managing Director",
    portrait: "/team/jing-lin.png",
    standfirst:
      "Founded KOFA Healthcare in 2016 to back medical technology addressing clinical unmet needs.",
    /* Assembled from Jing's own public professional record: the roles and
       dates are as stated on her LinkedIn profile, and the focus in the third
       paragraph paraphrases a statement she published there rather than an
       inference drawn from the portfolio. Nothing here describes work, a
       thesis or a credential that is not on the public record.

       What is deliberately absent: the field of the doctorate, which is not
       published, and any characterisation of her investment style. Both would
       have to be invented, and a founder's biography is the last place on a
       site to start guessing. */
    biography:
      "Jing Lin founded KOFA Healthcare in 2016 and has led it as Managing Director since, backing medical technology that addresses clinical unmet needs. She founded KOFA, LLC two years earlier, in 2014.\n\nShe holds a Ph.D., completed Harvard Business School's executive programme in Private Equity and Venture Capital in 2023, and was a Sloan Fellow on Stanford Graduate School of Business's MSx programme, graduating in 2025. She works from Palo Alto, California.\n\nHer stated focus is medical technology that advances women's health — from maternal health through to the cardiovascular conditions that disproportionately affect women — alongside the broader healthcare innovation KOFA backs.",
    focusAreas: [
      "Women's Health",
      "Maternal Health",
      "Cardiovascular",
      "Medical Technology",
    ],
    linkedin: "https://www.linkedin.com/in/jinglinhealthcarevc/",
    sortOrder: 1,
  },
];

/**
 * Number of additional, unfilled profile slots to render on /team.
 * Set to 0 once the real roster is loaded; the grid adapts automatically.
 */
export const OPEN_TEAM_SLOTS = 2;

export function getTeamMember(slug: string): TeamMember | undefined {
  return team.find((m) => m.slug === slug);
}

export const teamSorted = [...team].sort((a, b) => a.sortOrder - b.sortOrder);
