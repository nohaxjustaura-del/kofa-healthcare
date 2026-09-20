import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const MAX_RESPONSE_BYTES = 1_000_000;
const MAX_ITEMS_PER_FEED = 25;
const REQUEST_TIMEOUT_MS = 12_000;

export const FEEDS = [
  {
    id: "rivanna",
    feedUrl: "https://rivannamedical.com/category/press-releases/feed/",
    host: "rivannamedical.com",
    source: "RIVANNA",
    company: "rivanna-medical",
  },
  {
    id: "nectero",
    feedUrl: "https://necterotherapeutics.com/feed/",
    host: "necterotherapeutics.com",
    source: "Nectero Therapeutics",
    company: "nectero-medical",
  },
  {
    id: "caretaker",
    feedUrl: "https://caretakermedical.net/feed/",
    host: "caretakermedical.net",
    source: "Caretaker Medical",
    company: "caretaker-medical",
  },
];

function unwrapCdata(value) {
  return value.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1");
}

function decodeEntities(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body) => {
    const lower = body.toLowerCase();
    if (lower.startsWith("#x")) {
      const codePoint = Number.parseInt(lower.slice(2), 16);
      return isUnicodeScalar(codePoint) ? String.fromCodePoint(codePoint) : entity;
    }
    if (lower.startsWith("#")) {
      const codePoint = Number.parseInt(lower.slice(1), 10);
      return isUnicodeScalar(codePoint) ? String.fromCodePoint(codePoint) : entity;
    }
    return named[lower] ?? entity;
  });
}

export function normalizeText(value) {
  return decodeEntities(
    decodeEntities(unwrapCdata(value).replace(/<[^>]*>/g, "")),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function xmlValue(item, tag) {
  const match = item.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"),
  );
  return match ? match[1] : "";
}

function itemLink(item) {
  const value = xmlValue(item, "link");
  if (value) return normalizeText(value);
  const atomLink = item.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*\/?>(?:<\/link>)?/i);
  return atomLink ? decodeEntities(atomLink[1]).trim() : "";
}

function publishedDate(value, now) {
  const date = new Date(normalizeText(value));
  if (Number.isNaN(date.valueOf())) return null;
  const iso = date.toISOString().slice(0, 10);
  return iso <= now.toISOString().slice(0, 10) ? iso : null;
}

const TRACKING_QUERY_NAMES = new Set(["dclid", "fbclid", "gclid", "mc_cid", "mc_eid"]);

export function canonicalizeUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.port) return null;
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    url.hash = "";
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    const query = [...url.searchParams.entries()]
      .filter(([name]) => !name.toLowerCase().startsWith("utm_") && !TRACKING_QUERY_NAMES.has(name.toLowerCase()))
      .sort(([aName, aValue], [bName, bValue]) =>
        aName.localeCompare(bName) || aValue.localeCompare(bValue),
      );
    url.search = new URLSearchParams(query).toString();
    return url.href;
  } catch {
    return null;
  }
}

export function allowedUrl(value, host) {
  const url = canonicalizeUrl(value);
  return url && new URL(url).hostname === host.replace(/^www\./, "") ? url : null;
}

export function stableSlug({ company, date, title, url }) {
  const words = normalizeText(title)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
    .replace(/-+$/g, "");
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 10);
  return `${company}-${date}-${words || "announcement"}-${hash}`;
}

/** Curated URLs and slugs always win over automated feed entries. */
export function mergeCuratedNews(curated, generated) {
  const urls = new Set(
    curated.map((item) => canonicalizeUrl(item.externalUrl)).filter(Boolean),
  );
  const slugs = new Set(curated.map((item) => item.slug));
  const automated = [];
  for (const item of generated) {
    const url = canonicalizeUrl(item.url);
    if (!url || urls.has(url) || slugs.has(item.slug)) continue;
    urls.add(url);
    slugs.add(item.slug);
    automated.push({ ...item, url });
  }
  return [...curated, ...automated];
}

export function parseRss(xml, feed, now = new Date()) {
  const items = xml.match(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi) ?? [];
  const seenUrls = new Set();
  const entries = [];

  for (const rawItem of items.slice(0, MAX_ITEMS_PER_FEED)) {
    const title = normalizeText(xmlValue(rawItem, "title"));
    const url = allowedUrl(itemLink(rawItem), feed.host);
    const date = publishedDate(xmlValue(rawItem, "pubDate") || xmlValue(rawItem, "updated"), now);
    if (!title || !url || !date || seenUrls.has(url)) continue;
    seenUrls.add(url);
    entries.push({
      slug: stableSlug({ company: feed.company, date, title, url }),
      title,
      date,
      source: feed.source,
      url,
      company: feed.company,
    });
  }

  return entries;
}

function isUnicodeScalar(value) {
  return Number.isInteger(value) && value >= 0 && value <= 0x10ffff && (value < 0xd800 || value > 0xdfff);
}

async function readBoundedText(response) {
  if (!response.body) throw new Error("Feed response has no body.");
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_RESPONSE_BYTES) {
        throw new Error(`Feed response exceeded ${MAX_RESPONSE_BYTES} bytes.`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function fetchFeed(feed, { fetchImpl = fetch, now = new Date() } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(feed.feedUrl, {
      signal: controller.signal,
      headers: { accept: "application/rss+xml, application/xml, text/xml;q=0.9" },
    });
    if (!response.ok) throw new Error(`Feed returned ${response.status}.`);
    const xml = await readBoundedText(response);
    if (!/<(?:rss|feed)\b/i.test(xml)) throw new Error("Feed was not RSS or Atom XML.");
    const entries = parseRss(xml, feed, now);
    if (entries.length === 0) throw new Error("Feed had no valid items.");
    return entries;
  } finally {
    clearTimeout(timeout);
  }
}

export function emptySnapshot() {
  return {
    version: 1,
    sources: Object.fromEntries(FEEDS.map((feed) => [feed.id, []])),
  };
}

function sourceEntries(snapshot, id, feed, now) {
  const entries = Array.isArray(snapshot?.sources?.[id]) ? snapshot.sources[id] : [];
  const byUrl = new Map();
  for (const item of entries) {
    const title = typeof item?.title === "string" ? normalizeText(item.title) : "";
    const date = typeof item?.date === "string" ? publishedDate(item.date, now) : null;
    const url = allowedUrl(item?.url, feed.host);
    if (!title || !date || !url || byUrl.has(url)) continue;
    const slug = typeof item.slug === "string" && item.slug ? item.slug : stableSlug({
      company: feed.company,
      date,
      title,
      url,
    });
    byUrl.set(url, { slug, title, date, source: feed.source, url, company: feed.company });
  }
  return [...byUrl.values()];
}

export function mergeSourceEntries(previous, fresh, feed, now = new Date()) {
  const byUrl = new Map(sourceEntries({ sources: { [feed.id]: previous } }, feed.id, feed, now).map((item) => [item.url, item]));
  for (const item of fresh) {
    const existing = byUrl.get(item.url);
    byUrl.set(item.url, existing ? { ...existing, ...item, slug: existing.slug } : item);
  }
  return [...byUrl.values()].sort((a, b) => b.date.localeCompare(a.date) || a.url.localeCompare(b.url));
}

export async function refreshSnapshot(
  previous,
  { fetchImpl = fetch, now = new Date(), feeds = FEEDS } = {},
) {
  const results = await Promise.all(feeds.map(async (feed) => {
    try {
      return { feed, entries: await fetchFeed(feed, { fetchImpl, now }) };
    } catch (error) {
      return { feed, error: error instanceof Error ? error.message : String(error) };
    }
  }));
  const sources = {};
  const outages = [];
  for (const result of results) {
    const previousEntries = sourceEntries(previous, result.feed.id, result.feed, now);
    if (result.error) {
      sources[result.feed.id] = previousEntries;
      outages.push({ id: result.feed.id, message: result.error });
    } else {
      sources[result.feed.id] = mergeSourceEntries(previousEntries, result.entries, result.feed, now);
    }
  }
  return { snapshot: { version: 1, sources }, outages };
}

export async function syncNews({
  snapshotPath = fileURLToPath(new URL("../data/news.generated.json", import.meta.url)),
  fetchImpl = fetch,
  now = new Date(),
  feeds = FEEDS,
} = {}) {
  let previous = emptySnapshot();
  try {
    previous = JSON.parse(await readFile(snapshotPath, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const { snapshot, outages } = await refreshSnapshot(previous, { fetchImpl, now, feeds });
  if (outages.length === feeds.length) return { snapshot: previous, outages, allFailed: true };
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  return { snapshot, outages, allFailed: false };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { snapshot, outages, allFailed } = await syncNews();
  const count = Object.values(snapshot.sources).flat().length;
  for (const outage of outages) console.warn(`Retained ${outage.id}: ${outage.message}`);
  if (allFailed) {
    console.error("All feeds failed; the existing snapshot was preserved.");
    process.exitCode = 1;
  } else {
    console.log(`Saved ${count} automated news item${count === 1 ? "" : "s"}.`);
  }
}
