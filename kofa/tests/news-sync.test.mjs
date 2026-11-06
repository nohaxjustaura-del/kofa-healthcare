import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createRequire } from "node:module";
import ts from "typescript";
import {
  FEEDS,
  fetchFeed,
  parseCorflowNews,
  parseWordpressNews,
  parseOfficialArticle,
  mergeCuratedNews,
  parseRss,
  parseEyenukResources,
  parseCerapedicsNews,
  refreshSnapshot,
  syncNews,
} from "../scripts/sync-news.mjs";
import { approvedNewsUrl } from "../lib/news-sources.mjs";

const now = new Date("2026-09-19T12:00:00Z");
const rivanna = FEEDS[0];

test("official Eyenuk cards supply dated metadata, rejecting foreign and future links", () => {
  const eyenuk = FEEDS.find((feed) => feed.id === "eyenuk");
  const card = (href, date, title = "A test update") => `<a data-card-hover="blog" href="${href}"><h3>${title}</h3><p class="text-size-small">${date}</p></a>`;
  const html = card("/en/blog/test-update", "September 18, 2026", "Eyenuk &amp; partners") + card("https://example.com/en/blog/foreign", "September 18, 2026") + card("/en/blog/future", "September 20, 2026");
  const entries = parseEyenukResources(html, eyenuk, now);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].title, "Eyenuk & partners");
  assert.equal(entries[0].date, "2026-09-18");
  assert.equal(entries[0].url, "https://eyenuk.com/en/blog/test-update");
});

test("Cerapedics news rows supply dated official links, skipping foreign, undated and future rows", () => {
  const cerapedics = FEEDS.find((feed) => feed.id === "cerapedics");
  const row = (href, date, title = "A test release") => `<div class="news__item views-row"><span class="views-field views-field-field-publication-date"><span class="field-content"><!-- debug -->\n${date}\n</span></span><span class="views-field views-field-title"><span class="field-content"><!-- debug --><a href="${href}" hreflang="en">${title}</a></span></span></div>`;
  const html = row("/news/test-release", "September 18, 2026", "Cerapedics &amp; partners") + row("https://example.com/news/foreign", "September 18, 2026") + row("/news/undated", "") + row("/news/future", "September 20, 2026");
  const entries = parseCerapedicsNews(html, cerapedics, now);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].title, "Cerapedics & partners");
  assert.equal(entries[0].date, "2026-09-18");
  assert.equal(entries[0].url, "https://cerapedics.com/news/test-release");
});

test("no announcement appears twice once feeds and curated news are merged", async () => {
  const { allNews, canonicalNewsUrl } = await loadTs("../data/news.ts");
  const urls = allNews.map((item) => canonicalNewsUrl(item.externalUrl)).filter(Boolean);
  assert.deepEqual(urls.filter((url, index) => urls.indexOf(url) !== index), []);
});

test("an explicit KOFA mention is classified as KOFA News and survives snapshot retention", async () => {
  const xml = `<rss><channel><item><title>Investment announcement</title><link>https://rivannamedical.com/investment</link><pubDate>Fri, 18 Sep 2026 10:00:00 GMT</pubDate><description><![CDATA[Investors include <b>KOFA Healthcare</b>.]]></description></item></channel></rss>`;
  const entries = parseRss(xml, rivanna, now);
  assert.equal(entries[0].type, "KOFA News");
  const { snapshot } = await refreshSnapshot({ version: 1, sources: { rivanna: entries } }, { feeds: [rivanna], now, fetchImpl: async () => { throw new Error("offline"); } });
  assert.equal(snapshot.sources.rivanna[0].type, "KOFA News");
});

test("Axon's investment remains in KOFA news and on its company page after the portfolio window", async () => {
  const filename = new URL("../data/news.ts", import.meta.url);
  const source = await readFile(filename, "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", compiled)(createRequire(filename), module, module.exports);
  const { currentNews, newsForCompany, getNews } = module.exports;
  const today = new Date("2026-10-13T12:00:00Z");
  const axon = currentNews(today).find((item) => item.slug === "axon-therapies-closes-32m-oversubscribed-series-a-and-names");
  assert.equal(axon.type, "KOFA News");
  assert.equal(axon.date, "2025-09-25");
  assert.equal(newsForCompany("axon-therapies", today).some((item) => item.slug === axon.slug), true);
  assert.equal(getNews(axon.slug, today).slug, axon.slug);
  const records = [{ ...axon, slug: "expired-portfolio", type: "Portfolio News" }, { ...axon, slug: "future-kofa", date: "2026-10-14" }];
  assert.deepEqual(currentNews(today, records), []);
});

async function loadTs(relative) {
  const filename = new URL(relative, import.meta.url);
  const compiled = ts.transpileModule(await readFile(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", compiled)(createRequire(filename), module, module.exports);
  return module.exports;
}

test("every news link and the partner override use an official company site or wire release", async () => {
  const [{ allNews }, { portfolio }] = await Promise.all([loadTs("../data/news.ts"), loadTs("../data/portfolio.ts")]);
  const overrides = JSON.parse(await readFile(new URL("../data/content.admin.json", import.meta.url), "utf8")).news;
  const websites = new Map(portfolio.map((company) => [company.slug, company.website]));
  const rejected = [...allNews, ...overrides]
    .filter((item) => item.externalUrl && !approvedNewsUrl(item.externalUrl, { company: item.company, website: websites.get(item.company) }))
    .map((item) => `${item.slug}: ${item.externalUrl}`);
  assert.deepEqual(rejected, []);
});

test("approved sources exclude LinkedIn and third-party coverage", () => {
  const corflow = { company: "corflow", website: "https://corflow.com/" };
  assert.equal(approvedNewsUrl("https://corflow.com/news/update", corflow), true);
  assert.equal(approvedNewsUrl("https://www.businesswire.com/news/home/1/en/CorFlow", corflow), true);
  assert.equal(approvedNewsUrl("https://www.organon.com/news/jada", { company: "alydia-health", website: "https://www.merck.com/" }), true);
  for (const url of ["https://www.linkedin.com/posts/corflow-update", "https://www.biospace.com/press-releases/corflow", "https://evilcorflow.com/news", "http://corflow.com/news", "https://rivannamedical.com/news"]) {
    assert.equal(approvedNewsUrl(url, corflow), false, url);
  }
});

function feedItem({ title, link, date = "Fri, 18 Sep 2026 10:00:00 GMT" }) {
  return `<rss><channel><item><title>${title}</title><link>${link}</link><pubDate>${date}</pubDate></item></channel></rss>`;
}

function priorEntry(overrides = {}) {
  return {
    slug: "durable-slug",
    title: "Prior announcement",
    date: "2026-09-01",
    source: "RIVANNA",
    url: "https://rivannamedical.com/announcement/",
    company: "rivanna-medical",
    ...overrides,
  };
}

test("parser normalizes HTML, named entities, and numeric entities into a stable entry", () => {
  const entries = parseRss(
    feedItem({
      title: "<![CDATA[<em>RIVANNA</em> &amp; partners&#8212;announce&nbsp;today]]>",
      link: "https://rivannamedical.com/press-release/",
    }),
    rivanna,
    now,
  );

  assert.equal(entries.length, 1);
  assert.equal(entries[0].title, "RIVANNA & partners—announce today");
  assert.equal(entries[0].company, "rivanna-medical");
  assert.equal(entries[0].source, "RIVANNA");
  assert.match(entries[0].slug, /^rivanna-medical-2026-09-18-rivanna-partners-announce-today-/);
});

test("parser rejects non-HTTPS, foreign-host, and future-dated links", () => {
  const xml = `<rss><channel>
    <item><title>HTTP</title><link>http://rivannamedical.com/http</link><pubDate>Fri, 18 Sep 2026 10:00:00 GMT</pubDate></item>
    <item><title>Foreign</title><link>https://example.com/foreign</link><pubDate>Fri, 18 Sep 2026 10:00:00 GMT</pubDate></item>
    <item><title>Future</title><link>https://rivannamedical.com/future</link><pubDate>Fri, 20 Sep 2026 10:00:00 GMT</pubDate></item>
  </channel></rss>`;
  assert.deepEqual(parseRss(xml, rivanna, now), []);
});

test("canonical URLs make curated records win over tracking and www variants", () => {
  const curated = [{ slug: "curated", externalUrl: "https://www.rivannamedical.com/announcement/?b=2&utm_source=mail&a=1#top" }];
  const automated = [
    { slug: "generated-repeat", url: "https://rivannamedical.com/announcement?a=1&b=2" },
    { slug: "generated-new", url: "https://rivannamedical.com/new/?fbclid=ignored" },
  ];
  const merged = mergeCuratedNews(curated, automated);
  assert.deepEqual(merged.map((item) => item.slug), ["curated", "generated-new"]);
  assert.equal(merged[1].url, "https://rivannamedical.com/new");
});

test("successful feed refresh retains rolled-off history and the original slug", async () => {
  const previous = {
    version: 1,
    sources: {
      rivanna: [
        priorEntry({ url: "https://rivannamedical.com/announcement?a=1&b=2" }),
        priorEntry({ slug: "rolled-off", title: "Older announcement", url: "https://rivannamedical.com/older/" }),
      ],
    },
  };
  const fetchImpl = async () => new Response(feedItem({
    title: "Updated announcement",
    link: "https://www.rivannamedical.com/announcement/?utm_campaign=launch&b=2&a=1#details",
  }));
  const { snapshot, outages } = await refreshSnapshot(previous, { fetchImpl, now, feeds: [rivanna] });

  assert.deepEqual(outages, []);
  assert.equal(snapshot.sources.rivanna.length, 2);
  assert.deepEqual(
    snapshot.sources.rivanna.map((item) => [item.slug, item.title, item.url]),
    [
      ["durable-slug", "Updated announcement", "https://rivannamedical.com/announcement?a=1&b=2"],
      ["rolled-off", "Older announcement", "https://rivannamedical.com/older"],
    ],
  );
});

test("malformed and empty HTTP 200 feeds retain the prior source snapshot", async () => {
  const previous = { version: 1, sources: { rivanna: [priorEntry()] } };
  for (const body of ["<html>not a feed</html>", "<rss><channel></channel></rss>"]) {
    const { snapshot, outages } = await refreshSnapshot(previous, {
      fetchImpl: async () => new Response(body),
      now,
      feeds: [rivanna],
    });
    assert.equal(outages.length, 1);
    assert.equal(snapshot.sources.rivanna[0].slug, "durable-slug");
    assert.equal(snapshot.sources.rivanna[0].url, "https://rivannamedical.com/announcement");
  }
});

test("all-source failure preserves the checked-in snapshot and reports failure", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "kofa-news-"));
  const snapshotPath = path.join(directory, "news.generated.json");
  const original = JSON.stringify({ version: 1, sources: { rivanna: [priorEntry()] } }, null, 2);
  await writeFile(snapshotPath, original);
  try {
    const result = await syncNews({
      snapshotPath,
      fetchImpl: async () => { throw new Error("offline"); },
      now,
      feeds: [rivanna],
    });
    assert.equal(result.allFailed, true);
    assert.equal(await readFile(snapshotPath, "utf8"), original);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});


test("daily sources cover every current portfolio company without accepting foreign domains", async () => {
  const { portfolio } = await loadTs("../data/portfolio.ts");
  assert.deepEqual([...new Set(FEEDS.map((feed) => feed.company))].sort(), portfolio.map((company) => company.slug).sort());
  assert.equal(new Set(FEEDS.map((feed) => feed.id)).size, FEEDS.length);
  const websites = new Map(portfolio.map((company) => [company.slug, company.website]));
  for (const feed of FEEDS) assert.ok(approvedNewsUrl(feed.feedUrl, { company: feed.company, website: websites.get(feed.company) }), feed.id);
});

test("CorFlow PDF releases use their printed release dates and reject foreign, undated and future files", () => {
  const feed = FEEDS.find((item) => item.id === "corflow");
  const section = (href, date) => `<section><span class="elementor-icon-list-text">${date}</span><h5>CorFlow trial update</h5><a href="${href}">Download full press release</a></section>`;
  const html = section("https://corflow.com/wp-content/uploads/2026/05/release.pdf", "BREAKING NEWS: Monday the 4th May 2026") + section("https://example.com/release.pdf", "May 4, 2026") + section("https://corflow.com/undated.pdf", "") + section("https://corflow.com/future.pdf", "May 4, 2027");
  const entries = parseCorflowNews(html + '<section><span class="elementor-icon-list-text">May 4, 2026</span><h5>Third-party guidelines</h5><a href="https://corflow.com/guidelines.pdf">Download guidelines</a></section>', feed, now);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].date, "2026-05-04");
});

test("acquirer feeds include only related JADA/Alydia headlines and preserve WordPress calendar dates", () => {
  const feed = FEEDS.find((item) => item.id === "alydia-organon");
  const post = (title, link = "https://organon.com/news/jada-update") => ({ title: { rendered: title }, link, date: "2026-05-04T23:30:00" });
  const entries = parseWordpressNews(JSON.stringify([post("JADA system update"), post("Unrelated financial results"), post("JADA update", "https://example.com/story")]), feed, now);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].date, "2026-05-04");
  assert.deepEqual(parseWordpressNews("[]", feed, now), []);
  assert.throws(() => parseWordpressNews("{}", feed, now));
});

test("article discovery requires published article metadata, not homepage or modification dates", () => {
  const feed = FEEDS.find((item) => item.id === "zafrens");
  const metadata = (type, date) => `<script type="application/ld+json">${JSON.stringify({ "@type": type, headline: "Official research update", ...date })}</script>`;
  assert.equal(parseOfficialArticle(metadata("NewsArticle", { datePublished: "2026-05-04T23:30:00" }), "https://zafrens.com/news/update", feed, now).date, "2026-05-04");
  assert.equal(parseOfficialArticle(metadata("WebPage", { datePublished: "2026-05-04" }), "https://zafrens.com/", feed, now), null);
  assert.equal(parseOfficialArticle(metadata("NewsArticle", { dateModified: "2026-05-04" }), "https://zafrens.com/news/update", feed, now), null);
});

test("discovery detects new official newsrooms and preserves history when no dated stories are available", async () => {
  const feed = FEEDS.find((item) => item.id === "zafrens");
  const pages = {
    [feed.feedUrl]: '<a href="/news">News</a><a href="https://example.com/news">External news</a>',
    "https://zafrens.com/news": '<a href="/news/launch">Zafrens research announcement published today</a>',
    "https://zafrens.com/news/launch": '<meta property="og:type" content="article"><meta property="og:title" content="Official launch"><meta property="article:published_time" content="2026-05-04">',
  };
  const entries = await fetchFeed(feed, { now, fetchImpl: async (url) => { assert.ok(pages[url], url); return new Response(pages[url]); } });
  assert.equal(entries.length, 1);
  const previous = { version: 1, sources: { [feed.id]: entries } };
  const { snapshot, outages } = await refreshSnapshot(previous, { now, feeds: [feed], fetchImpl: async () => new Response("<html>No public announcements</html>") });
  assert.deepEqual(outages, []);
  assert.equal(snapshot.sources[feed.id][0].slug, entries[0].slug);
  assert.equal(snapshot.checks[feed.id].status, "no-dated-news");
});

test("an official source redirect cannot fetch or import from another website", async () => {
  const feed = FEEDS.find((item) => item.id === "zafrens");
  let calls = 0;
  await assert.rejects(fetchFeed(feed, { fetchImpl: async () => { calls++; return new Response(null, { status: 302, headers: { location: "https://example.com/press" } }); } }), /official domain/);
  assert.equal(calls, 1);
});
