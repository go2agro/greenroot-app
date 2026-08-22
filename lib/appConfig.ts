import config from '@/config/appConfig.json'

export function getConfig(key: keyof typeof config) {
  return config[key]
}

export const appConfig = config

export const MAX_FILE_UPLOAD_MB = appConfig.max_file_upload_mb
export const MAX_FILE_UPLOAD_BYTES = MAX_FILE_UPLOAD_MB * 1024 * 1024
export const MAX_FILE_UPLOAD_ERROR = `File must be under ${MAX_FILE_UPLOAD_MB} MB`
export const APPLICATION_STEPS_COUNT = appConfig.application_steps_count
export const ITEMS_PER_PAGE = appConfig.items_per_page