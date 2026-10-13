// Optional integration check against the isolated local-development server.
// Never points at production and restores the original content file afterward.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const origin = "http://127.0.0.1:3200";
const snapshot = new URL("../data/content.admin.json", import.meta.url);
const original = await readFile(snapshot, "utf8");
let cookie = "";
const request = (path, options = {}) => fetch(`${origin}${path}`, { ...options, headers: { origin, "Content-Type": "application/json", ...(cookie ? { cookie } : {}), ...options.headers }, signal: AbortSignal.timeout(60000) });
const page = async (path) => { const response = await request(path); return { status: response.status, html: await response.text() }; };
const company = { slug: "local-integration-test-company", name: "Integration Test Company (local only)", website: "https://example.com", category: "Diagnostics", portfolioStatus: "Active", focus: "Local integration test", shortDescription: "Synthetic company for isolated verification.", description: "Synthetic content used only in the local development test.", logo: "", logoAspect: 1, sortOrder: 100, published: false, featured: false };
const article = { slug: "local-integration-test-news", title: "Local integration test article", type: "KOFA News", date: "2026-10-13", excerpt: "Synthetic news for isolated verification.", body: "Synthetic article body.\n\nSecond paragraph.", company: company.slug, published: true };

try {
  assert.equal((await request("/api/admin/content")).status, 401);
  assert.equal((await request("/api/admin/session", { method: "POST", headers: { origin: "https://attacker.example" }, body: JSON.stringify({ password: "wrong" }) })).status, 403);
  const login = await request("/api/admin/session", { method: "POST", body: JSON.stringify({ password: "local-preview-partner-password" }) });
  assert.equal(login.status, 200, "Start npm run dev with the documented local preview settings.");
  const setCookie = login.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=strict/i);
  cookie = setCookie.split(";")[0];
  let library = await (await request("/api/admin/content")).json();
  assert.ok(library.companies.some((entry) => entry.slug === "axon-therapies"));
  let revision = library.revision;
  const save = async (kind, record, create, expectedRevision = revision) => {
    const response = await request("/api/admin/content", { method: "POST", body: JSON.stringify({ kind, record, create, revision: expectedRevision }) });
    const body = await response.json();
    if (response.ok) revision = body.revision;
    return { status: response.status, body };
  };
  assert.equal((await save("company", company, true)).status, 200);
  assert.equal((await page(`/portfolio/${company.slug}`)).status, 404);
  assert.equal((await save("company", { ...company, published: true }, false)).status, 200);
  let profile = await page(`/portfolio/${company.slug}`);
  assert.equal(profile.status, 200);
  assert.ok(profile.html.includes(company.name));
  assert.ok((await page("/portfolio")).html.includes(company.name));
  assert.ok((await page("/")).html.includes(company.name));
  assert.equal((await save("news", article, true)).status, 200);
  assert.ok((await page(`/portfolio/${company.slug}`)).html.includes(article.title));
  assert.ok((await page("/news")).html.includes(article.title));
  assert.equal((await page(`/news/${article.slug}`)).status, 200);
  const sitemap = (await page("/sitemap.xml")).html;
  assert.ok(sitemap.includes(`/portfolio/${company.slug}`));
  assert.ok(sitemap.includes(`/news/${article.slug}`));
  const staleRevision = revision;
  const updated = { ...company, name: "Updated Integration Test Company (local only)", portfolioStatus: "Exits", published: true };
  assert.equal((await save("company", updated, false)).status, 200);
  assert.equal((await save("company", { ...updated, name: "Overwrite attempt" }, false, staleRevision)).status, 409);
  assert.ok((await page(`/news/${article.slug}`)).html.includes(updated.name));
  assert.equal((await save("news", { ...article, published: false }, false)).status, 200);
  assert.equal((await page(`/news/${article.slug}`)).status, 404);
  assert.equal((await save("company", { ...updated, published: false }, false)).status, 200);
  assert.equal((await page(`/portfolio/${company.slug}`)).status, 404);
  assert.ok((await page("/portfolio/axon-therapies")).html.includes("Axon Therapies closes $32M"));
  assert.ok((await page("/portfolio/eyenuk")).html.includes("Top HealthTech Companies of 2026"));
  assert.ok((await page("/portfolio/marrow-access")).html.includes("No news updates have been added"));
  assert.equal((await request("/api/admin/session", { method: "DELETE" })).status, 200);
  console.log("Passed: sign-in boundaries, persistent drafts/publishing, portfolio/homepage/news/sitemap integration, conflict rejection, draft removal, Axon/Eyenuk news and Marrow Access empty state.");
} finally {
  await writeFile(snapshot, original);
}
