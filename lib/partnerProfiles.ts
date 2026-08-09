'use server'

import { createClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'

export async function getMyPartnerProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return toPlainResponse(data, error)
}
