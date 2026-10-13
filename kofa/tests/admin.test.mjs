import assert from "node:assert/strict";
import test from "node:test";
import { authConfigured, checkPassword, createSession, validSession, SESSION_SECONDS, sameOrigin, validateRecord, mergeRecords, applyRecord, readContent, writeContent, storageConfigured } from "../lib/admin-core.mjs";

const env = { KOFA_ADMIN_PASSWORD: "test-only-partner-password", KOFA_ADMIN_SESSION_SECRET: "test-only-session-signing-secret-long-enough", KOFA_CONTENT_GITHUB_TOKEN: "test-only-token", KOFA_CONTENT_REPOSITORY: "test-owner/test-repo" };
const now = new Date("2026-10-13T12:00:00Z");
const company = { slug: "test-company", name: "Test company", website: "https://example.com", category: "Diagnostics", portfolioStatus: "Active", focus: "Diagnostics", shortDescription: "A test description.", description: "A complete test description.", logo: "", logoAspect: 1, published: true, sortOrder: 17, featured: false };
const news = { slug: "test-article", title: "Test article", type: "KOFA News", date: "2026-10-13", excerpt: "A test article summary.", body: "A test article body.", company: "test-company", published: true };
const document = { version: 1, companies: [], news: [] };
const revision = "a".repeat(40);

test("sign-in fails closed, compares the password, expires sessions, and rejects forged or rotated sessions", () => {
  assert.equal(authConfigured({}), false);
  assert.equal(checkPassword(env.KOFA_ADMIN_PASSWORD, {}), false);
  assert.equal(checkPassword("wrong", env), false);
  assert.equal(checkPassword(env.KOFA_ADMIN_PASSWORD, env), true);
  const session = createSession(env, now.valueOf());
  assert.equal(validSession(session, env, now.valueOf() + 1), true);
  assert.equal(validSession(session, env, now.valueOf() + SESSION_SECONDS * 1000), false);
  assert.equal(validSession(`${session}x`, env, now.valueOf()), false);
  assert.equal(validSession(session, { ...env, KOFA_ADMIN_PASSWORD: "a-different-partner-password" }, now.valueOf()), false);
  assert.equal(validSession(session, { ...env, KOFA_ADMIN_SESSION_SECRET: "a-different-session-signing-secret-long-enough" }, now.valueOf()), false);
  assert.equal(storageConfigured({ NODE_ENV: "production", KOFA_CONTENT_LOCAL: "1" }), false);
});

test("mutations require the same website origin", () => {
  assert.equal(sameOrigin(new Request("https://kofa.example/api/admin/content", { headers: { origin: "https://kofa.example" } })), true);
  assert.equal(sameOrigin(new Request("https://kofa.example/api/admin/content", { headers: { origin: "https://attacker.example" } })), false);
  assert.equal(sameOrigin(new Request("https://kofa.example/api/admin/content")), false);
  assert.equal(sameOrigin(new Request("https://internal.example/api/admin/content", { headers: { host: "kofa.example", origin: "https://kofa.example" } })), true);
  assert.equal(sameOrigin(new Request("https://internal.example/api/admin/content", { headers: { host: "kofa.example", origin: "https://attacker.example" } })), false);
});

test("company validation accepts logo-free entries and rejects unsafe addresses, images and invalid statuses", () => {
  assert.equal(validateRecord("company", company, [], now).name, "Test company");
  for (const fields of [{ website: "javascript:alert(1)" }, { logo: "data:image/svg+xml;base64,PHN2Zz4=" }, { logo: "//attacker.example/logo.png" }, { category: "Unknown" }, { portfolioStatus: "Unknown" }, { logoAspect: 0 }, { investmentYear: 2100 }]) {
    assert.throws(() => validateRecord("company", { ...company, ...fields }, [], now));
  }
});

test("news validation checks publication dates, company relationships and external source attribution", () => {
  assert.equal(validateRecord("news", news, [company.slug], now).body, news.body);
  for (const fields of [{ date: "2026-02-30" }, { date: "2026-10-14" }, { company: "missing-company" }, { type: "Portfolio News", company: "" }, { externalUrl: "https://example.com/article", source: "" }, { body: "", externalUrl: "" }]) {
    assert.throws(() => validateRecord("news", { ...news, ...fields }, [company.slug], now));
  }
  assert.equal(validateRecord("news", { ...news, date: "2026-10-14", published: false }, [company.slug], now).published, false);
});

test("manual overrides preserve approved company media and drafts disappear from public records", () => {
  const base = { ...company, media: { kind: "image", src: "/portfolio/test.png" } };
  const edited = { ...company, name: "Updated company" };
  const merged = mergeRecords([base], [edited]);
  assert.equal(merged[0].media.src, base.media.src);
  assert.equal(merged[0].name, "Updated company");
  assert.deepEqual(mergeRecords([base], [{ ...edited, published: false }]), []);
  assert.equal(mergeRecords([base], [{ ...edited, published: false }], true).length, 1);
  const saved = applyRecord(applyRecord(document, "company", company), "news", news);
  assert.equal(saved.companies.length, 1);
  assert.equal(saved.news[0].company, saved.companies[0].slug);
});

test("persistent writes include the saved revision and refuse concurrent edits or source outages", async () => {
  const encoded = Buffer.from(JSON.stringify(document)).toString("base64");
  const loaded = await readContent({ env, fetchImpl: async () => new Response(JSON.stringify({ encoding: "base64", content: encoded, sha: revision, size: encoded.length })) });
  assert.equal(loaded.revision, revision);
  assert.deepEqual(loaded.document, document);
  let written;
  const nextRevision = await writeContent(applyRecord(document, "company", company), revision, { env, fetchImpl: async (url, options) => {
    assert.equal(url, "https://api.github.com/repos/test-owner/test-repo/contents/kofa/data/content.admin.json");
    written = JSON.parse(options.body);
    return new Response(JSON.stringify({ content: { sha: "b".repeat(40) } }));
  } });
  assert.equal(nextRevision, "b".repeat(40));
  assert.equal(written.sha, revision);
  assert.equal(JSON.parse(Buffer.from(written.content, "base64")).companies[0].name, company.name);
  await assert.rejects(writeContent(document, revision, { env, fetchImpl: async () => new Response("conflict", { status: 409 }) }), (error) => error.status === 409);
  await assert.rejects(readContent({ env, fetchImpl: async () => new Response("offline", { status: 503 }) }), (error) => error.status === 502);
});
