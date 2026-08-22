'use client'

import { useCallback, useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

const OFFLINE_MESSAGE =
  'No internet connection. Please check your network — this message will disappear when you are back online.'

async function verifyOnline(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false
  }

  try {
    const response = await fetch('/greenroot-logo.svg', {
      method: 'HEAD',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch {
    return false
  }
}

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  const syncConnectionState = useCallback(async () => {
    const online = await verifyOnline()
    setIsOffline(!online)
  }, [])

  useEffect(() => {
    void syncConnectionState()

    const handleOffline = () => {
      setIsOffline(true)
    }

    const handleOnline = () => {
      void syncConnectionState()
    }

    const handleInteraction = () => {
      if (!navigator.onLine) {
        setIsOffline(true)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncConnectionState()
      }
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    window.addEventListener('pageshow', handleOnline)
    window.addEventListener('focus', handleOnline)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('click', handleInteraction, true)
    document.addEventListener('keydown', handleInteraction, true)

    const intervalId = window.setInterval(() => {
      void syncConnectionState()
    }, 15000)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('pageshow', handleOnline)
      window.removeEventListener('focus', handleOnline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('click', handleInteraction, true)
      document.removeEventListener('keydown', handleInteraction, true)
      window.clearInterval(intervalId)
    }
  }, [syncConnectionState])

  if (!isOffline) {
    return null
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-0 top-0 z-[9999] flex items-center justify-center gap-2 bg-[#DC2626] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-[0_2px_8px_rgba(220,38,38,0.45)] sm:text-base"
    >
      <WifiOff className="size-4 shrink-0 sm:size-5" aria-hidden="true" />
      <span>{OFFLINE_MESSAGE}</span>
    </div>
  )
}
