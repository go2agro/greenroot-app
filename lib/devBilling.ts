'use server'

import { createAdminClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'
import {
  VISA_PROCESS_STARTED_STAGE,
  getDateRangeBounds,
} from '@/lib/devBilling.shared'

export async function verifyDevSecretKey(key: string) {
  return key === process.env.ADMIN_SETUP_SECRET
}

type StageRow = {
  id: string
  application_id: string
  recorded_at: string
  applications: {
    id: string
    student_id: string
    status: string
    internships: { title?: string; city?: string; country?: string } | null
    profiles: { unique_id?: string } | { unique_id?: string }[] | null
  } | null
}

function mapStageToApplication(stage: StageRow, studentName: string) {
  const app = stage.applications
  const profile = Array.isArray(app?.profiles) ? app?.profiles[0] : app?.profiles

  return {
    id: app?.id ?? stage.application_id,
    status: app?.status ?? 'unknown',
    visa_started_at: stage.recorded_at,
    internship_title: app?.internships?.title ?? 'Unknown',
    internship_location: [app?.internships?.city, app?.internships?.country]
      .filter(Boolean)
      .join(', '),
    student_name: studentName,
    student_id: profile?.unique_id ?? 'N/A',
  }
}

export async function getVisaProcessedApplicationsByDateRange(
  fromDateIso: string,
  toDateIso: string
) {
  const supabase = createAdminClient()
  const from = new Date(fromDateIso)
  const to = new Date(toDateIso)

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return toPlainResponse(null, { message: 'Invalid date range' })
  }

  const { startDate, endDate } = getDateRangeBounds(from, to)

  const { data: stages, error } = await supabase
    .from('application_stages')
    .select(`
      id,
      application_id,
      recorded_at,
      applications (
        id,
        student_id,
        status,
        internships (
          title,
          city,
          country
        ),
        profiles (
          unique_id
        )
      )
    `)
    .eq('stage_key', VISA_PROCESS_STARTED_STAGE)
    .gte('recorded_at', startDate.toISOString())
    .lte('recorded_at', endDate.toISOString())
    .order('recorded_at', { ascending: false })

  if (error) return toPlainResponse(null, error)
  if (!stages?.length) return toPlainResponse([], null)

  const studentIds = [
    ...new Set(
      stages
        .map((stage) => (stage as unknown as StageRow).applications?.student_id)
        .filter(Boolean) as string[]
    ),
  ]

  let studentMap = new Map<string, string>()

  if (studentIds.length > 0) {
    const { data: studentProfiles, error: studentError } = await supabase
      .from('student_profiles')
      .select('id, first_name, last_name')
      .in('id', studentIds)

    if (studentError) return toPlainResponse(null, studentError)

    studentMap = new Map(
      (studentProfiles ?? []).map((profile) => [
        profile.id,
        `${profile.first_name} ${profile.last_name}`,
      ])
    )
  }

  const result = stages.map((stage) => {
    const row = stage as unknown as StageRow
    const studentId = row.applications?.student_id
    const studentName = studentId ? studentMap.get(studentId) ?? 'Unknown' : 'Unknown'
    return mapStageToApplication(row, studentName)
  })

  return toPlainResponse(result, null)
}
