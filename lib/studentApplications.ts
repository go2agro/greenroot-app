"use server"

import { createClient } from './supabase'
import { createAdminClient } from './supabase-admin'
import { checkProfileCompletion } from './studentProfiles'
import { recordApplicationEvent } from '@/lib/applicationEvents'
import { createNotification } from '@/lib/notifications'
import { toPlainResponse } from '@/lib/utils/serverResponse'
import appConfig from '@/config/appConfig.json'

const ACTIVE_APPLICATION_STATUSES = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'accepted',
] as const

const MAX_APPLICATIONS = appConfig.max_applications_per_student || 5

async function assertOwnedDraftApplication(applicationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      supabase: null as Awaited<ReturnType<typeof createClient>> | null,
      user: null,
      application: null,
      error: { message: 'Not logged in' },
    }
  }

  const { data: application, error } = await supabase
    .from('applications')
    .select('id, status, student_id, internship_id')
    .eq('id', applicationId)
    .eq('student_id', user.id)
    .single()

  if (error || !application) {
    return {
      supabase,
      user,
      application: null,
      error: error || { message: 'Application not found' },
    }
  }

  if (application.status === 'rejected') {
    return {
      supabase,
      user,
      application,
      error: {
        message:
          'This application was rejected and cannot be modified. Please apply again to start a new application.',
        code: 'APPLICATION_REJECTED',
      },
    }
  }

  if (application.status !== 'draft') {
    return {
      supabase,
      user,
      application,
      error: {
        message: 'This application can no longer be edited.',
        code: 'APPLICATION_LOCKED',
      },
    }
  }

  return { supabase, user, application, error: null }
}

// ─────────────────────────────────────────
// START A NEW APPLICATION
// ─────────────────────────────────────────
export async function startApplication(internshipId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  // Check if student profile is complete
  const profileCompletion = await checkProfileCompletion()
  if (profileCompletion.data && !profileCompletion.data.isComplete) {
    return toPlainResponse(null, {
      message: `Please complete your profile before applying. Missing: ${profileCompletion.data.missingFields.join(', ')}`
    })
  }

  // Check if student has reached max applications limit
  const { count: activeCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .in('status', [...ACTIVE_APPLICATION_STATUSES])

  if (activeCount !== null && activeCount >= MAX_APPLICATIONS) {
    return toPlainResponse(null, {
      message: `You have reached the maximum limit of ${MAX_APPLICATIONS} active applications. Please wait for existing applications to be processed or withdraw one to apply again.`,
      code: 'MAX_APPLICATIONS_REACHED',
    })
  }

  // Block only if student still has an active application for this internship.
  // Rejected / withdrawn / closed applications are historical and do not block a fresh apply.
  const { data: existing } = await supabase
    .from('applications')
    .select('id, status')
    .eq('student_id', user.id)
    .eq('internship_id', internshipId)
    .in('status', [...ACTIVE_APPLICATION_STATUSES])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    return toPlainResponse(null, {
      message: 'Already applied to this internship',
      code: 'ALREADY_APPLIED',
    })
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

  if (error?.code === '23505') {
    return toPlainResponse(null, {
      message: 'Already applied to this internship',
      code: 'ALREADY_APPLIED',
    })
  }

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
    .in('status', [...ACTIVE_APPLICATION_STATUSES])
    .order('started_at', { ascending: false })
    .limit(1)
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
        id,
        title,
        subtitle,
        city,
        country,
        image_url,
        badge,
        duration_months,
        stipend_monthly,
        stipend_yearly,
        work_mode,
        start_date,
        short_description,
        long_description,
        flag_emoji
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
  const { supabase, error: accessError } = await assertOwnedDraftApplication(applicationId)
  if (!supabase || accessError) return toPlainResponse(null, accessError)

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
  const { supabase, user, error: accessError } = await assertOwnedDraftApplication(applicationId)
  if (!supabase || !user || accessError) return toPlainResponse(null, accessError)

  // Check file size (max 1MB)
  if (file.size > 1024 * 1024) {
    return toPlainResponse(null, { message: 'File size must be under 1MB' })
  }

  const isPdf =
    file.type.toLowerCase().includes('pdf') ||
    file.name.toLowerCase().endsWith('.pdf')

  if (!isPdf) {
    return toPlainResponse(null, { message: 'Only PDF files are allowed' })
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
      file_type: 'pdf',
      updated_at: new Date().toISOString()
    }, { onConflict: 'application_id,field_key' })

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// UPDATE CURRENT STEP
// ─────────────────────────────────────────
export async function updateCurrentStep(applicationId: string, stepNumber: number) {
  const { supabase, error: accessError } = await assertOwnedDraftApplication(applicationId)
  if (!supabase || accessError) return toPlainResponse(null, accessError)

  const { data, error } = await supabase
    .from('applications')
    .update({ current_step: stepNumber })
    .eq('id', applicationId)
    .eq('status', 'draft')

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// SUBMIT APPLICATION
// ─────────────────────────────────────────
export async function submitApplication(applicationId: string) {
  const { supabase, error: accessError } = await assertOwnedDraftApplication(applicationId)
  if (!supabase || accessError) return toPlainResponse(null, accessError)

  const { data, error } = await supabase
    .from('applications')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      current_step: 5
    })
    .eq('id', applicationId)
    .eq('status', 'draft')
    .select('id, status, submitted_at')
    .single()

  if (!error) {
    const adminClient = createAdminClient()
    const { data: admins } = await adminClient
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    for (const admin of admins ?? []) {
      await createNotification({
        userId: admin.id,
        type: 'new_application_received',
        title: 'New Application Received',
        message: 'A student has submitted a new internship application.',
        relatedId: applicationId,
        relatedType: 'application',
        category: 'application',
      })
    }

    await recordApplicationEvent({
      applicationId,
      eventType: 'submitted',
      actorRole: 'student',
      message: 'Application submitted by student',
    })
  }

  return toPlainResponse(data ?? { id: applicationId, status: 'submitted' }, error)
}

// ─────────────────────────────────────────
// WITHDRAW APPLICATION
// ─────────────────────────────────────────
export async function withdrawApplication(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const { data, error } = await supabase
    .from('applications')
    .update({ status: 'withdrawn' })
    .eq('id', applicationId)
    .eq('student_id', user.id)
    .in('status', ['draft', 'submitted', 'under_review', 'approved'])
    .select()
    .single()

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET APPLICATION FILE (student)
// ─────────────────────────────────────────
export async function getMyApplicationFile(filePath: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('application-documents')
    .createSignedUrl(filePath, 60 * 60)

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
    // Active = in pipeline (awaiting admin decision)
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
