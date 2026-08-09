'use server'

import { createClient } from './supabase'
import { createAdminClient } from './supabase'
import { getPartnerUserId } from './partnerAuth'
import { toPlainResponse } from '@/lib/utils/serverResponse'

type ApplicationRow = {
  student_id?: string
  partner_id?: string
  profiles?: { unique_id?: string } | { unique_id?: string }[] | null
}

async function mergeStudentProfiles<T extends ApplicationRow>(applications: T[]) {
  const supabase = await createClient()

  const studentIds = [
    ...new Set(
      applications
        .map((app) => app.student_id)
        .filter(Boolean) as string[]
    ),
  ]

  if (!studentIds.length) return applications

  const { data: studentProfiles, error } = await supabase
    .from('student_profiles')
    .select('id, first_name, last_name, email, university_name, degree')
    .in('id', studentIds)

  if (error) throw error

  const studentProfileMap = new Map(
    (studentProfiles ?? []).map((profile) => [profile.id, profile])
  )

  return applications.map((app) => {
    const studentProfile = studentProfileMap.get(app.student_id || '')
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
}

export async function getMyAssignedApplications() {
  const { userId, error: authError } = await getPartnerUserId()
  if (!userId) return toPlainResponse(null, authError)

  const supabase = await createClient()

  const { data: applications, error } = await supabase
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
    .eq('partner_id', userId)
    .order('started_at', { ascending: false })

  if (error) return toPlainResponse(null, error)
  if (!applications?.length) return toPlainResponse([], null)

  try {
    const merged = await mergeStudentProfiles(applications)
    return toPlainResponse(merged, null)
  } catch (mergeError) {
    return toPlainResponse(null, mergeError)
  }
}

export async function getMyAssignedApplicationById(applicationId: string) {
  const { userId, error: authError } = await getPartnerUserId()
  if (!userId) return toPlainResponse(null, authError)

  const supabase = await createClient()

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
    .eq('partner_id', userId)
    .single()

  if (error || !data) return toPlainResponse(null, error || { message: 'Application not found' })

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

async function assertPartnerOwnsApplication(applicationId: string) {
  const { userId, error: authError } = await getPartnerUserId()
  if (!userId) return { error: authError }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('id', applicationId)
    .eq('partner_id', userId)
    .maybeSingle()

  if (error) return { error }
  if (!data) return { error: { message: 'Unauthorized' } }

  return { error: null }
}

export async function getPartnerApplicationFile(applicationId: string, filePath: string) {
  const { error: authError } = await assertPartnerOwnsApplication(applicationId)
  if (authError) return toPlainResponse(null, authError)

  const supabase = createAdminClient()
  const { data, error } = await supabase.storage
    .from('application-documents')
    .createSignedUrl(filePath, 60 * 60)

  return toPlainResponse(data, error)
}

export async function getPartnerStudentDocumentUrl(applicationId: string, filePath: string) {
  const { error: authError } = await assertPartnerOwnsApplication(applicationId)
  if (authError) return toPlainResponse(null, authError)

  const supabase = createAdminClient()
  const { data, error } = await supabase.storage
    .from('student-documents')
    .createSignedUrl(filePath, 60 * 60)

  return toPlainResponse(data, error)
}
