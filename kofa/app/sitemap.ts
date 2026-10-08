import type { MetadataRoute } from "next";
import { portfolio } from "@/data/portfolio";
import { currentNews } from "@/data/news";
import { siteUrl } from "@/lib/metadata";

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/about", priority: 0.9 },
    { path: "/our-approach", priority: 0.9 },
    { path: "/focus-areas", priority: 0.9 },
    { path: "/portfolio", priority: 0.9 },
    { path: "/team", priority: 0.7 },
    { path: "/news", priority: 0.8 },
    { path: "/contact", priority: 0.6 },
  ].map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: r.priority,
  }));

  const companies = portfolio.map((c) => ({
    url: `${base}/portfolio/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articles = currentNews().map((n) => ({
    url: `${base}/news/${n.slug}`,
    lastModified: new Date(n.date),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...companies, ...articles];
}
