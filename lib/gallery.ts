'use server'

import galleryConfig from '@/config/pages/gallery.json'

export type GalleryCategory = {
  id: string
  label: string
}

export type GalleryPhoto = {
  id: string
  src: string
  alt: string
  category: string
  featured: boolean
}

export type GalleryContent = {
  hero: {
    eyebrow: string
    heading: string
    headingHighlight: string
    description: string
    cta: { label: string; href: string }
  }
  categories: GalleryCategory[]
  photos: GalleryPhoto[]
  reviewMode?: boolean
  reviewModeNote?: string
  cta: {
    heading: string
    description: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
  }
}

/**
 * Single source for Gallery page content.
 * Edit config/pages/gallery.json or run scripts/extract-go2agro-gallery.mjs
 */
export async function getGalleryContent(): Promise<GalleryContent> {
  return galleryConfig as GalleryContent
}
