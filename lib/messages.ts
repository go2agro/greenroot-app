import messagesConfig from '@/config/ui/messages.json'

export type MessageType = 'success' | 'error' | 'loading' | 'confirm'

export function getMessage(type: MessageType, key: string): string {
  const messages = messagesConfig[type] as Record<string, string>
  return messages[key] ?? messagesConfig.error.generic
}

export function getAuthErrorMessage(
  errorMessage: string | undefined,
  fallbackKey: string
): string {
  const message = errorMessage?.toLowerCase() ?? ''

  if (message.includes('rate limit') || message.includes('too many requests')) {
    return getMessage('error', 'emailRateLimit')
  }

  if (message.includes('already registered') || message.includes('already exists')) {
    return getMessage('error', 'emailExists')
  }

  return errorMessage || getMessage('error', fallbackKey)
}

export const messages = messagesConfig
