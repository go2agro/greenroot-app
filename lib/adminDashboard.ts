"use server"

import { supabase } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'

// ─────────────────────────────────────────
// USERS KPIs
// ─────────────────────────────────────────

// Total students registered
export async function getTotalStudents() {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')

  return toPlainResponse({ count }, error)
}

// New students this week
export async function getNewStudentsThisWeek() {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')
    .gte('created_at', oneWeekAgo.toISOString())

  return { count, error }
}

// New students this month
export async function getNewStudentsThisMonth() {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')
    .gte('created_at', oneMonthAgo.toISOString())

  return { count, error }
}

// Total admins
export async function getTotalAdmins() {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin')

  return { count, error }
}

// Students with complete vs incomplete profiles
export async function getProfileCompletionStats() {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('first_name, last_name, email, phone_number, university_name, degree, passport_number')

  if (!data) return toPlainResponse({ complete: 0, incomplete: 0 }, error)

  const complete = data.filter((p: any) =>
    p.first_name && p.last_name && p.email &&
    p.phone_number && p.university_name &&
    p.degree && p.passport_number
  ).length

  return toPlainResponse({
    complete,
    incomplete: data.length - complete
  }, error)
}

// ─────────────────────────────────────────
// INTERNSHIP KPIs
// ─────────────────────────────────────────

// Total internships listed
export async function getTotalInternships() {
  const { count, error } = await supabase
    .from('internships')
    .select('*', { count: 'exact', head: true })

  return { count, error }
}

// Internships by country
export async function getInternshipsByCountry() {
  const { data, error } = await supabase
    .from('internships')
    .select('country')

  if (!data) return toPlainResponse(null, error)

  const grouped = data.reduce((acc: any, item: any) => {
    const country = item.country || 'Unknown'
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {})

  return toPlainResponse(grouped, error)
}

// Internships by duration
export async function getInternshipsByDuration() {
  const { data, error } = await supabase
    .from('internships')
    .select('duration_months')

  if (!data) return toPlainResponse(null, error)

  const grouped = data.reduce((acc: any, item: any) => {
    const duration = item.duration_months
      ? `${item.duration_months} months`
      : 'Unknown'
    acc[duration] = (acc[duration] || 0) + 1
    return acc
  }, {})

  return toPlainResponse(grouped, error)
}

// ─────────────────────────────────────────
// APPLICATION KPIs
// ─────────────────────────────────────────

// Total applications
export async function getTotalApplications() {
  const { count, error } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })

  return { count, error }
}

// Applications this week
export async function getApplicationsThisWeek() {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { count, error } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .gte('started_at', oneWeekAgo.toISOString())

  return { count, error }
}

// Applications this month
export async function getApplicationsThisMonth() {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const { count, error } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .gte('started_at', oneMonthAgo.toISOString())

  return { count, error }
}

// Applications by status
export async function getApplicationsByStatus() {
  const { data, error } = await supabase
    .from('applications')
    .select('status')

  if (!data) return toPlainResponse(null, error)

  const grouped = data.reduce((acc: any, item: any) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {})

  return toPlainResponse(grouped, error)
}

// Acceptance rate
export async function getAcceptanceRate() {
  const { data, error } = await supabase
    .from('applications')
    .select('status')
    .in('status', ['submitted', 'under_review', 'approved', 'rejected', 'accepted'])

  if (!data) return toPlainResponse({ rate: 0 }, error)

  const total = data.length
  const approved = data.filter((a: any) =>
    a.status === 'approved' || a.status === 'accepted'
  ).length

  const rate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0

  return toPlainResponse({ rate, total, approved }, error)
}

// Most applied internships
export async function getMostAppliedInternships() {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      internship_id,
      internships (
        title,
        country,
        city,
        badge
      )
    `)

  if (!data) return toPlainResponse(null, error)

  const grouped: any = {}
  data.forEach((item: any) => {
    const id = item.internship_id
    if (!grouped[id]) {
      grouped[id] = {
        internship: item.internships,
        count: 0
      }
    }
    grouped[id].count++
  })

  const sorted = Object.values(grouped)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5) // top 5

  return toPlainResponse(sorted, error)
}

// ─────────────────────────────────────────
// GROWTH KPIs
// ─────────────────────────────────────────

// Student registrations over last 6 months
export async function getStudentGrowth() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data, error } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('role', 'student')
    .gte('created_at', sixMonthsAgo.toISOString())
    .order('created_at', { ascending: true })

  if (!data) return toPlainResponse(null, error)

  const grouped = data.reduce((acc: any, item: any) => {
    const month = new Date(item.created_at)
      .toLocaleString('default', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  return toPlainResponse(grouped, error)
}

// Applications over last 6 months
export async function getApplicationGrowth() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data, error } = await supabase
    .from('applications')
    .select('started_at')
    .gte('started_at', sixMonthsAgo.toISOString())
    .order('started_at', { ascending: true })

  if (!data) return toPlainResponse(null, error)

  const grouped = data.reduce((acc: any, item: any) => {
    const month = new Date(item.started_at)
      .toLocaleString('default', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  return toPlainResponse(grouped, error)
}

// ─────────────────────────────────────────
// ACTIVITY FEED
// ─────────────────────────────────────────

// Recently registered students
export async function getRecentStudents() {
  const { data, error } = await supabase
    .from('student_profiles')
    .select(`
      first_name,
      last_name,
      email,
      profiles (
        unique_id,
        created_at
      )
    `)
    .order('updated_at', { ascending: false })
    .limit(5)

  return toPlainResponse(data, error)
}

// Recently submitted applications
export async function getRecentApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      internships (
        title,
        country
      ),
      student_profiles (
        first_name,
        last_name
      )
    `)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })
    .limit(5)

  return { data, error }
}

// Recently added internships
export async function getRecentInternships() {
  const { data, error } = await supabase
    .from('internships')
    .select('title, country, city, badge, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return { data, error }
}

// ─────────────────────────────────────────
// BILLING CALCULATOR
// ─────────────────────────────────────────
export async function getMonthlyBillingReport() {
  // Get current month's start and end
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  // Get all submitted applications this month
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      submitted_at,
      internships (
        title,
        country
      ),
      student_profiles (
        first_name,
        last_name
      )
    `)
    .eq('status', 'submitted')
    .gte('submitted_at', monthStart)
    .lte('submitted_at', monthEnd)
    .order('submitted_at', { ascending: false })

  if (!data) return toPlainResponse(null, error)

  const totalSubmitted = data.length

  // Calculate fee based on contract
  const baseRetainer = 5000
  let volumeFee = 0
  let tier = ''

  if (totalSubmitted >= 1 && totalSubmitted <= 10) {
    volumeFee = 10000
    tier = '1 - 10 Applications'
  } else if (totalSubmitted > 10 && totalSubmitted <= 20) {
    volumeFee = 20000
    tier = '10 - 20 Applications'
  } else if (totalSubmitted > 20) {
    volumeFee = 30000
    tier = '20+ Applications'
  } else {
    volumeFee = 0
    tier = 'No applications this month'
  }

  const totalPayable = baseRetainer + volumeFee

  return toPlainResponse({
    // Billing period
    billing_period: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,

    // Application details
    total_submitted: totalSubmitted,
    applications: data,

    // Fee breakdown
    base_retainer: baseRetainer,
    volume_fee: volumeFee,
    tier,
    total_payable: totalPayable,

    // Formatted for display
    summary: `${totalSubmitted} applications submitted in ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}. Total payable: ₹${totalPayable.toLocaleString()}`
  }, error)
}

// ─────────────────────────────────────────
// BILLING HISTORY (past months)
// ─────────────────────────────────────────
export async function getBillingHistory(monthsBack: number = 6) {
  const reports = []

  for (let i = 0; i < monthsBack; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)

    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()

    const { count } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted')
      .gte('submitted_at', monthStart)
      .lte('submitted_at', monthEnd)

    const total = count || 0
    const baseRetainer = 5000
    let volumeFee = 0
    let tier = ''

    if (total >= 1 && total <= 10) {
      volumeFee = 10000
      tier = '1 - 10 Applications'
    } else if (total > 10 && total <= 20) {
      volumeFee = 20000
      tier = '10 - 20 Applications'
    } else if (total > 20) {
      volumeFee = 30000
      tier = '20+ Applications'
    } else {
      tier = 'No applications'
    }

    reports.push({
      month: date.toLocaleString('default', { month: 'long' }),
      year: date.getFullYear(),
      total_submitted: total,
      tier,
      base_retainer: baseRetainer,
      volume_fee: volumeFee,
      total_payable: baseRetainer + volumeFee
    })
  }

  return toPlainResponse(reports, null)
}