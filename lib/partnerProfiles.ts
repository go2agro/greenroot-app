'use server'

import { createClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'

type PartnerProfileFields = {
  first_name?: string
  last_name?: string
  official_email?: string
  phone_number?: string
  alternate_phone_number?: string
  gender?: 'male' | 'female' | 'other'
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  pincode?: string
  countries?: string[]
}

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

export async function createPartnerProfile(profileData: PartnerProfileFields) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('partner_profiles')
    .insert({ id: user.id, ...profileData })

  return toPlainResponse(data, error)
}

export async function updatePartnerProfile(profileData: PartnerProfileFields) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('partner_profiles')
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  return toPlainResponse(data, error)
}
