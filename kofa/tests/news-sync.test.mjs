import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  FEEDS,
  mergeCuratedNews,
  parseRss,
  refreshSnapshot,
  syncNews,
} from "../scripts/sync-news.mjs";

const now = new Date("2026-09-19T12:00:00Z");
const rivanna = FEEDS[0];

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
