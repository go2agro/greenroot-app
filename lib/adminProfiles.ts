import { supabase } from './supabase'

// Get my admin profile
export async function getMyAdminProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { data, error }
}

// Create my admin profile (first time)
export async function createAdminProfile(profileData: {
  first_name?: string
  middle_name?: string
  last_name?: string
  personal_email?: string
  official_email?: string
  phone_number?: string
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('admin_profiles')
    .insert({ id: user.id, ...profileData })

  return { data, error }
}

// Update my admin profile
export async function updateAdminProfile(profileData: {
  first_name?: string
  middle_name?: string
  last_name?: string
  personal_email?: string
  official_email?: string
  phone_number?: string
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('admin_profiles')
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  return { data, error }
}