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

export async function createPartnerProfile(profileData: {
  first_name?: string
  middle_name?: string
  last_name?: string
  personal_email?: string
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
  aadhar_number?: string
  pan_number?: string
  countries?: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('partner_profiles')
    .insert({ id: user.id, ...profileData })

  return toPlainResponse(data, error)
}

export async function updatePartnerProfile(profileData: {
  first_name?: string
  middle_name?: string
  last_name?: string
  personal_email?: string
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
  aadhar_number?: string
  pan_number?: string
  countries?: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('partner_profiles')
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  return toPlainResponse(data, error)
}
