"use client";

import { useRef, useState, type FormEvent } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { Button } from "@/components/ui/Button";
import { contactPrompts, contactReasons, site } from "@/data/site";

type Status =
  | "idle"
  | "sending"
  | "sent"
  | "mailto"
  | "error"
  | "rate-limited";

interface Fields {
  name: string;
  email: string;
  company: string;
  website: string;
  reason: string;
  message: string;
  /* Honeypot. /api/contact has always rejected submissions where this key is
     truthy, but nothing ever rendered or sent it, so the defence was a comment
     in route.ts and nothing more, the branch could not fire. It is a real
     field now. A human never sees it and never fills it; a form-scraping bot
     that fills every input it finds does, and gets silently dropped. */
  company_url: string;
}

const EMPTY: Fields = {
  name: "",
  email: "",
  company: "",
  website: "",
  reason: contactReasons[0],
  message: "",
  company_url: "",
};

/* ---------------------------------------------------------------------------
   Underline fields rather than boxes: at this weight of type, a 1px rule that
   turns teal on focus reads far better than a bordered input, and it keeps the
   page architecturally flat. The label lifts and colours on focus; there is no
   glow anywhere.
--------------------------------------------------------------------------- */

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  error,
  placeholder,
  inputMode,
  autoComplete,
}: {
  id: keyof Fields;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  inputMode?: "text" | "email" | "url";
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="type-eyebrow block text-ink-mute transition-colors duration-300 ease-kofa"
      >
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-teal">
            *
          </span>
        )}
      </label>
      {/* There is deliberately no `outline-none` on this input. It used to sit
          here unconditionally, while the indicator meant to replace it
          (`focus:border-b-teal`) lives only in the non-error branch below, so
          an errored field had no focus indicator whatsoever, which is exactly
          the state validate() focuses it into. WCAG 2.4.7, on the one control
          a keyboard user is forced into.

          Do not "fix" this by adding `focus:outline-2` back alongside
          `outline-none`. Tailwind v4 compiles `outline-none` to
          `--tw-outline-style:none;outline-style:none` in @layer utilities,
          which outranks the site's `:focus-visible` rule in @layer base, and
          the outline-*width* utilities emit
          `outline-style:var(--tw-outline-style)` without resetting that
          variable, so the `none` set on the same element still wins and no
          ring paints. Verified against the built CSS. Deleting the utility and
          letting globals.css's `:focus-visible` do its job is the only fix.

          `focus:ring-0` went with it: that is a Tailwind-v3 + @tailwindcss/forms
          habit, and this project installs no forms plugin, so there was never a
          default ring here to suppress. */}
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`peer mt-3 w-full border-0 border-b bg-transparent pb-3 text-[1.0625rem] text-ink transition-colors duration-300 ease-kofa placeholder:text-ink-mute/60 ${
          error
            ? "border-b-error"
            : "border-b-rule focus:border-b-teal hover:border-b-rule-strong"
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="type-meta mt-2.5 text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function validWebsite(value: string) {
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    );
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

export function ContactForm() {
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const set = (k: keyof Fields) => (v: string) => {
    setF((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
    if (status === "error" || status === "rate-limited") setStatus("idle");
  };

  function validate(): boolean {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (!f.name.trim()) e.name = "Please enter your name.";
    if (!f.email.trim()) e.email = "Please enter an email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()))
      e.email = "That email address doesn't look right.";
    if (!f.message.trim()) e.message = "Please tell us a little about it.";
    else if (f.message.trim().length < 20)
      e.message = "A sentence or two more would help.";
    if (f.website.trim() && !validWebsite(f.website.trim()))
      e.website = "Please enter a valid URL.";

    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      formRef.current?.querySelector<HTMLElement>(`#${first}`)?.focus();
      return false;
    }
    return true;
  }

  function buildMailto() {
    const body = [
      `Name: ${f.name}`,
      `Email: ${f.email}`,
      f.company && `Company: ${f.company}`,
      f.website && `Website: ${f.website}`,
      `Reason: ${f.reason}`,
      "",
      f.message,
    ]
      .filter(Boolean)
      .join("\n");

    return `mailto:${site.email}?subject=${encodeURIComponent(
      `${f.reason}: ${f.company || f.name}`,
    )}&body=${encodeURIComponent(body)}`;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    if (!validate()) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });

      if (res.ok) {
        setStatus("sent");
        setF(EMPTY);
        return;
      }

      if (res.status === 422) {
        const data: unknown = await res.json().catch(() => null);
        const responseErrors =
          data &&
          typeof data === "object" &&
          "errors" in data &&
          data.errors &&
          typeof data.errors === "object"
            ? (data.errors as Record<string, unknown>)
            : null;

        if (responseErrors) {
          const nextErrors: Partial<Record<keyof Fields, string>> = {};
          for (const key of ["name", "email", "website", "message"] as const) {
            const value = responseErrors[key];
            if (typeof value === "string") nextErrors[key] = value;
          }
          if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            setStatus("idle");
            formRef.current
              ?.querySelector<HTMLElement>(`#${Object.keys(nextErrors)[0]}`)
              ?.focus();
            return;
          }
        }
      }

      // 501 => no delivery destination configured on this deployment.
      if (res.status === 501) {
        window.location.href = buildMailto();
        setStatus("mailto");
        return;
      }

      // 429 => /api/contact's per-IP limiter. Kept distinct from the generic
      // error because the generic copy tells the visitor to try again, which is
      // the one thing that cannot work here. A real person only ever sees this
      // by accident (the threshold is five in ten minutes), so the message has
      // to point them somewhere that does work: plain email.
      if (res.status === 429) {
        setStatus("rate-limited");
        return;
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const done = status === "sent" || status === "mailto";

  /* -------------------------------------------------------------------------
     WHY THERE IS NO <AnimatePresence> AROUND THIS SWAP.

     There was one, with mode="wait", and it silently broke the only thing on
     this page that matters.

     The sequence: the visitor submits, /api/contact returns 200, the message
     IS delivered, setStatus("sent") runs and React commits it. Then nothing
     happens. mode="wait" holds the incoming panel back until the outgoing
     child reports its exit finished; the outgoing <motion.form> carried
     `initial={false}` and no `animate`, so it had no animation state to exit
     from and never reported completion. AnimatePresence waited forever.

     What the visitor saw: the form, unchanged, with their text still in it
     and the button stuck on "Sending…" — the exact frozen snapshot of the
     last render before the swap. Verified in a production build, not just in
     dev: React's committed state read "sent" on the current fiber while the
     DOM still showed the stale "sending" form and the confirmation panel had
     never mounted.

     The natural reaction to a form that appears not to have submitted is to
     submit it again, which is how a founder writing to a fund sends the same
     enquiry five times and is then told by the rate limiter to stop. Worst
     case for this site: the fund's inbox fills with duplicates while the
     sender believes the form is broken and gives up.

     The team panel once failed the same way: an exit that never completed
     left an invisible full-viewport overlay over the page.

     So the swap no longer depends on an exit animation completing at all.
     The form is plain markup and is simply replaced; only the confirmation
     animates, on entry, where a stalled animation can strand nothing. Do not
     reintroduce an exit transition here to cross-fade the two. It buys 300ms
     of polish and risks the whole submission.
  ------------------------------------------------------------------------- */

  return (
    <div className="relative">
      {/* The confirmation's entrance moves it but never fades it.
          ----------------------------------------------------------------
          It used to start at `opacity: 0` and animate to 1. That makes the
          one message confirming a successful delivery invisible until an
          animation completes. Any condition that starves the frame loop, a
          backgrounded tab at the moment of submit, a throttled or occluded
          window, a slow device mid-jank, left the panel mounted, correct in
          the DOM, and completely blank on screen. Observed directly.

          Starting 14px low alone degrades to nothing worse than the panel
          appearing 14px lower than intended, which no one will ever notice.
          Starting from `opacity: 0` degrades to the visitor being told
          nothing at all about a message that was in fact delivered. It is a
          CSS animation now (.form-confirm in app/globals.css); do not put an
          opacity keyframe in it. */}
      {done ? (
        <div role="status" className="form-confirm border-t border-teal pt-9">
          {/* teal-deep, not teal: .type-eyebrow is 11px, so WCAG 1.4.3 wants
              4.5:1 and --color-teal on white is only 3.96:1. This is the line
              that tells someone their message reached the fund, so it is the
              last line on the site that should be hard to read. */}
          <p className="type-eyebrow text-teal-deep">
            {status === "sent" ? "Message sent" : "Almost there"}
          </p>
          <p className="type-statement mt-6 max-w-[22ch] text-ink">
            {status === "sent"
              ? "Thank you. We'll be in touch."
              : "Your email client should have opened."}
          </p>
          <p className="type-body mt-6 max-w-[44ch]">
            {status === "sent"
              ? "Someone from KOFA reads every message that comes through this form."
              : `If nothing opened, write to ${site.email} directly and we'll pick it up from there.`}
          </p>
          {/* hover:text-teal-deep, not teal: #008e95 on white is 3.96:1 and
              this label is 14px, so the hover state would fail AA. */}
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="group/link mt-9 inline-flex min-h-11 items-center gap-2.5 text-[0.875rem] font-medium text-ink transition-colors duration-300 ease-kofa hover:text-teal-deep"
          >
            Send another message
            <Arrow
              size={14}
              className="transition-transform duration-300 ease-kofa group-hover/link:translate-x-1"
            />
          </button>
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={onSubmit}
          noValidate
          className="space-y-11"
        >
          {/* Honeypot. Parked off-screen with a negative offset rather than
              `display:none` or `hidden`, because the cheap bots worth
              catching here skip anything the CSS has taken out of the render
              tree, an off-screen field still looks like a real field to
              them. It is absolutely positioned (against the wrapper .relative
              above), so it contributes no height and does not disturb the
              space-y-11 rhythm; body has overflow-x:hidden, so the negative
              left offset cannot introduce a horizontal scrollbar.

              aria-hidden on the wrapper keeps the whole subtree out of the
              accessibility tree, and tabIndex={-1} keeps it out of the tab
              order, so a screen-reader or keyboard user never meets it. Do
              not give it a real autoComplete token: browsers must not be
              encouraged to fill it. */}
          <div aria-hidden className="absolute left-[-9999px] top-auto">
            <label htmlFor="company_url">Company URL</label>
            <input
              id="company_url"
              name="company_url"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={f.company_url}
              onChange={(e) => set("company_url")(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-11 sm:grid-cols-2">
            <Field
              id="name"
              label="Name"
              value={f.name}
              onChange={set("name")}
              required
              error={errors.name}
              autoComplete="name"
            />
            <Field
              id="email"
              label="Email"
              type="email"
              inputMode="email"
              value={f.email}
              onChange={set("email")}
              required
              error={errors.email}
              autoComplete="email"
            />
            <Field
              id="company"
              label="Company"
              value={f.company}
              onChange={set("company")}
              error={errors.company}
              autoComplete="organization"
            />
            <Field
              id="website"
              label="Website"
              inputMode="url"
              placeholder="example.com"
              value={f.website}
              onChange={set("website")}
              error={errors.website}
              autoComplete="url"
            />
          </div>

          {/* --- reason --- */}
          <fieldset>
            <legend className="type-eyebrow text-ink-mute">
              Reason for contact
            </legend>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {contactReasons.map((r) => {
                const on = f.reason === r;
                return (
                  <label
                    key={r}
                    className={`cursor-pointer rounded-md border px-4 py-2.5 text-[0.8125rem] transition-colors duration-300 ease-kofa has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal ${
                      /* teal-deep text: the label is 13px, and #008e95 on
                         this pale wash measured under 4.5:1. */
                      on
                        ? "border-teal bg-[rgba(0,142,149,0.07)] text-teal-deep"
                        : "border-rule text-ink-soft hover:border-rule-strong hover:text-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={on}
                      onChange={() => set("reason")(r)}
                      className="sr-only"
                    />
                    {r}
                  </label>
                );
              })}
            </div>
            {/* The line that used to sit here, "Categories pending KOFA
                approval. Editable in the CMS.", was a note from the build
                to the client that was shipping to real visitors. Someone
                reaching out to a fund does not need to be told the fund has
                not signed off on its own form yet. It belongs in the handover
                document, not under the radio buttons. */}
          </fieldset>

          {/* --- message --- */}
          <div>
            <label
              htmlFor="message"
              className="type-eyebrow block text-ink-mute"
            >
              Message
              <span aria-hidden className="ml-1 text-teal">
                *
              </span>
            </label>
            {/* `outline-none` and `focus:ring-0` are absent here for the same
                reason they are absent from <Field>'s input above, see the
                long comment there before you consider adding either back. */}
            <textarea
              id="message"
              name="message"
              rows={5}
              value={f.message}
              required
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? "message-error" : undefined}
              onChange={(e) => set("message")(e.target.value)}
              placeholder={
                contactPrompts[f.reason as keyof typeof contactPrompts] ??
                contactPrompts["General Inquiry"]
              }
              className={`mt-3 w-full resize-y border-0 border-b bg-transparent pb-3 text-[1.0625rem] leading-[1.6] text-ink transition-colors duration-300 ease-kofa placeholder:text-ink-mute/60 ${
                errors.message
                  ? "border-b-error"
                  : "border-b-rule focus:border-b-teal hover:border-b-rule-strong"
              }`}
            />
            {errors.message && (
              <p id="message-error" className="type-meta mt-2.5 text-error">
                {errors.message}
              </p>
            )}
          </div>

          {(status === "error" || status === "rate-limited") && (
            <p role="alert" className="type-body-sm text-error">
              {status === "rate-limited"
                ? "That's several messages in a short space of time. Please wait a few minutes before sending another, or write to "
                : "Something went wrong sending that. Please try again, or write to "}
              <a href={`mailto:${site.email}`} className="link-draw text-ink">
                {site.email}
              </a>
              .
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
            {/* The site's one primary button, not a local copy of it. */}
            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message"}
            </Button>
            <p className="type-meta text-ink-mute">
              Or email{" "}
              <a href={`mailto:${site.email}`} className="link-draw text-ink">
                {site.email}
              </a>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
