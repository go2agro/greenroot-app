import { supabase } from './supabase'
import { getPostHogClient } from './posthog-server'

// ─────────────────────────────────────────
// GET ALL APPLICATIONS (with filters)
// ─────────────────────────────────────────
export async function getAllApplications(filters?: {
  search?: string         // search by student name
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn' | 'accepted'
  internship_id?: string
  student_id?: string
}) {
  let query = supabase
    .from('applications')
    .select(`
      *,
      internships (
        title,
        city,
        country,
        badge
      ),
      student_profiles (
        first_name,
        last_name,
        email,
        university_name,
        degree
      )
    `)
    .order('started_at', { ascending: false })

  if (filters?.status)        query = query.eq('status', filters.status)
  if (filters?.internship_id) query = query.eq('internship_id', filters.internship_id)
  if (filters?.student_id)    query = query.eq('student_id', filters.student_id)

  const { data, error } = await query

  // Filter by student name search (client side)
  if (filters?.search && data) {
    const search = filters.search.toLowerCase()
    const filtered = data.filter((app: any) =>
      app.student_profiles?.first_name?.toLowerCase().includes(search) ||
      app.student_profiles?.last_name?.toLowerCase().includes(search) ||
      app.student_profiles?.email?.toLowerCase().includes(search)
    )
    return { data: filtered, error }
  }

  return { data, error }
}

// ─────────────────────────────────────────
// GET SINGLE APPLICATION (full details)
// ─────────────────────────────────────────
export async function getApplicationById(applicationId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      internships (*),
      student_profiles (*),
      application_answers (*)
    `)
    .eq('id', applicationId)
    .single()

  return { data, error }
}

// ─────────────────────────────────────────
// MARK APPLICATION UNDER REVIEW
// ─────────────────────────────────────────
export async function markUnderReview(applicationId: string) {
  const { data, error } = await supabase
    .from('applications')
    .update({
      status: 'under_review',
      reviewed_at: new Date().toISOString()
    })
    .eq('id', applicationId)

  return { data, error }
}

// ─────────────────────────────────────────
// APPROVE APPLICATION
// ─────────────────────────────────────────
export async function approveApplication(applicationId: string, remarks?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('applications')
    .update({
      status: 'approved',
      decided_at: new Date().toISOString(),
      admin_remarks: remarks || null
    })
    .eq('id', applicationId)

  if (!error && user) {
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: user.id,
      event: 'application_approved',
      properties: {
        application_id: applicationId,
        has_remarks: !!remarks,
      },
    })
  }

  return { data, error }
}

// ─────────────────────────────────────────
// REJECT APPLICATION
// ─────────────────────────────────────────
export async function rejectApplication(applicationId: string, remarks: string) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('applications')
    .update({
      status: 'rejected',
      decided_at: new Date().toISOString(),
      admin_remarks: remarks
    })
    .eq('id', applicationId)

  if (!error && user) {
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: user.id,
      event: 'application_rejected',
      properties: {
        application_id: applicationId,
      },
    })
  }

  return { data, error }
}

// ─────────────────────────────────────────
// GET APPLICATION FILE (signed url)
// ─────────────────────────────────────────
export async function getApplicationFile(filePath: string) {
  const { data, error } = await supabase.storage
    .from('application-documents')
    .createSignedUrl(filePath, 60 * 60) // valid for 1 hour

  return { data, error }
}

// ─────────────────────────────────────────
// GET APPLICATIONS BY INTERNSHIP
// ─────────────────────────────────────────
export async function getApplicationsByInternship(internshipId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      student_profiles (
        first_name,
        last_name,
        email,
        university_name,
        degree,
        phone_number
      )
    `)
    .eq('internship_id', internshipId)
    .order('submitted_at', { ascending: false })

  return { data, error }
}

// ─────────────────────────────────────────
// GET APPLICATIONS BY STUDENT
// ─────────────────────────────────────────
export async function getApplicationsByStudent(studentId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      internships (
        title,
        city,
        country,
        badge
      )
    `)
    .eq('student_id', studentId)
    .order('started_at', { ascending: false })

  return { data, error }
}

// ─────────────────────────────────────────
// UPLOAD OFFER LETTER (admin only)
// ─────────────────────────────────────────
export async function uploadOfferLetter(
  applicationId: string,
  file: File
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not logged in' }

  // Check file size (max 1MB)
  if (file.size > 1024 * 1024) {
    return { data: null, error: 'File size must be under 1MB' }
  }

  // Upload to storage
  const filePath = `offer-letters/${applicationId}/offer-letter.pdf`

  const { error: uploadError } = await supabase.storage
    .from('application-documents')
    .upload(filePath, file, { upsert: true })

  if (uploadError) return { data: null, error: uploadError }

  // Save path to application
  const { data, error } = await supabase
    .from('applications')
    .update({ offer_letter_url: filePath })
    .eq('id', applicationId)

  return { data, error }
}

// ─────────────────────────────────────────
// GET OFFER LETTER SIGNED URL (admin only)
// ─────────────────────────────────────────
export async function getOfferLetterUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from('application-documents')
    .createSignedUrl(filePath, 60 * 60)

  return { data, error }
}