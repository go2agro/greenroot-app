'use server'

import contactConfig from '@/config/contact.json'

export type ContactPhone = {
  label: string
  display: string
  tel: string
}

export type ContactEmail = {
  label: string
  email: string
}

export type ContactHour = {
  days: string
  hours: string
}

export type ContactSocial = {
  id: 'facebook' | 'instagram' | 'x' | 'linkedin' | string
  label: string
  href: string
}

export type ContactWhatsApp = {
  label: string
  display: string
  url: string
}

export type ContactInfo = {
  pageTitle: string
  pageSubtitle: string
  responseNote: string
  officeName: string
  addressLines: string[]
  /** Paste the iframe `src` from Google Maps → Share → Embed a map */
  mapEmbedUrl: string
  mapDirectionsUrl: string
  whatsapp: ContactWhatsApp
  phones: ContactPhone[]
  emails: ContactEmail[]
  officeHours: ContactHour[]
  socials: ContactSocial[]
}

/**
 * Single source for Contact page copy.
 * Edit config/contact.json when client provides final details.
 * For the map: open the place in Google Maps → Share → Embed a map → copy the src URL into mapEmbedUrl.
 */
export async function getContactInfo(): Promise<ContactInfo> {
  return contactConfig as ContactInfo
}
