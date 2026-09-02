'use server'

import { createAdminClient } from './supabase'
import { generateAccountId } from './generateAccountId'
import { toPlainResponse } from '@/lib/utils/serverResponse'

export async function createPartnerAccount(details: {
  firstName: string
  middleName?: string
  lastName: string
  personalEmail?: string
  officialEmail: string
  phone?: string
  password: string
}) {
  const supabase = createAdminClient()
  const partnerId = await generateAccountId(supabase, 'PTR')

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: details.officialEmail,
      password: details.password,
      email_confirm: true,
      user_metadata: { role: 'partner' },
    })

  if (authError || !authData.user)
    return toPlainResponse(null, authError)

  const userId = authData.user.id

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        role: 'partner',
        unique_id: partnerId,
      },
      { onConflict: 'id' }
    )
    .select('id, role')
    .single()

  if (profileError || !profile) {
    return toPlainResponse(null, profileError || { message: 'Failed to create partner profile' })
  }

  const { error: partnerProfileError } = await supabase
    .from('partner_profiles')
    .insert({
      id: userId,
      first_name: details.firstName,
      middle_name: details.middleName || null,
      last_name: details.lastName,
      personal_email: details.personalEmail || null,
      official_email: details.officialEmail,
      phone_number: details.phone || null,
    })

  if (partnerProfileError)
    return toPlainResponse(null, partnerProfileError)

  // Remove stray student_profiles row created by handle_new_user trigger on auth insert
  await supabase.from('student_profiles').delete().eq('id', userId)

  return toPlainResponse({ success: true, userId, accountId: partnerId }, null)
}
