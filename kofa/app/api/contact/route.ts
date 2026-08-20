import { NextResponse } from "next/server";

/**
 * Contact endpoint.
 * ---------------------------------------------------------------------------
 * Validates and normalises the submission, then forwards it to whatever
 * destination the deployment has configured:
 *
 *   KOFA_CONTACT_WEBHOOK: any URL that accepts a JSON POST. This is the
 *   simplest bridge to WordPress (WPForms/Gravity Forms REST endpoint), to a
 *   transactional email provider, or to a CRM.
 *
 * With nothing configured it returns 501, and the client falls back to opening
 * a pre-filled mail composer. That is deliberate: the form never reports
 * success for a message that was not actually delivered anywhere.
 */

export const runtime = "nodejs";

interface Payload {
  name?: string;
  email?: string;
  company?: string;
  website?: string;
  reason?: string;
  message?: string;
  /** Honeypot, real users never fill this. */
  company_url?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (body.company_url) {
    // Silently accept and drop obvious bots.
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name is required.";
  if (!EMAIL.test(email)) errors.email = "A valid email is required.";
  if (message.length < 20) errors.message = "Message is too short.";
  if (name.length > 200 || email.length > 320 || message.length > 5000) {
    errors.length = "Submission too large.";
  }

  if (Object.keys(errors).length) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const submission = {
    name,
    email,
    company: (body.company ?? "").trim().slice(0, 200),
    website: (body.website ?? "").trim().slice(0, 500),
    reason: (body.reason ?? "General Inquiry").trim().slice(0, 100),
    message,
    receivedAt: new Date().toISOString(),
  };

  const webhook = process.env.KOFA_CONTACT_WEBHOOK;
  if (!webhook) {
    return NextResponse.json(
      {
        error: "No delivery destination configured.",
        hint: "Set KOFA_CONTACT_WEBHOOK to enable server-side delivery.",
      },
      { status: 501 },
    );
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  } catch {
    return NextResponse.json(
      { error: "Could not deliver the message." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
