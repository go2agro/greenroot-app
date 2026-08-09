'use server'

import { createClient } from './supabase'
import { getPartnerUserId } from './partnerAuth'
import { toPlainResponse } from '@/lib/utils/serverResponse'

export async function getPartnerDashboardData() {
  const { userId, error: authError } = await getPartnerUserId()
  if (!userId) return toPlainResponse(null, authError)

  const supabase = await createClient()

  const [
    { data: applications, error: applicationsError },
    { data: partnerProfile, error: partnerProfileError },
    { data: myProfile, error: profileError },
  ] = await Promise.all([
    supabase
      .from('applications')
      .select('status')
      .eq('partner_id', userId),
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
  const approved = rows.filter((row) => row.status === 'approved').length
  const rejected = rows.filter((row) => row.status === 'rejected').length

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
