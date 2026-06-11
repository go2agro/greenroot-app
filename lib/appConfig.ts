import config from '@/config/appConfig.json'

export function getConfig(key: keyof typeof config) {
  return config[key]
}

export const appConfig = config