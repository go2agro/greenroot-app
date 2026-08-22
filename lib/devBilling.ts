'use server'

import { createAdminClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'

export async function verifyDevSecretKey(key: string) {
  return key === process.env.ADMIN_SETUP_SECRET
}

export async function getApprovedApplicationsByMonth(year: number, month: number) {
  const supabase = createAdminClient()

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  const { data: applications, error } = await supabase
    .from('applications')
    .select(`
      id,
      student_id,
      status,
      decided_at,
      submitted_at,
      internships (
        id,
        title,
        city,
        country
      ),
      profiles (
        unique_id
      )
    `)
    .eq('status', 'approved')
    .not('decided_at', 'is', null)
    .gte('decided_at', startDate.toISOString())
    .lte('decided_at', endDate.toISOString())
    .order('decided_at', { ascending: false })

  if (error) return toPlainResponse(null, error)
  if (!applications?.length) return toPlainResponse([], null)

  const studentIds = [
    ...new Set(
      applications
        .map((app: { student_id?: string }) => (app as any).student_id)
        .filter(Boolean) as string[]
    ),
  ]

  if (!studentIds.length) {
    return toPlainResponse(
      applications.map((app: any) => ({
        id: app.id,
        status: app.status,
        decided_at: app.decided_at,
        submitted_at: app.submitted_at,
        internship_title: app.internships?.title ?? 'Unknown',
        internship_location: [app.internships?.city, app.internships?.country]
          .filter(Boolean)
          .join(', '),
        student_name: 'Unknown',
        student_id: Array.isArray(app.profiles)
          ? app.profiles[0]?.unique_id
          : app.profiles?.unique_id ?? 'N/A',
      })),
      null
    )
  }

  const { data: studentProfiles, error: studentError } = await supabase
    .from('student_profiles')
    .select('id, first_name, last_name')
    .in('id', studentIds)

  if (studentError) return toPlainResponse(null, studentError)

  const studentMap = new Map(
    (studentProfiles ?? []).map((p) => [p.id, `${p.first_name} ${p.last_name}`])
  )

  const result = applications.map((app: any) => {
    const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles

    return {
      id: app.id,
      status: app.status,
      decided_at: app.decided_at,
      submitted_at: app.submitted_at,
      internship_title: app.internships?.title ?? 'Unknown',
      internship_location: [app.internships?.city, app.internships?.country]
        .filter(Boolean)
        .join(', '),
      student_name: studentMap.get(app.student_id) ?? 'Unknown',
      student_id: profile?.unique_id ?? 'N/A',
    }
  })

  return toPlainResponse(result, null)
}

export async function getBillingMonthsSummary() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('applications')
    .select('decided_at')
    .eq('status', 'approved')
    .not('decided_at', 'is', null)
    .order('decided_at', { ascending: false })

  if (error) return toPlainResponse(null, error)
  if (!data?.length) return toPlainResponse([], null)

  const monthCounts = new Map<string, number>()

  data.forEach((app) => {
    if (app.decided_at) {
      const date = new Date(app.decided_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1)
    }
  })

  const result = Array.from(monthCounts.entries())
    .map(([key, count]) => {
      const [year, month] = key.split('-').map(Number)
      return { year, month, count, key }
    })
    .sort((a, b) => b.key.localeCompare(a.key))

  return toPlainResponse(result, null)
}
