'use server'

import aboutConfig from '@/config/pages/about.json'

export type AboutConfig = typeof aboutConfig

/**
 * Single source for About page copy.
 * Edit config/pages/about.json when content changes.
 */
export async function getAboutContent(): Promise<AboutConfig> {
  return aboutConfig
}
