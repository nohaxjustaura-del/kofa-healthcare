"use client";

import { useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMotionOff } from "@/components/motion/MotionPreference";
import { Arrow } from "@/components/ui/Arrow";
import { Button } from "@/components/ui/Button";
import { contactReasons, site } from "@/data/site";

const EASE = [0.22, 1, 0.36, 1] as const;

type Status = "idle" | "sending" | "sent" | "mailto" | "error";

interface Fields {
  name: string;
  email: string;
  company: string;
  website: string;
  reason: string;
  message: string;
}

const EMPTY: Fields = {
  name: "",
  email: "",
  company: "",
  website: "",
  reason: contactReasons[0],
  message: "",
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
        className={`peer mt-3 w-full border-0 border-b bg-transparent pb-3 text-[1.0625rem] text-ink outline-none transition-colors duration-300 ease-kofa placeholder:text-ink-mute/60 focus:ring-0 ${
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

export function ContactForm() {
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const reduced = useMotionOff();

  const set = (k: keyof Fields) => (v: string) => {
    setF((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
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
    if (f.website.trim() && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(f.website.trim()))
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

      // 501 => no delivery destination configured on this deployment.
      if (res.status === 501) {
        window.location.href = buildMailto();
        setStatus("mailto");
        return;
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const done = status === "sent" || status === "mailto";

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            role="status"
            className="border-t border-teal pt-9"
          >
            <p className="type-eyebrow text-teal">
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
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="group/link mt-9 inline-flex items-center gap-2.5 text-[0.875rem] font-medium text-ink transition-colors duration-300 ease-kofa hover:text-teal"
            >
              Send another message
              <Arrow
                size={14}
                className="transition-transform duration-300 ease-kofa group-hover/link:translate-x-1"
              />
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            onSubmit={onSubmit}
            noValidate
            initial={false}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
            className="space-y-11"
          >
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
                        on
                          ? "border-teal bg-[rgba(23,109,103,0.06)] text-teal"
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
              <p className="type-meta mt-4 text-ink-mute">
                Categories pending KOFA approval. Editable in the CMS.
              </p>
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
              <textarea
                id="message"
                name="message"
                rows={5}
                value={f.message}
                required
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? "message-error" : undefined}
                onChange={(e) => set("message")(e.target.value)}
                placeholder="What are you building, and what clinical problem does it solve?"
                className={`mt-3 w-full resize-y border-0 border-b bg-transparent pb-3 text-[1.0625rem] leading-[1.6] text-ink outline-none transition-colors duration-300 ease-kofa placeholder:text-ink-mute/60 focus:ring-0 ${
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

            {status === "error" && (
              <p role="alert" className="type-body-sm text-error">
                Something went wrong sending that. Please try again, or write to{" "}
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
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
