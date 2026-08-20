import { Container, Eyebrow } from "@/components/ui/primitives";
import { Button, TextLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[78svh] items-center pt-[84px]">
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
