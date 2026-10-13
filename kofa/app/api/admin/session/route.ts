import { NextRequest } from "next/server";
import { AdminError, authConfigured, checkPassword, createSession, sameOrigin, SESSION_COOKIE, SESSION_SECONDS } from "@/lib/admin-core.mjs";
import { adminFailure, adminResponse, boundedJson } from "@/lib/admin-http";

const attempts = new Map<string, { count: number; until: number }>();

export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) throw new AdminError("Open the admin area on this website to sign in.", 403);
    if (!authConfigured()) throw new AdminError("Admin sign-in has not been configured yet.", 503);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    if (attempts.size > 10000) throw new AdminError("Sign-in is temporarily busy. Try again in a few minutes.", 429);
    const attempt = attempts.get(ip) ?? { count: 0, until: now + 15 * 60 * 1000 };
    if (attempt.count >= 10) throw new AdminError("Too many sign-in attempts. Try again in 15 minutes.", 429);
    const { password } = await boundedJson(request, 4096);
    if (!checkPassword(password)) {
      attempts.set(ip, { ...attempt, count: attempt.count + 1 });
      throw new AdminError("That password did not match. Please try again.", 401, "password");
    }
    attempts.delete(ip);
    const response = adminResponse({ signedIn: true });
    response.cookies.set(SESSION_COOKIE, createSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_SECONDS });
    return response;
  } catch (error) { return adminFailure(error); }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return adminResponse({ error: "Open the admin area on this website to sign out." }, 403);
  const response = adminResponse({ signedIn: false });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
