'use server'

import { getPartnerDbClient } from './partnerAuth'
import { PARTNER_VISIBLE_STATUSES } from './partnerApplicationVisibility'
import { toPlainResponse } from '@/lib/utils/serverResponse'

export async function getPartnerDashboardData() {
  const { client: supabase, userId, error: authError } = await getPartnerDbClient()
  if (!supabase || !userId) return toPlainResponse(null, authError)

  const [
    { data: applications, error: applicationsError },
    { data: partnerProfile, error: partnerProfileError },
    { data: myProfile, error: profileError },
  ] = await Promise.all([
    supabase
      .from('applications')
      .select('status, partner_decision')
      .eq('partner_id', userId)
      .in('status', [...PARTNER_VISIBLE_STATUSES])
      .not('reviewed_at', 'is', null),
    supabase
      .from('partner_profiles')
      .select('first_name, last_name, official_email')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('unique_id')
      .eq('id', userId)
      .maybeSingle(),
  ])

  if (applicationsError) return toPlainResponse(null, applicationsError)
  if (partnerProfileError) return toPlainResponse(null, partnerProfileError)
  if (profileError) return toPlainResponse(null, profileError)

  const rows = applications ?? []
  const approved = rows.filter(
    (row) =>
      row.partner_decision === 'approve' ||
      row.status === 'approved' ||
      row.status === 'accepted'
  ).length
  const rejected = rows.filter(
    (row) => row.partner_decision === 'reject' || row.status === 'rejected'
  ).length

  return toPlainResponse(
    {
      stats: {
        total: rows.length,
        approved,
        rejected,
      },
      partnerProfile,
      myProfile,
    },
    null
  )
}
