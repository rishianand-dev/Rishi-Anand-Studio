import { MetadataRoute } from 'next';
import { getProjectsUncached, getSeoSettingsUncached } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, seo] = await Promise.all([
    getProjectsUncached(),
    getSeoSettingsUncached(),
  ]);

  const baseUrl = seo.canonicalUrl?.replace(/\/$/, '') || 'https://your-portfolio.dev';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/#work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#experience`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // Optionally add individual project slugs if you add project detail pages later
  // const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
  //   url: `${baseUrl}/work/${p.slug}`,
  //   lastModified: new Date(p.createdAt),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.8,
  // }));

  return staticRoutes;
}

