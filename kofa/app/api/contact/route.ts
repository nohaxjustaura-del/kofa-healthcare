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

/* ---------------------------------------------------------------------------
   Rate limiting.

   This is an unauthenticated write endpoint, and the moment KOFA_CONTACT_WEBHOOK
   is set it becomes a live relay into KOFA's inbox. Something has to sit in
   front of it, so: a Map in module scope, counting submissions per source IP.

   Be honest about what this is. Module scope on Vercel means *per warm
   instance*: the counters do not survive a cold start, and concurrent
   instances each keep their own, so the real ceiling under load is
   RATE_LIMIT_MAX x however many instances happen to be warm. That is enough to
   stop a single script hammering the form from one address, which is the abuse
   that actually shows up. It is not a defence against anyone determined or
   distributed. If abuse ever materialises, the upgrade path is a durable
   store keyed the same way — Upstash/Vercel KV, Redis, whatever is already in
   the stack — not a bigger Map.

   The threshold is deliberately far above anything a real visitor reaches. A
   person writing to a fund sends one message, or two if the first bounced off a
   validation error; nobody legitimately sends six in ten minutes.
--------------------------------------------------------------------------- */

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/* Sweep the whole Map once it passes this many keys. Without a sweep the Map
   is append-only for the life of the instance: one entry per distinct IP,
   forever, which on a long-lived warm instance is an unbounded leak. Sweeping
   on a threshold rather than on every request keeps the common case O(1). */
const RATE_LIMIT_SWEEP_AT = 1_000;

/* And if a sweep cannot get the Map back under this, drop it entirely. That
   only happens under genuinely heavy distributed traffic, where the counters
   are worthless anyway; better to reset and stay small than to hold a large
   Map that is no longer protecting anything. */
const RATE_LIMIT_HARD_CAP = 5_000;

const hits = new Map<string, number[]>();

/** Best-effort client identity. Vercel always sets x-forwarded-for at the edge;
 *  the first entry is the client, the rest are proxies. Anything unattributable
 *  shares a single bucket, which is the safe direction to fail. */
function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;

  if (hits.size > RATE_LIMIT_SWEEP_AT) {
    for (const [k, stamps] of hits) {
      const live = stamps.filter((t) => t > cutoff);
      if (live.length) hits.set(k, live);
      else hits.delete(k);
    }
    if (hits.size > RATE_LIMIT_HARD_CAP) hits.clear();
  }

  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);
  if (recent.length >= RATE_LIMIT_MAX) {
    // Re-store the pruned list so the entry still ages out on its own.
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);
  return false;
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (body.company_url) {
    // Silently accept and drop obvious bots. This branch was unreachable for a
    // long time — ContactForm never rendered or sent a company_url field, so
    // the honeypot was a comment rather than a defence. The form now ships the
    // field (off-screen, tabIndex={-1}, aria-hidden), so keep the two in step:
    // if you ever remove the input, remove this too rather than leaving the
    // shape of a check that nothing can trip.
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

  /* Only submissions that would actually be relayed are counted, so the mailto
     fallback path above stays open on deployments with no webhook configured.
     Placed after validation for the same reason: a 422 relays nothing and
     should not burn a visitor's allowance while they fix a typo. */
  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      {
        error:
          "Too many messages from this connection. Please wait a few minutes, or email us directly.",
      },
      { status: 429 },
    );
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
      /* Without this, a webhook that accepts the connection and then hangs
         holds the whole serverless invocation open until Vercel's function
         timeout kills it, and the visitor sits watching a "Sending…" button
         that never resolves. Eight seconds is generous for a JSON POST to a
         CRM or mail provider; past that, the fallback below is a better answer
         than an indefinite wait. The abort surfaces as a throw, which the catch
         already turns into the 502 the client knows how to handle. */
      signal: AbortSignal.timeout(8000),
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
