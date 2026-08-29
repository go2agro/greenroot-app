"use server"

import { createClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'

// Get my admin profile
export async function getMyAdminProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return toPlainResponse(data, error)
}

// Create my admin profile (first time)
export async function createAdminProfile(profileData: {
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
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('admin_profiles')
    .insert({ id: user.id, ...profileData })

  return toPlainResponse(data, error)
}

// Update my admin profile
export async function updateAdminProfile(profileData: {
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
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('admin_profiles')
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  return toPlainResponse(data, error)
}
