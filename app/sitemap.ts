import type { MetadataRoute } from 'next'
import { getAllInternships } from '@/lib/internships'
import { SITE_URL } from '@/lib/site-metadata'

type SitemapEntry = MetadataRoute.Sitemap[number]

const STATIC_PAGES: Array<{
  path: string
  changeFrequency: SitemapEntry['changeFrequency']
  priority: number
}> = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/internships', changeFrequency: 'daily', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/gallery', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/login', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/signup', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  const { data: internships } = await getAllInternships()
  const internshipRoutes: MetadataRoute.Sitemap = (internships ?? []).map((internship) => ({
    url: `${SITE_URL}/internships/${internship.id}`,
    lastModified: internship.updated_at
      ? new Date(internship.updated_at)
      : internship.created_at
        ? new Date(internship.created_at)
        : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...internshipRoutes]
}
