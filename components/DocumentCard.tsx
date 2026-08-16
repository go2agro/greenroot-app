"use client"

import { useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'

type SignedUrlResult = {
  data: { signedUrl?: string } | null
  error: { message?: string } | null | unknown
}

export function DocumentCard({
  label,
  filePath,
  getSignedUrl,
  subtitle,
}: {
  label: string
  filePath?: string
  getSignedUrl: (filePath: string) => Promise<SignedUrlResult>
  subtitle?: string
}) {
  const [loading, setLoading] = useState(false)
  const uploaded = Boolean(filePath?.trim())

  const handleView = async () => {
    if (!filePath?.trim()) return

    setLoading(true)
    const result = await getSignedUrl(filePath)
    setLoading(false)

    if (result.error || !result.data?.signedUrl) {
      return
    }

    window.open(result.data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className={`rounded-xl border p-4 flex items-center justify-between gap-3 ${
        uploaded ? 'border-green-200 bg-green-50' : 'border-[#EEEEEE] bg-[#FAFAFA]'
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className={`text-xs mt-0.5 ${uploaded ? 'text-green-700' : 'text-gray-400'}`}>
          {subtitle ?? (uploaded ? 'Uploaded' : 'Not uploaded')}
        </p>
      </div>
      {uploaded && (
        <button
          type="button"
          onClick={handleView}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8DC63F] hover:text-[#7DB62F] disabled:opacity-50 flex-shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
          View
        </button>
      )}
    </div>
  )
}
