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

// UI strings
import messagesConfig from '@/config/ui/messages.json'

// Types for better autocomplete
export type AppConfig = typeof appConfig
export type ContactConfig = typeof contactConfig
export type LandingConfig = typeof landingConfig
export type MessagesConfig = typeof messagesConfig

// Unified config object
export const config = {
  app: appConfig,
  contact: contactConfig,
  landing: landingConfig,
  messages: messagesConfig,
} as const

// Individual exports for convenience
export { appConfig, contactConfig, landingConfig, messagesConfig }

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
