'use server'

import { createAdminClient } from './supabase'
import { generateAccountId } from './generateAccountId'
import { toPlainResponse } from '@/lib/utils/serverResponse'

export async function verifySecretKey(key: string) {
  return key === process.env.ADMIN_SETUP_SECRET
}

export async function createAdminAccount(details: {
  firstName: string
  middleName?: string
  lastName: string
  personalEmail?: string
  officialEmail: string
  phone?: string
  password: string
}) {
  const supabase = createAdminClient()
  const adminId = await generateAccountId(supabase, 'ADM')

  // Step 1 - Create auth user
  const { data: authData, error: authError } = 
    await supabase.auth.admin.createUser({
      email: details.officialEmail,
      password: details.password,
      email_confirm: true,
    })

  if (authError || !authData.user) 
    return toPlainResponse(null, authError)

  const userId = authData.user.id

  // Step 2 - Ensure profiles row exists with admin role + unique_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        role: 'admin',
        unique_id: adminId,
      },
      { onConflict: 'id' }
    )
    .select('id, role')
    .single()

  if (profileError || !profile) {
    return toPlainResponse(null, profileError || { message: 'Failed to create admin profile' })
  }

  // Step 3 - Create admin_profiles row
  const { error: adminProfileError } = await supabase
    .from('admin_profiles')
    .insert({
      id: userId,
      first_name: details.firstName,
      middle_name: details.middleName || null,
      last_name: details.lastName,
      personal_email: details.personalEmail || null,
      official_email: details.officialEmail,
      phone_number: details.phone || null,
    })

  if (adminProfileError) 
    return toPlainResponse(null, adminProfileError)

  return toPlainResponse({ success: true, userId, accountId: adminId }, null)
}
