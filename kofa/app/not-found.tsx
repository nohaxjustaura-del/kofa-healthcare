import { Container, Eyebrow } from "@/components/ui/primitives";
import { Button, TextLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    /* pt-[104px] clears the fixed header, the same band app/page.tsx clears
       with mt-[104px]. It was 84px, from when the header was shorter, which
       tucked the top 20px of this section underneath it. */
    <section className="flex min-h-[78svh] items-center pb-16 pt-[104px]">
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
          <TextLink href="/news">Read the news</TextLink>
          <TextLink href="/">Back to home</TextLink>
        </div>
      </Container>
    </section>
  );
}
