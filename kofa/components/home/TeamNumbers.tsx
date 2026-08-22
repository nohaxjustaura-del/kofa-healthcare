import Image from "next/image";
import Link from "next/link";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { TextLink } from "@/components/ui/Button";
import { AnimatedDivider, Reveal } from "@/components/motion/Reveal";
import { RiseGroup, RiseItem } from "@/components/motion/Rise";
import { OPEN_TEAM_SLOTS, teamSorted, type TeamMember } from "@/data/team";

/* ===========================================================================
   TEAM, AS NUMERALS
   ---------------------------------------------------------------------------
   The counted-column device from fahrenheit.ch: a rank of columns divided by
   hairlines, each opening with a numeral set larger than anything else on the
   page, the content stepping down as the eye moves right.

   Three things make it work, and all three are easy to lose in a rebuild:

   1. THE NUMERAL IS THE PICTURE. It is set at ~11vw in the lightest weight
      Geist has, and it is drawn as an OUTLINE at rest, so a column is mostly
      air. Filling it is the entire hover event, see `.team-numeral` in
      app/globals.css. Solid numerals at this size read as a price list.

   2. THE STAGGER IS PER ROW, NOT PER COLUMN. Each column's content sits a
      little lower than the one to its left, which is what turns four blocks
      into a diagonal. The offset resets every fourth column so a roster that
      wraps to a second row does not march off the bottom of the section. The
      DIVIDERS do not stagger, they are full height, so the ragged edge reads
      as intent rather than as broken alignment.

   3. NOTHING HIDES BEHIND THE HOVER. The fill, the dot and the rule are all
      emphasis on content that is already legible. A device with no pointer
      loses nothing, which is the rule set out in app/globals.css under TOUCH.

   WHAT IS REAL HERE
   One name. KOFA's founder is a matter of public record; the biography, the
   focus lines and the remaining profiles are not, and are due from KOFA.
   Unfilled columns render as visibly marked slots rather than as invented
   people or as a shorter row, which is the same decision data/team.ts and
   components/team/TeamGrid.tsx already take. When the roster lands, adding
   entries to `team` in data/team.ts is the whole change: the column count,
   the numbering and the stagger all follow the data.
=========================================================================== */

/** Columns per row before the stagger resets. Four is the reference's rhythm
 *  and the most that stays readable at this numeral size. */
const ROW = 4;

/* ---------------------------------------------------------------------------
   The dot. Small, teal, and the only thing in the section that appears rather
   than merely changing, which is what makes a hover feel answered.
--------------------------------------------------------------------------- */
function Dot() {
  return (
    <span
      aria-hidden
      className="mt-2 block h-[7px] w-[7px] scale-0 rounded-full bg-teal opacity-0 transition-[transform,opacity] duration-[600ms] ease-kofa group-hover/col:scale-100 group-hover/col:opacity-100 group-focus-within/col:scale-100 group-focus-within/col:opacity-100"
    />
  );
}

/* ---------------------------------------------------------------------------
   One column. `member` undefined is an open slot.
--------------------------------------------------------------------------- */
function Column({
  index,
  member,
}: {
  index: number;
  member?: TeamMember;
}) {
  return (
    <RiseItem
      as="div"
      from="up"
      className="group/col relative border-t border-rule pt-9 lg:border-l lg:border-t-0 lg:pl-[clamp(1.5rem,2.5vw,3rem)] lg:pt-0"
    >
      {/* The hairline that lights up. It sits on top of the column's own
          border rather than replacing it, so the resting rule never moves. */}
      <span
        aria-hidden
        className="absolute left-0 top-0 hidden h-full w-px origin-top scale-y-0 bg-teal transition-transform duration-[900ms] ease-kofa group-hover/col:scale-y-100 group-focus-within/col:scale-y-100 lg:block"
      />

      {/* The stagger. Inline because it is arithmetic on the index, and a
          Tailwind class cannot be built from a runtime value. */}
      <div
        className="lg:mt-[var(--step)]"
        style={{
          ["--step" as string]: `${(index % ROW) * 2.5}rem`,
        }}
      >
        <span className="team-numeral" aria-hidden>
          {index + 1}
        </span>

        <Dot />

        {/* The portrait, when there is one.
            It sits in the air the outline numeral leaves behind rather than
            competing with it: a small 4:5 plate, well under the numeral's
            width, so the column still reads numeral-first the way the
            reference does. A full-width portrait here would turn the rank of
            columns into an ordinary team grid, which /team already is.

            It renders only when `portrait` is set, so an open slot simply
            stays quieter rather than showing a hole where a face should be. */}
        {member?.portrait && (
          <div className="relative mt-7 aspect-[4/5] w-[clamp(5.5rem,7vw,7.25rem)] overflow-hidden rounded-[10px] border border-rule-soft transition-colors duration-500 ease-kofa group-hover/col:border-rule-teal">
            <Image
              src={member.portrait}
              alt={`${member.name}, ${member.role}`}
              fill
              sizes="120px"
              className="object-cover transition-transform duration-[900ms] ease-kofa group-hover/col:scale-[1.03]"
            />
          </div>
        )}

        {member ? (
          <>
            <h3 className="mt-7 text-[0.9375rem] font-medium uppercase tracking-[0.1em] text-ink">
              {/* The name is the link. Focusing it lights the whole column,
                  which is how the keyboard gets the same reading of this
                  section as the pointer does. */}
              <Link
                href="/team"
                className="link-draw focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
              >
                {member.name}
              </Link>
            </h3>
            <p className="type-meta mt-3 text-ink-mute">{member.role}</p>

            {member.standfirst && (
              <p className="type-body-sm mt-6 max-w-[30ch]">
                {member.standfirst}
              </p>
            )}

            {/* The focus list, the reference's stack of services. Renders only
                when KOFA supplies it; see `focusAreas` in data/team.ts. */}
            {member.focusAreas && member.focusAreas.length > 0 && (
              <ul className="mt-7 space-y-2.5">
                {member.focusAreas.map((area) => (
                  <li
                    key={area}
                    className="text-[0.9375rem] uppercase tracking-[0.06em] text-ink-soft transition-colors duration-500 ease-kofa group-hover/col:text-ink"
                  >
                    {area}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            {/* Written for a VISITOR, not for the client.
                This used to read "Wired to the CMS. A name, a role and up to
                five focus lines drop into this column the moment KOFA supplies
                them." — which is a note from the build to the client, shipping
                to every reader of the homepage. The fund page had exactly this
                problem once and the fix there was the same: say the true thing
                in the site's own voice, and keep the scaffolding in the code
                where it belongs. A visitor does not need to know the field
                names; they need to know the roster is not finished. */}
            {/* Numbered, so two open columns are not byte-identical twins.
                They previously printed the same three strings side by side at
                equal width, which reads as a rendering fault rather than as
                two distinct slots — and gave a screen reader two headings it
                could not tell apart. /team already solves this the same way
                (TeamGrid's "Team member 02"), so this is the house pattern,
                not a new one. */}
            <h3 className="mt-7 text-[0.9375rem] font-medium uppercase tracking-[0.1em] text-ink-mute">
              Profile {String(index + 1).padStart(2, "0")}
            </h3>
            <p className="type-meta mt-3 text-ink-mute">To follow</p>
            <p className="type-body-sm mt-6 max-w-[30ch] text-ink-mute">
              Further profiles are being finalised and will be published here.
            </p>
          </>
        )}
      </div>
    </RiseItem>
  );
}

export function TeamNumbers() {
  const columns: (TeamMember | undefined)[] = [
    ...teamSorted,
    ...Array.from({ length: OPEN_TEAM_SLOTS }, () => undefined),
  ];

  return (
    <Section
      space="roomy"
      id="team"
      /* ivory-DEEP, and this is a pacing fix rather than a preference.
         The homepage alternates grounds so each section reads as its own
         chapter. Adding the film band and this section put FOUR consecutive
         ivory sections on the page — film, team, and both news blocks — which
         is 4,080px of unbroken #f7f8f4 between the sage story section and the
         sage CTA. That is what makes the lower half of the page feel like one
         long undifferentiated column of air rather than four chapters.
         Dropping this one to ivory-deep restores the alternation on both
         sides of it at no cost to anything else. */
      className="border-t border-rule bg-ivory-deep"
      aria-labelledby="team-numbers-heading"
    >
      <Container>
        <div className="grid grid-cols-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <Eyebrow index="04">The team</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <SectionHeading
                id="team-numbers-heading"
                className="mt-7 max-w-[17ch]"
              >
                A family office, run by the people who answer the phone.
              </SectionHeading>
            </Reveal>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.12}>
              <p className="type-body-sm max-w-[38ch]">
                KOFA is a family office fund. That structure lets the firm hold
                a position for as long as the science requires, and it means
                the person you meet first is the person who stays.
              </p>
              <div className="mt-7">
                <AnimatedDivider />
                <div className="mt-7">
                  <TextLink href="/team">Meet the team</TextLink>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* The rank itself.
            `--cols` caps at four and is applied through an arbitrary value
            because the count is a runtime number; grid wraps a longer roster
            onto a second row on its own. */}
        <RiseGroup
          as="div"
          amount={0.12}
          className="mt-[clamp(3.5rem,6vw,5.5rem)] grid grid-cols-1 gap-x-0 gap-y-12 sm:grid-cols-2 sm:gap-x-8 lg:gap-y-16 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
          style={{
            ["--cols" as string]: String(Math.min(columns.length, ROW)),
          }}
        >
          {columns.map((member, i) => (
            <Column key={member?.slug ?? `open-${i}`} index={i} member={member} />
          ))}
        </RiseGroup>
      </Container>
    </Section>
  );
}
