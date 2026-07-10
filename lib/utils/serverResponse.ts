export function toPlainResponse<T>(data: T | null, error: any) {
  return {
    data: data ?? null,
    error: error
      ? {
          message: error?.message || 'Something went wrong',
          code: error?.code || null,
          status: error?.status || null,
        }
      : null,
  }
}
