"use server"

import { createClient } from './supabase'
import { getAdminDbClient } from './adminAuth'
import { createNotification } from '@/lib/notifications'
import { toPlainResponse } from '@/lib/utils/serverResponse'

// ─────────────────────────────────────────
// GET ALL APPLICATIONS (with filters)
// ─────────────────────────────────────────
export async function getAllApplications(filters?: {

  search?: string         // search by student name
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn' | 'accepted'
  internship_id?: string
  student_id?: string
}) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  let query = supabase
    .from('applications')
    .select(`
      *,
      internships (
        title,
        city,
        country,
        badge,
        flag_emoji
      ),
      profiles (
        unique_id
      )
    `)
    .order('started_at', { ascending: false })

  if (filters?.status)        query = query.eq('status', filters.status)
  if (filters?.internship_id) query = query.eq('internship_id', filters.internship_id)
  if (filters?.student_id)    query = query.eq('student_id', filters.student_id)

  const { data: applications, error } = await query
  if (error) return toPlainResponse(null, error)
  if (!applications?.length) return toPlainResponse([], null)

  const studentIds = [
    ...new Set(
      applications
        .map((app: { student_id?: string }) => app.student_id)
        .filter(Boolean) as string[]
    ),
  ]

  const { data: studentProfiles, error: studentProfilesError } = await supabase
    .from('student_profiles')
    .select('id, first_name, last_name, email, university_name, degree')
    .in('id', studentIds)

  if (studentProfilesError) return toPlainResponse(null, studentProfilesError)

  const studentProfileMap = new Map(
    (studentProfiles ?? []).map((profile) => [profile.id, profile])
  )

  let merged = applications.map((app: any) => {
    const studentProfile = studentProfileMap.get(app.student_id)
    const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles

    return {
      ...app,
      profiles: undefined,
      student_profiles: studentProfile
        ? {
            ...studentProfile,
            profiles: profile ? { unique_id: profile.unique_id } : null,
          }
        : null,
    }
  })

  if (filters?.search) {
    const search = filters.search.toLowerCase()
    merged = merged.filter((app: any) =>
      app.student_profiles?.first_name?.toLowerCase().includes(search) ||
      app.student_profiles?.last_name?.toLowerCase().includes(search) ||
      app.student_profiles?.email?.toLowerCase().includes(search)
    )
  }

  return toPlainResponse(merged, null)
}

// ─────────────────────────────────────────
// GET SINGLE APPLICATION (full details)
// ─────────────────────────────────────────
export async function getApplicationById(applicationId: string) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      internships (*),
      application_answers (*),
      profiles (
        unique_id,
        created_at,
        role
      )
    `)
    .eq('id', applicationId)
    .single()

  if (error || !data) return toPlainResponse(null, error)

  const { data: applicationAnswers, error: answersError } = await supabase
    .from('application_answers')
    .select('*')
    .eq('application_id', applicationId)
    .order('step_number', { ascending: true })

  if (answersError) return toPlainResponse(null, answersError)

  const { data: studentProfile, error: studentError } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', data.student_id)
    .maybeSingle()

  if (studentError) return toPlainResponse(null, studentError)

  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles

  return toPlainResponse(
    {
      ...data,
      profiles: undefined,
      application_answers: applicationAnswers ?? data.application_answers ?? [],
      student_profiles: studentProfile
        ? {
            ...studentProfile,
            profiles: profile
              ? {
                  unique_id: profile.unique_id,
                  created_at: profile.created_at,
                  role: profile.role,
                }
              : null,
          }
        : null,
    },
    null
  )
}

// ─────────────────────────────────────────
// APPROVE APPLICATION
// ─────────────────────────────────────────
export async function approveApplication(applicationId: string, remarks: string) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  if (!remarks.trim()) {
    return toPlainResponse(null, { message: 'Administrative remarks are required' })
  }

  const { data, error } = await supabase
    .from('applications')
    .update({
      status: 'approved',
      decided_at: new Date().toISOString(),
      admin_remarks: remarks.trim()
    })
    .eq('id', applicationId)
    .in('status', ['submitted', 'under_review'])
    .select()
    .single()

  if (!error) {
    const { data: app } = await supabase
      .from('applications')
      .select('student_id')
      .eq('id', applicationId)
      .single()
    const studentId = app?.student_id

    if (studentId) {
      await createNotification({
        userId: studentId,
        type: 'application_approved',
        title: 'Application Approved! 🎉',
        message: 'Congratulations! Your application has been approved.',
        relatedId: applicationId,
        relatedType: 'application',
        category: 'application',
      })
    }
  }

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// REJECT APPLICATION
// ─────────────────────────────────────────
export async function rejectApplication(applicationId: string, remarks: string) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  if (!remarks.trim()) {
    return toPlainResponse(null, { message: 'Administrative remarks are required' })
  }

  const { data, error } = await supabase
    .from('applications')
    .update({
      status: 'rejected',
      decided_at: new Date().toISOString(),
      admin_remarks: remarks.trim()
    })
    .eq('id', applicationId)
    .in('status', ['submitted', 'under_review'])
    .select()
    .single()

  if (!error) {
    const { data: app } = await supabase
      .from('applications')
      .select('student_id')
      .eq('id', applicationId)
      .single()
    const studentId = app?.student_id

    if (studentId) {
      await createNotification({
        userId: studentId,
        type: 'application_rejected',
        title: 'Application Update',
        message: 'Your application was not selected at this time.',
        relatedId: applicationId,
        relatedType: 'application',
        category: 'application',
      })
    }
  }

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET APPLICATION FILE (signed url)
// ─────────────────────────────────────────
export async function getApplicationFile(filePath: string) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  const { data, error } = await supabase.storage
    .from('application-documents')
    .createSignedUrl(filePath, 60 * 60) // valid for 1 hour

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET APPLICATIONS BY INTERNSHIP
// ─────────────────────────────────────────
export async function getApplicationsByInternship(internshipId: string) {
  const supabase = await createClient()

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

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET APPLICATIONS BY STUDENT
// ─────────────────────────────────────────
export async function getApplicationsByStudent(studentId: string) {
  const supabase = await createClient()

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

  return toPlainResponse(data, error)
}
