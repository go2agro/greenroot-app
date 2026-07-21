"use server"

import { getAdminDbClient } from './adminAuth'
import { createClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'

// ─────────────────────────────────────────
// GET ALL STUDENTS (with filters + search)
// ─────────────────────────────────────────
export async function getAllStudents(filters?: {

  search?: string          // searches name, email, unique_id
  gender?: 'male' | 'female' | 'other'
  university_name?: string
  city?: string
  state?: string
}) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  let query = supabase
    .from('student_profiles')
    .select(`
      id,
      first_name,
      last_name,
      email,
      gender,
      date_of_birth,
      nationality,
      marital_status,
      mobile_number,
      emergency_contact_number,
      country,
      state,
      city,
      address_line_1,
      pincode,
      passport_number,
      aadhar_number,
      pan_number,
      university_name,
      college_name,
      degree_name,
      branch_specialization,
      updated_at,
      profiles!inner (
        unique_id,
        role,
        created_at
      )
    `)
    .eq('profiles.role', 'student')
    .order('created_at', { foreignTable: 'profiles', ascending: false })

  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,` +
      `last_name.ilike.%${filters.search}%,` +
      `email.ilike.%${filters.search}%`
    )
  }

  if (filters?.gender) query = query.eq('gender', filters.gender)
  if (filters?.university_name) query = query.ilike('university_name', `%${filters.university_name}%`)
  if (filters?.city) query = query.ilike('city', `%${filters.city}%`)
  if (filters?.state) query = query.ilike('state', `%${filters.state}%`)

  const { data, error } = await query

  return toPlainResponse(data, error)
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
  const supabase = await createClient()
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

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET SINGLE STUDENT (by user ID)
// ─────────────────────────────────────────
export async function getStudentById(userId: string) {
  const supabase = await createClient()

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
  const supabase = await createClient()

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