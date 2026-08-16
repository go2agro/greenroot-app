'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from './supabase-admin'
import { getPartnerDbClient } from './partnerAuth'
import { PARTNER_VISIBLE_STATUSES } from './partnerApplicationVisibility'
import { recordApplicationEvent } from './applicationEvents'
import { createNotification } from './notifications'
import { toPlainResponse } from '@/lib/utils/serverResponse'

type ApplicationRow = {
  student_id?: string
  partner_id?: string
  profiles?: { unique_id?: string } | { unique_id?: string }[] | null
}

async function mergeStudentProfiles<T extends ApplicationRow>(
  supabase: SupabaseClient,
  applications: T[]
) {
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
  const { client: supabase, userId, error: authError } = await getPartnerDbClient()
  if (!supabase || !userId) return toPlainResponse(null, authError)

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
    .in('status', [...PARTNER_VISIBLE_STATUSES])
    .not('reviewed_at', 'is', null)
    .order('started_at', { ascending: false })

  if (error) return toPlainResponse(null, error)
  if (!applications?.length) return toPlainResponse([], null)

  try {
    const merged = await mergeStudentProfiles(supabase, applications)
    return toPlainResponse(merged, null)
  } catch (mergeError) {
    return toPlainResponse(null, mergeError)
  }
}

export async function getMyAssignedApplicationById(applicationId: string) {
  const { client: supabase, userId, error: authError } = await getPartnerDbClient()
  if (!supabase || !userId) return toPlainResponse(null, authError)

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
    .in('status', [...PARTNER_VISIBLE_STATUSES])
    .not('reviewed_at', 'is', null)
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
  const { client: supabase, userId, error: authError } = await getPartnerDbClient()
  if (!supabase || !userId) return { error: authError }

  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('id', applicationId)
    .eq('partner_id', userId)
    .in('status', [...PARTNER_VISIBLE_STATUSES])
    .not('reviewed_at', 'is', null)
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

// ─────────────────────────────────────────
// PARTNER DECISION (approve/reject → sends back to admin)
// ─────────────────────────────────────────
export async function submitPartnerDecision(
  applicationId: string,
  decision: 'approve' | 'reject',
  remarks: string
) {
  const { client: supabase, userId, error: authError } = await getPartnerDbClient()
  if (!supabase || !userId) return toPlainResponse(null, authError)

  if (!remarks.trim()) {
    return toPlainResponse(null, { message: 'Remarks are required for your decision' })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('applications')
    .select('id, status, partner_id')
    .eq('id', applicationId)
    .eq('partner_id', userId)
    .single()

  if (fetchError || !existing) {
    return toPlainResponse(null, fetchError || { message: 'Application not found' })
  }

  const allowedStatuses = ['under_review', 'forwarded_to_partner']
  if (!allowedStatuses.includes(existing.status)) {
    return toPlainResponse(null, { message: 'Decision already submitted for this application' })
  }

  const now = new Date().toISOString()
  const trimmedRemarks = remarks.trim()

  const { data, error } = await supabase
    .from('applications')
    .update({
      status: 'partner_review',
      partner_decision: decision,
      partner_remarks: trimmedRemarks,
      partner_decided_at: now,
    })
    .eq('id', applicationId)
    .eq('partner_id', userId)
    .in('status', allowedStatuses)
    .select()
    .single()

  if (error) {
    console.error('Partner decision update error:', error)
    return toPlainResponse(null, error)
  }

  if (data) {
    await recordApplicationEvent({
      applicationId,
      eventType: 'partner_decided',
      actorId: userId,
      actorRole: 'partner',
      message: `Partner ${decision === 'approve' ? 'recommends approval' : 'recommends rejection'}: ${trimmedRemarks}`,
      metadata: { decision, remarks: trimmedRemarks },
    })

    const adminClient = createAdminClient()
    const { data: admins } = await adminClient
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    for (const admin of admins ?? []) {
      await createNotification({
        userId: admin.id,
        type: 'partner_decision_received',
        title: 'Partner Decision Received',
        message: `A partner has ${decision === 'approve' ? 'recommended approval' : 'recommended rejection'} for an application. Final decision required.`,
        relatedId: applicationId,
        relatedType: 'application',
        category: 'application',
      })
    }
  }

  return toPlainResponse(data, error)
}

export async function canPartnerDecide(applicationId: string) {
  const { client: supabase, userId, error: authError } = await getPartnerDbClient()
  if (!supabase || !userId) return toPlainResponse({ canDecide: false }, authError)

  const { data, error } = await supabase
    .from('applications')
    .select('status, partner_decision')
    .eq('id', applicationId)
    .eq('partner_id', userId)
    .single()

  if (error || !data) {
    return toPlainResponse({ canDecide: false }, error)
  }

  const canDecide =
    ['under_review', 'forwarded_to_partner'].includes(data.status) &&
    !data.partner_decision

  return toPlainResponse({ canDecide, currentStatus: data.status, hasDecision: !!data.partner_decision }, null)
}
