"use server"

import { createClient } from './supabase'
import { createAdminClient } from './supabase-admin'
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
    .select('first_name, last_name, email, mobile_number, university_name, degree_name, passport_number')
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

  if (existing) {
    return toPlainResponse(null, { message: 'Already applied to this internship', code: 'ALREADY_APPLIED' })
  }

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
// GET APPLICATION BY INTERNSHIP ID
// ─────────────────────────────────────────
export async function getMyApplicationByInternshipId(internshipId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const { data, error } = await supabase
    .from('applications')
    .select('id, status, submitted_at, started_at')
    .eq('student_id', user.id)
    .eq('internship_id', internshipId)
    .maybeSingle()

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// DELETE APPLICATION (draft or submitted)
// ─────────────────────────────────────────
export async function deleteStudentApplication(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const { data: application, error: fetchError } = await supabase
    .from('applications')
    .select('id, status')
    .eq('id', applicationId)
    .eq('student_id', user.id)
    .single()

  if (fetchError || !application) {
    return toPlainResponse(null, fetchError || { message: 'Application not found' })
  }

  if (!['draft', 'submitted'].includes(application.status)) {
    return toPlainResponse(null, { message: 'Only draft or submitted applications can be deleted' })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return toPlainResponse(null, { message: 'Delete is not configured. Contact support.' })
  }

  const { data: answers, error: answersFetchError } = await admin
    .from('application_answers')
    .select('file_url')
    .eq('application_id', applicationId)

  if (answersFetchError) {
    return toPlainResponse(null, answersFetchError)
  }

  const filePaths = answers
    ?.map((answer) => answer.file_url)
    .filter((path): path is string => Boolean(path)) ?? []

  if (filePaths.length > 0) {
    const { error: storageError } = await admin.storage.from('application-documents').remove(filePaths)
    if (storageError) {
      return toPlainResponse(null, storageError)
    }
  }

  const { error: deleteAnswersError } = await admin
    .from('application_answers')
    .delete()
    .eq('application_id', applicationId)

  if (deleteAnswersError) {
    return toPlainResponse(null, deleteAnswersError)
  }

  const { data: deleted, error: deleteAppError } = await admin
    .from('applications')
    .delete()
    .eq('id', applicationId)
    .eq('student_id', user.id)
    .select('id')
    .single()

  if (deleteAppError) {
    return toPlainResponse(null, deleteAppError)
  }

  if (!deleted) {
    return toPlainResponse(null, { message: 'Failed to delete application' })
  }

  return toPlainResponse({ id: applicationId }, null)
}

/** @deprecated Use deleteStudentApplication */
export async function deleteDraftApplication(applicationId: string) {
  return deleteStudentApplication(applicationId)
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
        badge,
        duration_months,
        stipend_monthly
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
        badge,
        duration_months,
        stipend_monthly
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
      current_step: 5
    })
    .eq('id', applicationId)
    .select('id, status, submitted_at')
    .single()

  return toPlainResponse(data ?? { id: applicationId, status: 'submitted' }, error)
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

// ─────────────────────────────────────────
// GET APPLICATION COUNTS BY STATUS
// ─────────────────────────────────────────
export async function getApplicationCounts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const { data, error } = await supabase
    .from('applications')
    .select('status')
    .eq('student_id', user.id)

  if (error) return toPlainResponse(null, error)

  const counts = {
    drafts: 0,
    submitted: 0,
    approved: 0,
    active: 0,
  }

  data?.forEach((app) => {
    const isInReview = app.status === 'submitted' || app.status === 'under_review'
    const isApproved = app.status === 'approved' || app.status === 'accepted'

    if (app.status === 'draft') {
      counts.drafts++
    }
    if (isInReview) {
      counts.submitted++
    }
    if (isApproved) {
      counts.approved++
    }
    // Active = in pipeline (awaiting admin decision or student offer response)
    if (isInReview || app.status === 'approved') {
      counts.active++
    }
  })

  return toPlainResponse(counts, null)
}

// ─────────────────────────────────────────
// GET ACTIVE APPLICATIONS (in pipeline — not draft, rejected, withdrawn, or closed)
// ─────────────────────────────────────────
export async function getActiveApplications() {
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
    .in('status', ['submitted', 'under_review', 'approved'])
    .order('submitted_at', { ascending: false })

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET DRAFT APPLICATIONS
// ─────────────────────────────────────────
export async function getDraftApplications() {
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
    .eq('status', 'draft')
    .order('started_at', { ascending: false })

  return toPlainResponse(data, error)
}
