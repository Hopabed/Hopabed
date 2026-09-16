import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://hopebed.in',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://hopebed.in/search',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://hopebed.in/host',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://hopebed.in/terms',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://hopebed.in/privacy',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://hopebed.in/cancellation',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://hopebed-api.mithagaris.workers.dev";
    const response = await fetch(`${API_URL}/api/properties/search`, { next: { revalidate: 3600 } });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.data)) {
        const propertyPages = data.data.map((property: { id?: string; _id?: string }) => ({
          url: `https://hopebed.in/stay/${property.id || property._id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        }));
        return [...staticPages, ...propertyPages];
      }
    }
  } catch (error) {
    console.error("Failed to fetch properties for sitemap", error);
  }

  return staticPages;
}
