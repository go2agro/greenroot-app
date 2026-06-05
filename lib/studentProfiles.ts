import { supabase } from './supabase'

// Get my student profile
export async function getMyStudentProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { data, error }
}

// Create my student profile (first time)
export async function createStudentProfile(profileData: {
  first_name?: string
  middle_name?: string
  last_name?: string
  email?: string
  phone_number?: string
  gender?: 'male' | 'female' | 'other'
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  pincode?: string
  university_name?: string
  branch_major?: string
  degree?: string
  course_status?: 'ongoing' | 'completed'
  aadhar_number?: string
  pan_number?: string
  passport_number?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('student_profiles')
    .insert({ id: user.id, ...profileData })

  return { data, error }
}

// Update my student profile
export async function updateStudentProfile(profileData: {
  first_name?: string
  middle_name?: string
  last_name?: string
  email?: string
  phone_number?: string
  gender?: 'male' | 'female' | 'other'
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  pincode?: string
  university_name?: string
  branch_major?: string
  degree?: string
  course_status?: 'ongoing' | 'completed'
  aadhar_number?: string
  pan_number?: string
  passport_number?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('student_profiles')
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  return { data, error }
}