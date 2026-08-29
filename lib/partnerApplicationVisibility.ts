export const PARTNER_VISIBLE_STATUSES = [
  'under_review',
  'admin_accepted',
  'forwarded_to_partner',
  'partner_review',
  'approved',
  'accepted',
] as const

export type PartnerVisibleStatus = (typeof PARTNER_VISIBLE_STATUSES)[number]

export function isPartnerVisibleApplication(application: {
  status: string
  reviewed_at?: string | null
  partner_id?: string | null
}) {
  return (
    Boolean(application.partner_id) &&
    Boolean(application.reviewed_at) &&
    PARTNER_VISIBLE_STATUSES.includes(application.status as PartnerVisibleStatus)
  )
}
