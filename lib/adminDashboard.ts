import { supabase } from './supabase'

// ─────────────────────────────────────────
// USERS KPIs
// ─────────────────────────────────────────

// Total students registered
export async function getTotalStudents() {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')

  return { count, error }
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

  if (!data) return { complete: 0, incomplete: 0, error }

  const complete = data.filter((p: any) =>
    p.first_name && p.last_name && p.email &&
    p.phone_number && p.university_name &&
    p.degree && p.passport_number
  ).length

  return {
    complete,
    incomplete: data.length - complete,
    error
  }
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

  if (!data) return { data: null, error }

  const grouped = data.reduce((acc: any, item: any) => {
    const country = item.country || 'Unknown'
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {})

  return { data: grouped, error }
}

// Internships by duration
export async function getInternshipsByDuration() {
  const { data, error } = await supabase
    .from('internships')
    .select('duration_months')

  if (!data) return { data: null, error }

  const grouped = data.reduce((acc: any, item: any) => {
    const duration = item.duration_months
      ? `${item.duration_months} months`
      : 'Unknown'
    acc[duration] = (acc[duration] || 0) + 1
    return acc
  }, {})

  return { data: grouped, error }
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

  if (!data) return { data: null, error }

  const grouped = data.reduce((acc: any, item: any) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {})

  return { data: grouped, error }
}

// Acceptance rate
export async function getAcceptanceRate() {
  const { data, error } = await supabase
    .from('applications')
    .select('status')
    .in('status', ['submitted', 'under_review', 'approved', 'rejected', 'accepted'])

  if (!data) return { rate: 0, error }

  const total = data.length
  const approved = data.filter((a: any) =>
    a.status === 'approved' || a.status === 'accepted'
  ).length

  const rate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0

  return { rate, total, approved, error }
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

  if (!data) return { data: null, error }

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

  return { data: sorted, error }
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

  if (!data) return { data: null, error }

  const grouped = data.reduce((acc: any, item: any) => {
    const month = new Date(item.created_at)
      .toLocaleString('default', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  return { data: grouped, error }
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

  if (!data) return { data: null, error }

  const grouped = data.reduce((acc: any, item: any) => {
    const month = new Date(item.started_at)
      .toLocaleString('default', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  return { data: grouped, error }
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

  return { data, error }
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