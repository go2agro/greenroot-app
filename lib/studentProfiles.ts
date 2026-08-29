"use server"

import { createClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'
import { MAX_FILE_UPLOAD_BYTES, MAX_FILE_UPLOAD_ERROR } from '@/lib/appConfig'

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
  mobile_number?: string
  gender?: 'male' | 'female' | 'other'
  date_of_birth?: string
  nationality?: string
  marital_status?: string
  alternate_email?: string
  alternate_phone?: string
  whatsapp_number?: string
  emergency_contact_number?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  district?: string
  state?: string
  pincode?: string
  country?: string
  college_name?: string
  university_name?: string
  degree_name?: string
  branch_specialization?: string
  aadhar_number?: string
  aadhar_front_url?: string
  aadhar_back_url?: string
  pan_number?: string
  pan_url?: string
  passport_number?: string
  passport_url?: string
  passport_photo_url?: string
  passport_expiry_date?: string
  passport_issue_date?: string
  passport_country_of_issue?: string
  driving_license_number?: string
  driving_license_url?: string
  digital_signature_url?: string
  short_bio?: string
  profile_photo_url?: string
  current_residential_address?: string
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
  mobile_number?: string
  gender?: 'male' | 'female' | 'other'
  date_of_birth?: string
  nationality?: string
  marital_status?: string
  alternate_email?: string
  alternate_phone?: string
  whatsapp_number?: string
  emergency_contact_number?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  district?: string
  state?: string
  pincode?: string
  country?: string
  college_name?: string
  university_name?: string
  degree_name?: string
  branch_specialization?: string
  aadhar_number?: string
  aadhar_front_url?: string
  aadhar_back_url?: string
  pan_number?: string
  pan_url?: string
  passport_number?: string
  passport_url?: string
  passport_photo_url?: string
  passport_expiry_date?: string
  passport_issue_date?: string
  passport_country_of_issue?: string
  driving_license_number?: string
  driving_license_url?: string
  digital_signature_url?: string
  short_bio?: string
  profile_photo_url?: string
  current_residential_address?: string
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
// UPLOAD STUDENT DOCUMENT
// ─────────────────────────────────────────
export async function uploadStudentDocument(
  file: File,
  documentType: 'passport' | 'passport_photo' | 
                'aadhar_front' | 'aadhar_back' |
                'pan' | 'driving_license' | 'digital_signature'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  if (file.size > MAX_FILE_UPLOAD_BYTES) {
    return toPlainResponse(null, { message: MAX_FILE_UPLOAD_ERROR })
  }

  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/${documentType}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('student-documents')
    .upload(filePath, file, { upsert: true })

  if (uploadError) return toPlainResponse(null, uploadError)

  const { data, error } = await supabase
    .from('student_profiles')
    .update({ [`${documentType}_url`]: filePath })
    .eq('id', user.id)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET STUDENT DOCUMENT URL (signed)
// ─────────────────────────────────────────
export async function getMyStudentDocumentUrl(filePath: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('student-documents')
    .createSignedUrl(filePath, 60 * 60)

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
  if (!data.first_name)      missingFields.push('First Name')
  if (!data.last_name)       missingFields.push('Last Name')
  if (!data.gender)          missingFields.push('Gender')
  if (!data.date_of_birth)   missingFields.push('Date of Birth')
  if (!data.nationality)     missingFields.push('Nationality')
  if (!data.marital_status)  missingFields.push('Marital Status')

  // Contact Details
  if (!data.email)                     missingFields.push('Email')
  if (!data.mobile_number)             missingFields.push('Mobile Number')
  if (!data.emergency_contact_number)  missingFields.push('Emergency Contact Number')

  // Address Details
  if (!data.country)        missingFields.push('Country')
  if (!data.state)          missingFields.push('State')
  if (!data.city)           missingFields.push('City')
  if (!data.address_line_1) missingFields.push('Address Line 1')
  if (!data.pincode)        missingFields.push('Pincode')

  // Identity Documents
  if (!data.passport_number)       missingFields.push('Passport Number')
  if (!data.aadhar_number)         missingFields.push('Aadhar Number')
  if (!data.pan_number)            missingFields.push('PAN Number')

  // Academic Details
  if (!data.university_name)        missingFields.push('University Name')
  if (!data.college_name)           missingFields.push('College Name')
  if (!data.degree_name)            missingFields.push('Degree Name')
  if (!data.branch_specialization)  missingFields.push('Branch Specialization')

  const totalRequiredFields = 21
  const completionPercentage = Math.round(
    ((totalRequiredFields - missingFields.length) / totalRequiredFields) * 100
  )

  return toPlainResponse({
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
  }, null)
}