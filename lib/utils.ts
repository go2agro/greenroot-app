import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ApplicationTimestampFields = {
  status: string
  started_at?: string
  submitted_at?: string
  decided_at?: string
  accepted_at?: string
  updated_at?: string
}

export function getApplicationStatusTimestamp(application: ApplicationTimestampFields) {
  let timestamp: string | undefined

  switch (application.status) {
    case 'draft':
      timestamp = application.started_at
      break
    case 'submitted':
    case 'under_review':
      timestamp = application.submitted_at
      break
    case 'approved':
    case 'rejected':
      timestamp = application.decided_at
      break
    case 'accepted':
      timestamp = application.accepted_at
      break
    case 'closed':
      timestamp = application.updated_at
      break
    default:
      timestamp = application.updated_at
  }

  if (!timestamp) return 'N/A'

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
