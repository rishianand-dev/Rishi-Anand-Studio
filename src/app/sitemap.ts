import { MetadataRoute } from 'next';
import { getSeoSettingsUncached } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSeoSettingsUncached();
  const baseUrl = seo.canonicalUrl?.replace(/\/$/, '') || 'https://your-portfolio.dev';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
