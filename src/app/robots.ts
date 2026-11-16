import { MetadataRoute } from 'next';
import { getSeoSettingsUncached } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSettingsUncached();
  const baseUrl = seo.canonicalUrl?.replace(/\/$/, '') || 'https://your-portfolio.dev';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

