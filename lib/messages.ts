import messagesConfig from '@/config/ui/messages.json'

export type MessageType = 'success' | 'error' | 'loading' | 'confirm'

export function getMessage(type: MessageType, key: string): string {
  const messages = messagesConfig[type] as Record<string, string>
  return messages[key] ?? messagesConfig.error.generic
}

export const messages = messagesConfig
