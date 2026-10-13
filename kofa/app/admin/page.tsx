import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminPortal } from "@/components/admin/AdminPortal";
import { authConfigured, SESSION_COOKIE, storageConfigured, validSession } from "@/lib/admin-core.mjs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Partner admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const jar = await cookies();
  return <AdminPortal signedIn={validSession(jar.get(SESSION_COOKIE)?.value)} configured={authConfigured()} publishingConnected={storageConfigured()} />;
}
