import { NextRequest, NextResponse } from "next/server";
import { AdminError, SESSION_COOKIE, sameOrigin, validSession } from "./admin-core.mjs";

export function adminResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function requireAdmin(request: NextRequest, mutation = false) {
  if (mutation && !sameOrigin(request)) throw new AdminError("Open the admin area on this website before saving.", 403);
  if (!validSession(request.cookies.get(SESSION_COOKIE)?.value)) throw new AdminError("Your sign-in has expired. Sign in again to continue.", 401);
}

export async function boundedJson(request: Request, limit: number) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new AdminError("The request format could not be read.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new AdminError("The request was empty.", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new AdminError("This entry is too large. Reduce the logo size or article length.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new AdminError("The request could not be read.", 400); }
}

export function adminFailure(error: unknown) {
  if (error instanceof AdminError) return adminResponse({ error: error.message, field: error.field }, error.status);
  console.error("KOFA admin request failed.", error instanceof Error ? error.name : "Unknown error");
  return adminResponse({ error: "The request could not be completed. Your form has been kept; try again shortly." }, 502);
}
