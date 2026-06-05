import { supabase } from './supabase'

// ─────────────────────────────────────────
// GET ALL STUDENTS (with filters + search)
// ─────────────────────────────────────────
export async function getAllStudents(filters?: {
  search?: string          // searches name, email, unique_id
  gender?: 'male' | 'female' | 'other'
  course_status?: 'ongoing' | 'completed'
  degree?: string
  branch_major?: string
  university_name?: string
  city?: string
  state?: string
}) {
  let query = supabase
    .from('student_profiles')
    .select(`
      *,
      profiles (
        unique_id,
        role,
        created_at
      )
    `)

  // Search by name or email
  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,` +
      `last_name.ilike.%${filters.search}%,` +
      `email.ilike.%${filters.search}%`
    )
  }

  // Filters
  if (filters?.gender)          query = query.eq('gender', filters.gender)
  if (filters?.course_status)   query = query.eq('course_status', filters.course_status)
  if (filters?.degree)          query = query.ilike('degree', `%${filters.degree}%`)
  if (filters?.branch_major)    query = query.ilike('branch_major', `%${filters.branch_major}%`)
  if (filters?.university_name) query = query.ilike('university_name', `%${filters.university_name}%`)
  if (filters?.city)            query = query.ilike('city', `%${filters.city}%`)
  if (filters?.state)           query = query.ilike('state', `%${filters.state}%`)

  const { data, error } = await query

  return { data, error }
}

// ─────────────────────────────────────────
// GET ALL ADMINS (with filters + search)
// ─────────────────────────────────────────
export async function getAllAdmins(filters?: {
  search?: string          // searches name, email, unique_id
  gender?: 'male' | 'female' | 'other'
  city?: string
  state?: string
}) {
  let query = supabase
    .from('admin_profiles')
    .select(`
      *,
      profiles (
        unique_id,
        role,
        created_at
      )
    `)

  // Search by name or email
  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,` +
      `last_name.ilike.%${filters.search}%,` +
      `personal_email.ilike.%${filters.search}%,` +
      `official_email.ilike.%${filters.search}%`
    )
  }

  // Filters
  if (filters?.gender) query = query.eq('gender', filters.gender)
  if (filters?.city)   query = query.ilike('city', `%${filters.city}%`)
  if (filters?.state)  query = query.ilike('state', `%${filters.state}%`)

  const { data, error } = await query

  return { data, error }
}

// ─────────────────────────────────────────
// GET SINGLE STUDENT (by user ID)
// ─────────────────────────────────────────
export async function getStudentById(userId: string) {
  const { data, error } = await supabase
    .from('student_profiles')
    .select(`
      *,
      profiles (
        unique_id,
        role,
        created_at
      )
    `)
    .eq('id', userId)
    .single()

  return { data, error }
}

// ─────────────────────────────────────────
// GET SINGLE ADMIN (by user ID)
// ─────────────────────────────────────────
export async function getAdminById(userId: string) {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select(`
      *,
      profiles (
        unique_id,
        role,
        created_at
      )
    `)
    .eq('id', userId)
    .single()

  return { data, error }
}