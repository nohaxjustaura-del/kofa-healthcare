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
  {
    id: "eyenuk",
    feedUrl: "https://www.eyenuk.com/en/resources",
    host: "eyenuk.com",
    source: "Eyenuk",
    company: "eyenuk",
    format: "eyenuk-resources",
  },
  {
    id: "venova",
    feedUrl: "https://venovamedical.com/category/press-release/feed/",
    host: "venovamedical.com",
    source: "Venova Medical",
    company: "venova-medical",
  },
  {
    id: "axena",
    feedUrl: "https://axenahealth.com/category/news/feed/",
    host: "axenahealth.com",
    source: "Axena Health",
    company: "axena-health",
  },
  {
    id: "raydiant",
    feedUrl: "https://raydiantoximetry.com/category/press-releases/feed/",
    host: "raydiantoximetry.com",
    source: "Raydiant Oximetry",
    company: "raydiant-oximetry",
  },
  {
    id: "cerapedics",
    feedUrl: "https://www.cerapedics.com/news-and-events/news",
    host: "cerapedics.com",
    source: "Cerapedics",
    company: "cerapedics",
    format: "cerapedics-news",
  },
  {
    id: "corflow", feedUrl: "https://corflow.com/news", host: "corflow.com",
    source: "CorFlow Therapeutics", company: "corflow", format: "corflow-news",
  },
  {
    id: "biospectal", feedUrl: "https://biospectal.com/wp-json/wp/v2/posts?categories=10,28&per_page=25&_fields=link,title,date,categories",
    host: "biospectal.com", source: "Biospectal", company: "biospectal", format: "wordpress-news", allowEmpty: true,
  },
  {
    id: "alydia-organon", feedUrl: "https://www.organon.com/wp-json/wp/v2/news_item/?per_page=25&search=JADA&_fields=link,title,date",
    host: "organon.com", source: "Organon", company: "alydia-health", format: "wordpress-news", titlePattern: /\b(?:jada|alydia)\b/i, allowEmpty: true,
  },
  {
    id: "alydia-laborie", feedUrl: "https://www.laborie.com/about-us/news/", host: "laborie.com",
    source: "Laborie", company: "alydia-health", format: "official-discovery", titlePattern: /\b(?:jada|alydia)\b/i, allowEmpty: true,
  },
  ...[
    ["axon", "axon-therapies", "Axon Therapies", "https://axontherapies.com/"],
    ["zafrens", "zafrens", "Zafrens", "https://www.zafrens.com/"],
    ["illumicell", "illumicell-ai", "IllumiCell AI", "https://www.illumicell.ai/"],
    ["aria", "aria-cv", "Aria CV", "https://ariacv.com/"],
    ["marrow", "marrow-access", "Marrow Access Technologies", "https://marrowaccess.com/"],
  ].map(([id, company, source, feedUrl]) => ({
    id, company, source, feedUrl, host: new URL(feedUrl).hostname.replace(/^www\./, ""),
    format: "official-discovery", allowEmpty: true,
  })),
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
  let normalized = normalizeText(value);
  // WordPress dates have no zone and represent the printed calendar date.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(normalized)) normalized += "Z";
  const date = new Date(normalized);
  if (Number.isNaN(date.valueOf())) return null;
  const iso = date.toISOString().slice(0, 10);
  return iso <= now.toISOString().slice(0, 10) ? iso : null;
}

const TRACKING_QUERY_NAMES = new Set(["dclid", "fbclid", "gclid", "mc_cid", "mc_eid"]);

export function canonicalizeUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.port || url.username || url.password) return null;
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
      ...(/\bkofa\s+healthcare\b/i.test(normalizeText(`${title} ${xmlValue(rawItem, "description")} ${xmlValue(rawItem, "content:encoded")}`)) ? { type: "KOFA News" } : {}),
    });
  }

  return entries;
}

/** Only dated news/blog cards on Eyenuk's official resources page. */
export function parseEyenukResources(html, feed, now = new Date()) {
  const entries = [];
  const seen = new Set();
  const cards = html.match(/<a\b[^>]*data-card-hover=["'](?:news|blog)["'][^>]*>[\s\S]*?<\/a>/gi) ?? [];
  for (const card of cards.slice(0, MAX_ITEMS_PER_FEED)) {
    const href = card.match(/\bhref=["']([^"']+)["']/i)?.[1];
    let url;
    try { url = allowedUrl(new URL(decodeEntities(href ?? ""), feed.feedUrl).href, feed.host); } catch { continue; }
    if (!url || !/^\/en\/(?:news|blog)\/[^/]+$/.test(new URL(url).pathname) || seen.has(url)) continue;
    const titleMarkup = card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1]
      ?? card.match(/<p\b[^>]*class=["'][^"']*heading-style-h3[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1];
    const dateMarkup = card.match(/<p\b[^>]*class=["'][^"']*text-size-small[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1];
    const title = normalizeText(titleMarkup ?? "");
    const date = publishedDate(dateMarkup ?? "", now);
    if (!title || !date) continue;
    seen.add(url);
    entries.push({ slug: stableSlug({ company: feed.company, date, title, url }), title, date, source: feed.source, url, company: feed.company });
  }
  return entries;
}

/** Dated rows on Cerapedics' official news listing (Drupal view, no feed). */
export function parseCerapedicsNews(html, feed, now = new Date()) {
  const entries = [];
  const seen = new Set();
  const rows = html.replace(/<!--[\s\S]*?-->/g, "").split(/<div\b[^>]*class=["'][^"']*\bnews__item\b[^"']*["'][^>]*>/i).slice(1);
  for (const row of rows.slice(0, MAX_ITEMS_PER_FEED)) {
    const dateMarkup = row.match(/views-field-field-publication-date[^>]*>\s*<span\b[^>]*>([\s\S]*?)<\/span>/i)?.[1];
    const link = row.match(/views-field-title[^>]*>\s*<span\b[^>]*>\s*<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!link) continue;
    let url;
    try { url = allowedUrl(new URL(decodeEntities(link[1]), feed.feedUrl).href, feed.host); } catch { continue; }
    if (!url || !/^\/news\/[^/]+$/.test(new URL(url).pathname) || seen.has(url)) continue;
    const title = normalizeText(link[2]);
    const date = publishedDate(dateMarkup ?? "", now);
    if (!title || !date) continue;
    seen.add(url);
    entries.push({ slug: stableSlug({ company: feed.company, date, title, url }), title, date, source: feed.source, url, company: feed.company });
  }
  return entries;
}


function entryFrom({ title, date, url }, feed, now) {
  title = normalizeText(typeof title === "string" ? title : "");
  date = publishedDate(typeof date === "string" ? date : "", now);
  url = allowedUrl(url, feed.host);
  if (!title || !date || !url || (feed.titlePattern && !feed.titlePattern.test(title))) return null;
  return { slug: stableSlug({ company: feed.company, date, title, url }), title, date, source: feed.source, url, company: feed.company };
}

/** Company-owned WordPress endpoints, with relevance filtering for acquirers. */
export function parseWordpressNews(json, feed, now = new Date()) {
  const posts = JSON.parse(json);
  if (!Array.isArray(posts)) throw new Error("Official news response was not a post list.");
  return posts.slice(0, MAX_ITEMS_PER_FEED).map((post) => entryFrom({ title: post.title?.rendered, date: post.date, url: post.link }, feed, now)).filter(Boolean);
}

/** CorFlow publishes dated announcements linking to its own PDF releases. */
export function parseCorflowNews(html, feed, now = new Date()) {
  const entries = [];
  const sections = html.match(/<section\b[^>]*>[\s\S]*?<\/section>/gi) ?? [];
  for (const section of sections) {
    const releaseLink = [...section.matchAll(/<a\b[^>]*href=["']([^"']+\.pdf)["'][^>]*>([\s\S]*?)<\/a>/gi)].find((match) => /press release/i.test(normalizeText(match[2])));
    const href = releaseLink?.[1];
    const title = section.match(/<h5\b[^>]*>([\s\S]*?)<\/h5>/i)?.[1];
    const rawDate = normalizeText(section.match(/class=["'][^"']*elementor-icon-list-text[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "");
    // Keep the date printed alongside this release, never the PDF upload date.
    const date = rawDate.replace(/^BREAKING NEWS:\s*/i, "").replace(/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b\s*(?:the\s*)?/i, "").replace(/(\d+)(?:st|nd|rd|th)\b/g, "$1");
    if (!href || !title) continue;
    let url;
    try { url = new URL(decodeEntities(href), feed.feedUrl).href; } catch { continue; }
    const entry = entryFrom({ title, date, url }, feed, now);
    if (entry && !entries.some((item) => item.url === entry.url)) entries.push(entry);
  }
  return entries.slice(0, MAX_ITEMS_PER_FEED);
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [match[1].toLowerCase(), decodeEntities(match[2])]));
}

/** Only dated article metadata, never a homepage's modified date or copyright. */
export function parseOfficialArticle(html, url, feed, now = new Date()) {
  const meta = Object.fromEntries((html.match(/<meta\b[^>]*>/gi) ?? []).map((tag) => attributes(tag)).map((attr) => [attr.property || attr.name, attr.content]));
  for (const script of html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) ?? []) {
    try {
      const json = JSON.parse(script.replace(/^<script\b[^>]*>/i, "").replace(/<\/script>$/i, ""));
      const objects = (Array.isArray(json) ? json : [json]).flatMap((object) => [object, ...(Array.isArray(object?.["@graph"]) ? object["@graph"] : [])]);
      for (const object of objects) {
        if (![object?.["@type"]].flat().some((type) => ["NewsArticle", "BlogPosting", "Article"].includes(type))) continue;
        const entry = entryFrom({ title: object.headline || meta["og:title"], date: object.datePublished, url }, feed, now);
        if (entry) return entry;
      }
    } catch { /* An invalid metadata block does not make a page an article. */ }
  }
  if (meta["og:type"] !== "article") return null;
  return entryFrom({ title: meta["og:title"], date: meta["article:published_time"], url }, feed, now);
}

function officialLinks(html, base, feed) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].flatMap((match) => {
    let url;
    try { url = allowedUrl(new URL(decodeEntities(match[1]), base).href, feed.host); } catch { return []; }
    if (!url || url === canonicalizeUrl(base) || /\.(?:pdf|jpg|png|webp|mp4)$/i.test(new URL(url).pathname)) return [];
    return [{ url, title: normalizeText(match[2]) }];
  });
}

const NEWS_SECTION = /(?:^|\/)(?:news|press|press-releases|newsroom|media|blog|updates|announcements)(?:\/|$)/i;

/** Same-domain redirects only. A redirect never expands the approved sources. */
async function fetchOfficialText(url, feed, fetchImpl, signal) {
  for (let redirects = 0; redirects < 5; redirects++) {
    if (!allowedUrl(url, feed.host)) throw new Error("Source address left its official domain.");
    const response = await fetchImpl(url, { signal, redirect: "manual", headers: { accept: "application/json, application/rss+xml, text/html, application/xml" } });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("Source redirect had no destination.");
      url = new URL(location, url).href;
      continue;
    }
    if (!response.ok) throw new Error(`Source returned ${response.status}.`);
    return { text: await readBoundedText(response), url };
  }
  throw new Error("Source redirected too many times.");
}

async function discoverOfficialNews(html, feed, fetchImpl, signal, now) {
  const entries = [];
  const seen = new Set([canonicalizeUrl(feed.feedUrl)]);
  // Follow declared RSS feeds, not guessed feed URLs or search engines.
  const rss = (html.match(/<link\b[^>]*>/gi) ?? []).map(attributes).filter((attr) => attr.rel === "alternate" && /(?:rss|atom)\+xml/.test(attr.type ?? ""));
  for (const attr of rss.slice(0, 2)) {
    let url;
    try { url = allowedUrl(new URL(attr.href, feed.feedUrl).href, feed.host); } catch { continue; }
    if (!url) continue;
    const response = await fetchOfficialText(url, feed, fetchImpl, signal);
    entries.push(...parseRss(response.text, feed, now).filter((item) => !feed.titlePattern || feed.titlePattern.test(item.title)));
  }
  const links = officialLinks(html, feed.feedUrl, feed);
  const sectionLinks = links.filter((link) => NEWS_SECTION.test(new URL(link.url).pathname) || /^(?:news|press|newsroom|press releases|updates)$/i.test(link.title));
  const relevant = (link) => !feed.titlePattern || feed.titlePattern.test(link.title) || /\/(?:news|press-releases|newsroom|media|blog|updates|announcements)\/?$/i.test(new URL(link.url).pathname);
  const queue = [...new Map(sectionLinks.filter(relevant).map((link) => [link.url, link])).values()];
  // Inspect up to twelve linked pages. A newsroom can add dated article links.
  for (let index = 0; index < queue.length && index < 12; index++) {
    const link = queue[index];
    if (seen.has(link.url)) continue;
    seen.add(link.url);
    const response = await fetchOfficialText(link.url, feed, fetchImpl, signal);
    const entry = parseOfficialArticle(response.text, response.url, feed, now);
    if (entry) entries.push(entry);
    else if (index < 3) {
      queue.push(...officialLinks(response.text, response.url, feed).filter((candidate) => !seen.has(candidate.url) && relevant(candidate) && (NEWS_SECTION.test(new URL(candidate.url).pathname) || candidate.title.length >= 30)));
    }
  }
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}

const HTML_PARSERS = {
  "eyenuk-resources": parseEyenukResources,
  "cerapedics-news": parseCerapedicsNews,
  "corflow-news": parseCorflowNews,
  "wordpress-news": parseWordpressNews,
};

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
    const response = await fetchOfficialText(feed.feedUrl, feed, fetchImpl, controller.signal);
    const xml = response.text;
    if (feed.format === "official-discovery") return await discoverOfficialNews(xml, feed, fetchImpl, controller.signal, now);
    if (!feed.format && !/<(?:rss|feed)\b/i.test(xml)) throw new Error("Feed was not RSS or Atom XML.");
    const entries = feed.format ? HTML_PARSERS[feed.format](xml, feed, now) : parseRss(xml, feed, now);
    if (entries.length === 0 && !feed.allowEmpty) throw new Error("Feed had no valid items.");
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
    byUrl.set(url, { slug, title, date, source: feed.source, url, company: feed.company, ...(item.type === "KOFA News" ? { type: "KOFA News" } : {}) });
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
  const checks = {};
  for (const result of results) {
    checks[result.feed.id] = {
      company: result.feed.company, source: result.feed.source, sourceUrl: result.feed.feedUrl,
      checkedAt: now.toISOString(), status: result.error ? "unavailable" : result.entries.length ? "connected" : "no-dated-news",
      items: result.entries?.length ?? 0,
      message: result.error ? "Official source could not be read. Previous articles have been retained." : result.entries.length ? "Official dated announcements are connected." : "No accessible dated announcements were found. Manual publishing is available.",
    };
    const previousEntries = sourceEntries(previous, result.feed.id, result.feed, now);
    if (result.error) {
      sources[result.feed.id] = previousEntries;
      outages.push({ id: result.feed.id, message: result.error });
    } else {
      sources[result.feed.id] = mergeSourceEntries(previousEntries, result.entries, result.feed, now);
    }
  }
  return { snapshot: { version: 1, sources, checks }, outages };
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
