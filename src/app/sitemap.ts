import { MetadataRoute } from "next";
import { CANONICAL_DOMAIN } from "@/lib/seo";
import { AGE_GROUPS, CATEGORIES, VIDEOS } from "@/data/kiddotubeData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = CANONICAL_DOMAIN;
  const now = new Date();

  // 1. Homepage
  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: `${baseUrl}/`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1.0,
  };

  // 2. Age Group pages
  const ageEntries: MetadataRoute.Sitemap = AGE_GROUPS.map((ag) => ({
    url: `${baseUrl}/age/${ag.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // 3. Category pages
  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // 4. Video Watch pages
  const videoEntries: MetadataRoute.Sitemap = VIDEOS.map((video) => ({
    url: `${baseUrl}/watch/${video.id}`,
    lastModified: new Date(video.uploadDate),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // 5. Public Static Pages
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return [homeEntry, ...ageEntries, ...categoryEntries, ...videoEntries, ...staticEntries];
}
