import { Container, Eyebrow } from "@/components/ui/primitives";
import { Button, TextLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    /* `relative` here is load-bearing, not decoration. The grid layer below is
       `absolute inset-0`, and without a positioned ancestor on this section it
       resolves against whatever else happens to establish the containing block.
       On this route that answer CHANGES mid-navigation: RouteTransition animates
       a transform for ~520ms, and a transformed element is itself a containing
       block for absolutely positioned descendants, so for the length of the
       flight the grid sized itself to the whole document and then snapped back
       to the section the moment the transform was dropped. Every other hero on
       the site (PageHero, contact, news/[slug], portfolio/[slug], ParallaxHero)
       wraps this exact pattern in `relative overflow-hidden`; the 404 was the
       one that did not, which is why it was the only page the snap was visible
       on. `overflow-hidden` comes along for the same reason it does there: the
       grid is inset-0 on a section with a large top padding, and it has no
       business painting outside it. */
    <section className="relative flex min-h-[78svh] items-center overflow-hidden pt-[84px]">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 opacity-50" />
      <Container>
        <Eyebrow>404</Eyebrow>
        <h1 className="type-display mt-8 max-w-[16ch] text-ink">
          That page isn&rsquo;t here.
        </h1>
        <p className="type-body-lg mt-8 max-w-[44ch]">
          The link may be out of date. The portfolio and the newsroom are the
          two places most things live.
        </p>
        <div className="mt-11 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-9">
          <Button href="/portfolio">View the portfolio</Button>
          <TextLink href="/">Back to home</TextLink>
        </div>
      </Container>
    </section>
  );
}
