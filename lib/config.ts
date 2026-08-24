/**
 * Centralized configuration loader for all static config files.
 * 
 * Usage:
 *   import { config } from '@/lib/config'
 *   const heroText = config.landing.hero.heading
 *   const successMsg = config.messages.success.login
 * 
 * All config is loaded at build time from JSON files in /config folder.
 * To update content: edit the JSON files, redeploy.
 */

// Core app config
import appConfig from '@/config/appConfig.json'
import contactConfig from '@/config/contact.json'

// Page-specific content
import landingConfig from '@/config/pages/landing.json'
import aboutConfig from '@/config/pages/about.json'

// UI strings
import messagesConfig from '@/config/ui/messages.json'

// Types for better autocomplete
export type AppConfig = typeof appConfig
export type ContactConfig = typeof contactConfig
export type LandingConfig = typeof landingConfig
export type AboutConfig = typeof aboutConfig
export type MessagesConfig = typeof messagesConfig

// Unified config object
export const config = {
  app: appConfig,
  contact: contactConfig,
  landing: landingConfig,
  about: aboutConfig,
  messages: messagesConfig,
} as const

// Individual exports for convenience
export { appConfig, contactConfig, landingConfig, aboutConfig, messagesConfig }

// Helper functions
export function getAppConfig<K extends keyof AppConfig>(key: K): AppConfig[K] {
  return appConfig[key]
}

export function getMessage(
  type: 'success' | 'error' | 'loading' | 'confirm',
  key: string
): string {
  const messages = messagesConfig[type] as Record<string, string>
  return messages[key] || messagesConfig.error.generic
}

/** Primary support email — matches Contact page "Support" entry */
export function getPrimarySupportEmail(): string {
  const support = contactConfig.emails.find(
    (entry) => entry.label.toLowerCase() === 'support'
  )
  return support?.email ?? contactConfig.emails[0]?.email ?? ''
}

/** First listed phone — matches Contact page primary number */
export function getPrimaryPhone() {
  return contactConfig.phones[0] ?? null
}

/** Full address as a single line for footers and summaries */
export function getFormattedAddress(): string {
  return contactConfig.addressLines.join(', ')
}

export function getGmailComposeUrl(
  email?: string,
  subject = 'GreenRoot Support'
): string {
  const to = email ?? getPrimarySupportEmail()
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}`
}
