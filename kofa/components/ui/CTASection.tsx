import { Container, Section } from "@/components/ui/primitives";
import { Button, TextLink } from "@/components/ui/Button";
import { Rise } from "@/components/motion/Rise";
import { FieldPlate } from "@/components/visuals/plates";
import { site } from "@/data/site";

/* ---------------------------------------------------------------------------
   CLOSING CTA
   ---------------------------------------------------------------------------
   The supplied content document has exactly one closing block, and every page
   on the site ends with it. One component, so the wording, the button label
   and the spacing cannot drift between the homepage and the other seven.

   TWO TONES, ONE COMPONENT
   ---------------------------------------------------------------------------
   `tone="light"` is the default: pale ground, dark type, the quietest thing
   on an interior page. `tone="teal"` is the filled band the homepage closes
   on, which is a deliberately louder ending for the one page a visitor is
   most likely to land on cold.

   The homepage used to hand-roll that band with its own heading sizes and a
   bare mailto anchor, so the site's single most important call to action was
   the one place not using the shared component. Making the tone a prop was
   the cheaper fix than making the homepage quieter or making six other pages
   louder.

   WHAT WAS REMOVED
   ---------------------------------------------------------------------------
   The backdrop was a canvas particle field, a drifting node network running
   its own requestAnimationFrame loop, a ResizeObserver, an
   IntersectionObserver and a window-level pointermove listener, on six of the
   site's pages. It was the most expensive element on the site and the least
   looked at, and a drifting particle field is the house style of a developer
   tools startup rather than of a fund. It is replaced by the same drawn field
   the page headers use: static markup, no JavaScript, no listeners, and one
   visual language across the site.

   The magnetic hover on the button went with it. A control that slides away
   from the pointer is a liability on a "contact us" call to action.
--------------------------------------------------------------------------- */

const TONES = {
  light: {
    section: "border-t border-rule bg-sage-bg",
    plate: "text-teal opacity-[0.22]",
    heading: "text-ink",
    body: "",
    button: "primary" as const,
    link: "ink" as const,
  },
  /* teal-deep, not teal, for the same reason the page header uses it: white
     at 14px on #008e95 is 3.96:1 and fails WCAG AA, while on #006a70 it is
     6.37:1. The button label and the email link are both 14px, so the
     brighter ground would have put the page's primary call to action below
     the threshold. Measured, not estimated. */
  teal: {
    section: "bg-teal-deep text-white",
    plate: "text-white opacity-[0.3]",
    heading: "text-white",
    body: "text-white/90",
    button: "onDark" as const,
    link: "white" as const,
  },
};

export function CTASection({
  heading = (
    <>
      Building something that could <span className="accent-italic">change</span>{" "}
      healthcare?
    </>
  ),
  lines,
  body = "We are always interested in meeting teams working on meaningful solutions to important clinical challenges.",
  action = { label: "Start a conversation", href: "/contact" },
  tone = "light",
  id,
}: {
  heading?: React.ReactNode;
  lines?: React.ReactNode[];
  body?: string;
  action?: { label: string; href: string };
  /** "light" for interior pages, "teal" for the homepage's filled closing. */
  tone?: keyof typeof TONES;
  /** Optional in-page anchor. Only the homepage sets one. */
  id?: string;
}) {
  const t = TONES[tone];

  return (
    <Section
      space="roomy"
      id={id}
      className={`relative isolate overflow-hidden ${t.section}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 -z-10 w-[70%] lg:w-[52%] ${t.plate}`}
      >
        <FieldPlate className="h-full w-full" />
      </div>

      <Container className="relative">
        <div className="grid grid-cols-12">
          <div className="col-span-12 lg:col-span-9 xl:col-span-8">
            <h2 className={`type-display-sm max-w-[18ch] ${t.heading}`}>
              {lines
                ? lines.map((line, index) => (
                    <span key={index} className="block">
                      {line}
                    </span>
                  ))
                : heading}
            </h2>

            {/* Lateral entrance rather than a straight fade-up: the heading
                above arrives line by line from below, so the two elements that
                follow it come in from the left instead, and the block reads as
                one gesture assembling rather than three things fading. */}
            <Rise from="left" delay={0.14}>
              <p className={`type-body-lg mt-9 max-w-[46ch] ${t.body}`}>{body}</p>
            </Rise>

            <Rise from="left" delay={0.24}>
              <div className="mt-11 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-9">
                <Button href={action.href} variant={t.button}>
                  {action.label}
                </Button>
                <TextLink href={`mailto:${site.email}`} arrow={false} tone={t.link}>
                  {site.email}
                </TextLink>
              </div>
            </Rise>
          </div>
        </div>
      </Container>
    </Section>
  );
}
