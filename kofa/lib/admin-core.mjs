import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { readFile, writeFile, rename, unlink } from "node:fs/promises";
import path from "node:path";

export const SESSION_COOKIE = "kofa-admin-session";
export const SESSION_SECONDS = 12 * 60 * 60;
export const MAX_CONTENT_BYTES = 750_000;
const CATEGORIES = ["Cardiovascular", "Women's Health", "Diagnostics", "Orthopedics", "Digital Health"];

export class AdminError extends Error {
  constructor(message, status = 422, field) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

export function authConfigured(env = process.env) {
  return (env.KOFA_ADMIN_PASSWORD?.length ?? 0) >= 16 && (env.KOFA_ADMIN_SESSION_SECRET?.length ?? 0) >= 32;
}

function sessionKey(env) {
  if (!authConfigured(env)) throw new AdminError("Admin sign-in has not been configured yet.", 503);
  return createHmac("sha256", env.KOFA_ADMIN_SESSION_SECRET).update(env.KOFA_ADMIN_PASSWORD).digest();
}

export function checkPassword(password, env = process.env) {
  if (!authConfigured(env) || typeof password !== "string" || password.length > 512) return false;
  const hash = (value) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(password), hash(env.KOFA_ADMIN_PASSWORD));
}

export function createSession(env = process.env, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ expires: now + SESSION_SECONDS * 1000 })).toString("base64url");
  const signature = createHmac("sha256", sessionKey(env)).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function validSession(value, env = process.env, now = Date.now()) {
  try {
    if (!authConfigured(env) || typeof value !== "string" || value.length > 512) return false;
    const [payload, signature, extra] = value.split(".");
    if (!payload || !signature || extra) return false;
    const expected = createHmac("sha256", sessionKey(env)).update(payload).digest();
    const supplied = Buffer.from(signature, "base64url");
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
    const { expires } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number.isSafeInteger(expires) && expires > now && expires <= now + SESSION_SECONDS * 1000;
  } catch {
    return false;
  }
}

export function sameOrigin(request) {
  const expected = new URL(request.url);
  // Next's internal request URL can use localhost behind the public Host.
  const host = request.headers.get("host");
  if (host) expected.host = host;
  return request.headers.get("origin") === expected.origin;
}

function text(input, field, max, required = false) {
  const value = input[field];
  if (value !== undefined && typeof value !== "string") throw new AdminError("Enter text in this field.", 422, field);
  const result = (value ?? "").trim();
  if (required && !result) throw new AdminError("Complete this field.", 422, field);
  if (result.length > max) throw new AdminError(`Use ${max} characters or fewer.`, 422, field);
  return result;
}

function httpsUrl(value, field) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) throw new Error();
    return url.href;
  } catch {
    throw new AdminError("Enter a complete https:// web address.", 422, field);
  }
}

function logo(value) {
  if (!value) return "";
  if (/^\/(?!\/)[a-zA-Z0-9/_ .%-]+\.(png|jpg|jpeg|webp)$/i.test(value) && !value.includes("..")) return value;
  if (value.startsWith("https://")) return httpsUrl(value, "logo");
  const match = value.match(/^data:image\/(png|jpeg|webp);base64,([a-zA-Z0-9+/]+={0,2})$/);
  if (match) {
    const bytes = Buffer.from(match[2], "base64");
    const valid = match[1] === "png" ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : match[1] === "jpeg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
    if (valid && bytes.length <= 100_000) return value;
  }
  throw new AdminError("Use a PNG, JPG or WebP logo up to 100 KB, or an https:// image address.", 422, "logo");
}

export function validateRecord(kind, input, companySlugs, now = new Date()) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new AdminError("The entry could not be read.");
  const slug = text(input, "slug", 160, true);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new AdminError("Use lowercase letters, numbers and hyphens for the page address.", 422, "slug");
  if (typeof input.published !== "boolean") throw new AdminError("Choose draft or published.", 422, "published");
  const common = { slug, published: input.published };
  if (kind === "company") {
    if (!CATEGORIES.includes(input.category)) throw new AdminError("Choose a focus area.", 422, "category");
    if (!["Active", "Exits"].includes(input.portfolioStatus)) throw new AdminError("Choose Active or Exits.", 422, "portfolioStatus");
    const year = input.investmentYear === "" || input.investmentYear == null ? undefined : Number(input.investmentYear);
    if (year !== undefined && (!Number.isInteger(year) || year < 1900 || year > now.getUTCFullYear())) throw new AdminError("Enter a valid investment year.", 422, "investmentYear");
    const aspect = Number(input.logoAspect ?? 1);
    if (!Number.isFinite(aspect) || aspect < 0.05 || aspect > 30) throw new AdminError("The logo dimensions could not be read.", 422, "logo");
    return {
      ...common, name: text(input, "name", 160, true), website: httpsUrl(text(input, "website", 2000, true), "website"),
      shortDescription: text(input, "shortDescription", 500, true), description: text(input, "description", 12000, true),
      focus: text(input, "focus", 180, true), category: input.category, portfolioStatus: input.portfolioStatus,
      status: text(input, "status", 180), location: text(input, "location", 180), investmentYear: year ?? null,
      logo: logo(text(input, "logo", 150000)), logoAspect: aspect,
      featured: Boolean(input.featured), sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 1000,
    };
  }
  if (kind !== "news") throw new AdminError("Choose a company or news article.");
  if (!["KOFA News", "Portfolio News"].includes(input.type)) throw new AdminError("Choose a news category.", 422, "type");
  const date = text(input, "date", 10, true);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new AdminError("Enter a valid publication date.", 422, "date");
  if (input.published && date > now.toISOString().slice(0, 10)) throw new AdminError("The publication date cannot be in the future. Save as a draft instead.", 422, "date");
  const company = text(input, "company", 160);
  if (company && !companySlugs.includes(company)) throw new AdminError("Choose an existing portfolio company.", 422, "company");
  if (input.type === "Portfolio News" && !company) throw new AdminError("Choose the related company.", 422, "company");
  const externalUrl = httpsUrl(text(input, "externalUrl", 2000), "externalUrl");
  const source = text(input, "source", 180);
  const body = text(input, "body", 40000);
  if (!externalUrl && !body) throw new AdminError("Add an article link or write the article below.", 422, "body");
  if (externalUrl && !source) throw new AdminError("Name the original publisher.", 422, "source");
  return { ...common, title: text(input, "title", 300, true), type: input.type, date,
    excerpt: text(input, "excerpt", 2000, true), company, externalUrl, source, body,
    subheadline: text(input, "subheadline", 500) };
}

export function mergeRecords(base, overrides, includeDrafts = false) {
  const records = new Map(base.map((record) => [record.slug, { ...record, published: true }]));
  for (const record of overrides) records.set(record.slug, { ...records.get(record.slug), ...record });
  return [...records.values()].filter((record) => includeDrafts || record.published !== false);
}

export function applyRecord(document, kind, record) {
  const key = kind === "company" ? "companies" : "news";
  const result = { ...document, [key]: [...document[key].filter((item) => item.slug !== record.slug), record] };
  if (Buffer.byteLength(JSON.stringify(result)) > MAX_CONTENT_BYTES) throw new AdminError("The content library is full. Reduce logo file sizes before saving.", 422, "logo");
  return result;
}

export function storageConfigured(env = process.env) {
  return localStorage(env) || Boolean(env.KOFA_CONTENT_GITHUB_TOKEN && /^[\w.-]+\/[\w.-]+$/.test(env.KOFA_CONTENT_REPOSITORY ?? ""));
}

const localPath = path.resolve(process.cwd(), "data/content.admin.json");
const localStorage = (env) => env.NODE_ENV !== "production" && env.KOFA_CONTENT_LOCAL === "1";
const revisionOf = (value) => createHash("sha1").update(value).digest("hex");
let localWrite = Promise.resolve();

function storage(env) {
  if (!storageConfigured(env)) throw new AdminError("Publishing has not been connected yet. Ask the site administrator to finish setup.", 503);
  const branch = env.KOFA_CONTENT_BRANCH || "main";
  const endpoint = `https://api.github.com/repos/${env.KOFA_CONTENT_REPOSITORY}/contents/kofa/data/content.admin.json`;
  const headers = { authorization: `Bearer ${env.KOFA_CONTENT_GITHUB_TOKEN}`, accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  return { branch, endpoint, headers };
}

export async function readContent({ env = process.env, fetchImpl = fetch, cached = false } = {}) {
  if (localStorage(env)) {
    const value = await readFile(localPath, "utf8");
    return { document: JSON.parse(value), revision: revisionOf(value) };
  }
  const { branch, endpoint, headers } = storage(env);
  const response = await fetchImpl(`${endpoint}?ref=${encodeURIComponent(branch)}`, {
    headers, signal: AbortSignal.timeout(12000),
    ...(cached ? { next: { revalidate: 60, tags: ["kofa-content"] } } : { cache: "no-store" }),
  });
  if (!response.ok) throw new AdminError("The content library could not be loaded. Try again shortly.", 502);
  const file = await response.json();
  if (file.encoding !== "base64" || typeof file.sha !== "string" || typeof file.content !== "string" || file.size > MAX_CONTENT_BYTES) throw new AdminError("The content library has an unsupported format.", 502);
  let document;
  try { document = JSON.parse(Buffer.from(file.content, "base64").toString("utf8")); } catch { throw new AdminError("The content library could not be read.", 502); }
  if (document.version !== 1 || !Array.isArray(document.companies) || !Array.isArray(document.news)) throw new AdminError("The content library has an unsupported format.", 502);
  return { document, revision: file.sha };
}

export async function writeContent(document, revision, { env = process.env, fetchImpl = fetch } = {}) {
  if (typeof revision !== "string" || !/^[a-f0-9]{40}$/.test(revision)) throw new AdminError("Reload the content library before saving.", 409);
  const serialized = `${JSON.stringify(document, null, 2)}\n`;
  if (Buffer.byteLength(serialized) > MAX_CONTENT_BYTES) throw new AdminError("The content library is full. Reduce logo file sizes before saving.", 422, "logo");
  if (localStorage(env)) {
    const save = localWrite.catch(() => {}).then(async () => {
      if (revisionOf(await readFile(localPath, "utf8")) !== revision) throw new AdminError("Another partner updated the site. Reload the entry before saving.", 409);
      const temporary = `${localPath}.${process.pid}.tmp`;
      try { await writeFile(temporary, serialized); await rename(temporary, localPath); }
      finally { await unlink(temporary).catch(() => {}); }
      return revisionOf(serialized);
    });
    localWrite = save;
    return save;
  }
  const { branch, endpoint, headers } = storage(env);
  const response = await fetchImpl(endpoint, { method: "PUT", headers, signal: AbortSignal.timeout(12000),
    body: JSON.stringify({ branch, sha: revision, message: "Update KOFA website content from partner admin", content: Buffer.from(serialized).toString("base64") }) });
  if (response.status === 409 || response.status === 422) throw new AdminError("Another partner updated the site. Reload the list before saving; your form has been kept.", 409);
  if (!response.ok) throw new AdminError("The changes could not be saved. Your form has been kept; try again shortly.", 502);
  const result = await response.json();
  return result.content.sha;
}
