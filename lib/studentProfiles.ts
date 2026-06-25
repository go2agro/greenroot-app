"use server"

import { createClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'

// Get my student profile
export async function getMyStudentProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return toPlainResponse(data, error)
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('student_profiles')
    .insert({ id: user.id, ...profileData })

  return toPlainResponse(data, error)
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('student_profiles')
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// CHECK PROFILE COMPLETION
// ─────────────────────────────────────────
export async function checkProfileCompletion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse({ isComplete: false, missingFields: [] }, { message: 'Not logged in' })

  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!data) return toPlainResponse({
    isComplete: false,
    missingFields: ['Profile not created yet']
  }, error)

  // Check each required field
  const missingFields: string[] = []

  // Personal Details
  if (!data.first_name)    missingFields.push('First Name')
  if (!data.last_name)     missingFields.push('Last Name')
  if (!data.email)         missingFields.push('Email')
  if (!data.phone_number)  missingFields.push('Phone Number')
  if (!data.gender)        missingFields.push('Gender')
  if (!data.date_of_birth) missingFields.push('Date of Birth')

  // Address Details
  if (!data.address_line_1) missingFields.push('Address Line 1')
  if (!data.city)           missingFields.push('City')
  if (!data.state)          missingFields.push('State')
  if (!data.pincode)        missingFields.push('Pincode')

  // Academic Details
  if (!data.university_name) missingFields.push('University Name')
  if (!data.degree)          missingFields.push('Degree')
  if (!data.branch_major)    missingFields.push('Branch / Major')
  if (!data.course_status)   missingFields.push('Course Status')

  // Identification
  if (!data.aadhar_number)   missingFields.push('Aadhar Number')
  if (!data.passport_number) missingFields.push('Passport Number')

  return toPlainResponse({
    isComplete: missingFields.length === 0,
    missingFields
  }, null)
}