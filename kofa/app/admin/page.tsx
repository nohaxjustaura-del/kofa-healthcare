import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPortal } from "@/components/admin/AdminPortal";
import { authConfigured, SESSION_COOKIE, storageConfigured, validSession } from "@/lib/admin-core.mjs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Partner admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  // Keep partner editing on the existing configured portal until SFP hosts
  // the backend. Credentials and session cookies stay on that origin.
  if (!authConfigured() && process.env.VERCEL_ENV === "production") {
    const host = (await headers()).get("host")?.split(":")[0];
    if (host && host !== "kofa-healthcare-nine.vercel.app") {
      redirect("https://kofa-healthcare-nine.vercel.app/admin");
    }
  }
  const jar = await cookies();
  return <AdminPortal signedIn={validSession(jar.get(SESSION_COOKIE)?.value)} configured={authConfigured()} publishingConnected={storageConfigured()} />;
}
