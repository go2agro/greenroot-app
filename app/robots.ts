import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-metadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/student/',
        '/admin/',
        '/partner/',
        '/gr-admin-setup-x9k2',
        '/gr-dev-billing-m7q3',
        '/forgot-password',
        '/reset-password',
        '/ingest/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
