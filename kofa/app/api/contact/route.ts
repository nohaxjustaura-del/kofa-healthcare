import { NextResponse } from "next/server";
import { site } from "@/data/site";

/**
 * Contact endpoint.
 * ---------------------------------------------------------------------------
 * Validates and normalises the submission, then delivers it through whichever
 * channels the deployment has configured. Both are optional and both are
 * attempted; the submission succeeds if *any* of them accepts it.
 *
 *   RESEND_API_KEY   Sends the enquiry as email through Resend's HTTP API.
 *                    Needs CONTACT_FROM_EMAIL (a verified sender on the
 *                    Resend domain) and optionally CONTACT_TO_EMAIL, which
 *                    defaults to site.email. Plain fetch, no SDK: one HTTP
 *                    POST does not justify a dependency.
 *
 *   KOFA_CONTACT_WEBHOOK
 *                    Any URL that accepts a JSON POST. The bridge to
 *                    WordPress (WPForms/Gravity Forms REST), to a CRM, to
 *                    Zapier, or to a Slack-style relay.
 *
 * Configure neither and the route returns 501, at which point the client
 * opens a pre-filled mail composer instead. That is deliberate: the form
 * never reports success for a message that was not actually delivered
 * anywhere. See .env.example.
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

/** A validated, normalised submission, as handed to the delivery channels. */
interface Submission {
  name: string;
  email: string;
  company: string;
  website: string;
  reason: string;
  message: string;
  receivedAt: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Where enquiries go when CONTACT_TO_EMAIL is not set. The published
 *  address, so a deployment that configures only RESEND_API_KEY and a sender
 *  still delivers somewhere a person reads. */
const FALLBACK_TO = site.email;

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
   store keyed the same way, Upstash/Vercel KV, Redis, whatever is already in
   the stack, not a bigger Map.

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
    // long time, ContactForm never rendered or sent a company_url field, so
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

  const submission: Submission = {
    name,
    email,
    company: (body.company ?? "").trim().slice(0, 200),
    website: (body.website ?? "").trim().slice(0, 500),
    reason: (body.reason ?? "General Inquiry").trim().slice(0, 100),
    message,
    receivedAt: new Date().toISOString(),
  };

  const webhook = process.env.KOFA_CONTACT_WEBHOOK;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  /* Resend needs a verified sender. Without one its API rejects the send, so
     treat a half-configured Resend as not configured at all rather than
     letting every submission fail at the provider. */
  const emailConfigured = Boolean(resendKey && from);

  if (!webhook && !emailConfigured) {
    return NextResponse.json(
      {
        error: "No delivery destination configured.",
        hint: "Set RESEND_API_KEY + CONTACT_FROM_EMAIL, or KOFA_CONTACT_WEBHOOK. See .env.example.",
      },
      { status: 501 },
    );
  }

  /* Only submissions that would actually be relayed are counted, so the mailto
     fallback path above stays open on deployments with no destination
     configured. Placed after validation for the same reason: a 422 relays
     nothing and should not burn a visitor's allowance while they fix a typo. */
  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      {
        error:
          "Too many messages from this connection. Please wait a few minutes, or email us directly.",
      },
      { status: 429 },
    );
  }

  /* Both destinations are attempted, and the submission is a success if
     either one accepts it. A fund that has wired up both email and a CRM
     should not lose the enquiry because the CRM happened to be down, and the
     visitor should not be told to try again when their message did in fact
     arrive in someone's inbox.

     Promise.allSettled rather than Promise.all: all() rejects on the first
     failure and leaves the other request in flight with nobody reading it. */
  const attempts: Promise<void>[] = [];
  if (emailConfigured) attempts.push(deliverEmail(submission, resendKey!, from!));
  if (webhook) attempts.push(deliverWebhook(submission, webhook));

  const results = await Promise.allSettled(attempts);
  if (results.every((r) => r.status === "rejected")) {
    /* Server-side only. The reasons can carry provider detail, and an
       unauthenticated caller has no business seeing it. */
    console.error(
      "[contact] every delivery channel failed:",
      results.map((r) => (r as PromiseRejectedResult).reason),
    );
    return NextResponse.json(
      { error: "Could not deliver the message." },
      { status: 502 },
    );
  }

  /* A partial failure still reaches KOFA, so the visitor is told it worked , 
     but it is a real operational fault and belongs in the logs. */
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[contact] a delivery channel failed:", r.reason);
    }
  }

  return NextResponse.json({ ok: true });
}

/* ---------------------------------------------------------------------------
   Delivery channels. Each rejects on failure; the caller decides what a
   failure means.

   DELIVERY_TIMEOUT_MS exists because a destination that accepts the
   connection and then hangs would otherwise hold the whole serverless
   invocation open until Vercel's function timeout kills it, with the visitor
   watching a "Sending…" button that never resolves. Eight seconds is generous
   for a JSON POST to a CRM or a mail provider; past that, the mailto fallback
   is a better answer than an indefinite wait.
--------------------------------------------------------------------------- */

const DELIVERY_TIMEOUT_MS = 8000;

async function deliverWebhook(submission: Submission, url: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
    signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
}

async function deliverEmail(
  submission: Submission,
  apiKey: string,
  from: string,
) {
  const to = process.env.CONTACT_TO_EMAIL || FALLBACK_TO;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      /* So a reply in the mail client goes to the person who wrote in rather
         than to the no-reply sender. The address is validated above. */
      reply_to: submission.email,
      subject: `${submission.reason}: ${submission.company || submission.name}`,
      text: plainTextBody(submission),
    }),
    signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend responded ${res.status} ${detail}`.trim());
  }
}

/* Deliberately text/plain, not HTML. The body is visitor-supplied, and a
   plain-text part needs no escaping to be safe, there is no markup context
   for anything in it to break out of. An HTML email here would mean
   hand-rolling entity escaping on every interpolation, which is exactly the
   kind of thing that is correct on the day it is written and wrong six months
   later. Mail clients render this perfectly well. */
function plainTextBody(s: Submission): string {
  return [
    `Name:    ${s.name}`,
    `Email:   ${s.email}`,
    s.company ? `Company: ${s.company}` : null,
    s.website ? `Website: ${s.website}` : null,
    `Reason:  ${s.reason}`,
    `Received: ${s.receivedAt}`,
    "",
    "---",
    "",
    s.message,
  ]
    .filter((line) => line !== null)
    .join("\n");
}
