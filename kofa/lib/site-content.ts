import "server-only";
import { cache } from "react";
import fallback from "@/data/content.admin.json";
import { team } from "@/data/team";
import { portfolio, type PortfolioCompany } from "@/data/portfolio";
import { allNews, canonicalNewsUrl, type NewsItem } from "@/data/news";
import { mergeRecords, readContent, storageConfigured, type ContentDocument } from "./admin-core.mjs";
import { approvedNewsUrl } from "./news-sources.mjs";

export function resolveContent(document: ContentDocument, includeDrafts = false) {
  const companies = mergeRecords(portfolio, document.companies as unknown as Partial<PortfolioCompany>[], includeDrafts)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  // A manual record wins over an automated copy of the same announcement.
  const news = mergeRecords(allNews, document.news, includeDrafts);
  const overriddenSlugs = new Set(document.news.map((item) => item.slug));
  const manualUrls = new Set(document.news.filter((item) => item.published).map((item) => canonicalNewsUrl(item.externalUrl)).filter(Boolean));
  const websites = new Map(companies.map((company) => [company.slug, company.website]));
  const entries = news
    .filter((item) => overriddenSlugs.has(item.slug) || !item.externalUrl || !manualUrls.has(canonicalNewsUrl(item.externalUrl)))
    // Only official company sites and wire releases are linked; see news-sources.
    .filter((item) => !item.externalUrl || approvedNewsUrl(item.externalUrl, { company: item.company, website: item.company ? websites.get(item.company) : "" }));
  return { companies, news: entries as NewsItem[], team: mergeRecords(team, document.team ?? [], includeDrafts).sort((a, b) => a.sortOrder - b.sortOrder) };
}

export const getSiteContent = cache(async () => {
  if (!storageConfigured()) return resolveContent(fallback as ContentDocument);
  try {
    const { document } = await readContent({ cached: true });
    return resolveContent(document);
  } catch (error) {
    // The checked-in content is also rebuilt on each successful admin commit.
    console.error("KOFA content read failed; using the deployed content snapshot.", error instanceof Error ? error.message : "Unknown error");
    return resolveContent(fallback as ContentDocument);
  }
});
