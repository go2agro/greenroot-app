"use server"

import { createClient } from './supabase'
import { checkProfileCompletion } from './studentProfiles'
import { toPlainResponse } from '@/lib/utils/serverResponse'

// ─────────────────────────────────────────
// START A NEW APPLICATION
// ─────────────────────────────────────────
export async function startApplication(internshipId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  // Check if student profile is complete
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('first_name, last_name, email, phone_number, university_name, degree, passport_number')
    .eq('id', user.id)
    .single()

    const profileCompletion = await checkProfileCompletion()
    if (profileCompletion.data && !profileCompletion.data.isComplete) {
      return toPlainResponse(null, {
        message: `Please complete your profile before applying. Missing: ${profileCompletion.data.missingFields.join(', ')}`
      })
    }

  // Check if already applied
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('student_id', user.id)
    .eq('internship_id', internshipId)
    .single()

  if (existing) return toPlainResponse(null, { message: 'Already applied to this internship' })

  // Create new application
  const { data, error } = await supabase
    .from('applications')
    .insert({
      student_id: user.id,
      internship_id: internshipId,
      status: 'draft',
      current_step: 1
    })
    .select()
    .single()

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET ALL MY APPLICATIONS
// ─────────────────────────────────────────
export async function getMyApplications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      internships (
        title,
        subtitle,
        city,
        country,
        image_url,
        badge
      )
    `)
    .eq('student_id', user.id)
    .order('started_at', { ascending: false })

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET SINGLE APPLICATION (with all answers)
// ─────────────────────────────────────────
export async function getMyApplicationById(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      internships (
        title,
        subtitle,
        city,
        country,
        image_url,
        badge
      ),
      application_answers (*)
    `)
    .eq('id', applicationId)
    .eq('student_id', user.id)
    .single()

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// SAVE ANSWER (text field)
// ─────────────────────────────────────────
export async function saveTextAnswer(
  applicationId: string,
  stepNumber: number,
  fieldKey: string,
  answerText: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('application_answers')
    .upsert({
      application_id: applicationId,
      step_number: stepNumber,
      field_key: fieldKey,
      answer_text: answerText,
      updated_at: new Date().toISOString()
    }, { onConflict: 'application_id,field_key' })

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// UPLOAD FILE & SAVE ANSWER
// ─────────────────────────────────────────
export async function uploadFileAnswer(
  applicationId: string,
  stepNumber: number,
  fieldKey: string,
  file: File
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  // Check file size (max 1MB)
  if (file.size > 1024 * 1024) {
    return toPlainResponse(null, { message: 'File size must be under 1MB' })
  }

  // Upload file to storage
  const filePath = `${user.id}/${applicationId}/${fieldKey}-${Date.now()}.${file.name.split('.').pop()}`

  const { error: uploadError } = await supabase.storage
    .from('application-documents')
    .upload(filePath, file)

  if (uploadError) return toPlainResponse(null, uploadError)

  // Save file url in answers table
  const { data, error } = await supabase
    .from('application_answers')
    .upsert({
      application_id: applicationId,
      step_number: stepNumber,
      field_key: fieldKey,
      file_url: filePath,
      file_name: file.name,
      file_type: file.type.includes('pdf') ? 'pdf' : 'image',
      updated_at: new Date().toISOString()
    }, { onConflict: 'application_id,field_key' })

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// UPDATE CURRENT STEP
// ─────────────────────────────────────────
export async function updateCurrentStep(applicationId: string, stepNumber: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .update({ current_step: stepNumber })
    .eq('id', applicationId)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// SUBMIT APPLICATION
// ─────────────────────────────────────────
export async function submitApplication(applicationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      current_step: 10
    })
    .eq('id', applicationId)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// ACCEPT AN OFFER
// auto withdraws all other applications
// ─────────────────────────────────────────
export async function acceptOffer(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  // Accept this application
  const { error: acceptError } = await supabase
    .from('applications')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', applicationId)

  if (acceptError) return toPlainResponse(null, acceptError)

  // Auto withdraw all other applications
  const { error: withdrawError } = await supabase
    .from('applications')
    .update({ status: 'withdrawn' })
    .eq('student_id', user.id)
    .neq('id', applicationId)

  return toPlainResponse('Offer accepted successfully', withdrawError)
}

// ─────────────────────────────────────────
// WITHDRAW APPLICATION
// ─────────────────────────────────────────
export async function withdrawApplication(applicationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .update({ status: 'withdrawn' })
    .eq('id', applicationId)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET ALL APPROVED APPLICATIONS
// (with offer letters)
// ─────────────────────────────────────────
export async function getApprovedApplications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      internships (
        title,
        subtitle,
        city,
        country,
        image_url,
        badge,
        duration_months,
        stipend_monthly
      )
    `)
    .eq('student_id', user.id)
    .eq('status', 'approved')
    .order('decided_at', { ascending: false })

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET OFFER LETTER (student)
// ─────────────────────────────────────────
export async function getMyOfferLetter(filePath: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('application-documents')
    .createSignedUrl(filePath, 60 * 60)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// CONFIRM OFFER (student accepts one)
// auto closes all other applications
// ─────────────────────────────────────────
export async function confirmOffer(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  // Accept this application
  const { error: acceptError } = await supabase
    .from('applications')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', applicationId)

  if (acceptError) return toPlainResponse(null, acceptError)

  // Auto close ALL other applications
  // (draft, submitted, under_review, approved)
  const { error: closeError } = await supabase
    .from('applications')
    .update({ status: 'closed' })
    .eq('student_id', user.id)
    .neq('id', applicationId)
    .in('status', ['draft', 'submitted', 'under_review', 'approved'])

  return toPlainResponse('Offer confirmed successfully', closeError)
}

// ─────────────────────────────────────────
// DECLINE OFFER (student declines one)
// ─────────────────────────────────────────
export async function declineOffer(applicationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .update({ status: 'closed' })
    .eq('id', applicationId)

  return toPlainResponse(data, error)
}
