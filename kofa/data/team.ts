/**
 * TEAM MEMBERS: CMS content type
 * ---------------------------------------------------------------------------
 * Maps 1:1 to a WordPress custom post type `team_member`.
 *
 * KOFA's current website has no team page, so there is no approved team copy
 * to draw on. Rather than invent people or biographies, this file ships ONE
 * entry: the founder, whose name and title are matters of public record,
 * with `bioStatus: "placeholder"` on the biography itself.
 *
 * Placeholder copy renders inside a visibly marked editorial slot so KOFA can
 * see exactly what needs supplying. Delete `bioStatus` once real copy lands and
 * the marker disappears with no other change.
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
    standfirst:
      "Founded KOFA Healthcare in 2016 to back medical technology addressing clinical unmet needs.",
    biography:
      "Biography to be supplied by KOFA. This slot is wired to the CMS field `team_member → biography` and will render as flowing editorial copy once filled. Two to four short paragraphs work best at this width: background, investment perspective, and the areas of medicine the partner spends most time in.",
    bioStatus: "placeholder",
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
