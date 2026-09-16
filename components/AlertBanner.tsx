'use client'

import { AlertCircle, Loader2, X } from 'lucide-react'

type AlertBannerProps = {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  isRetrying?: boolean
  retryLabel?: string
}

export default function AlertBanner({
  message,
  onRetry,
  onDismiss,
  isRetrying = false,
  retryLabel = 'Retry',
}: AlertBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-0 top-0 z-[9998] flex items-center gap-2 bg-[#DC2626] px-4 py-2.5 text-white shadow-[0_2px_8px_rgba(220,38,38,0.45)] sm:gap-3"
    >
      <AlertCircle className="size-4 shrink-0 sm:size-5" aria-hidden="true" />
      <span className="min-w-0 flex-1 text-center text-sm font-semibold sm:text-base">
        {message}
      </span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="shrink-0 rounded border border-white/80 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          {isRetrying ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Retrying...
            </span>
          ) : (
            retryLabel
          )}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="shrink-0 rounded p-0.5 hover:bg-white/10"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
