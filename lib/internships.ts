"use server"

import { createClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'

// ─────────────────────────────────────────
// GET ALL INTERNSHIPS (with filters + search)
// ─────────────────────────────────────────
export async function getAllInternships(filters?: {
  search?: string        // searches title, subtitle, short description
  city?: string
  country?: string
  badge?: string
  min_duration?: number
  max_duration?: number
  min_stipend?: number
  max_stipend?: number
}) {
  const supabase = await createClient()
  let query = supabase
    .from('internships')
    .select('*')

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,` +
      `subtitle.ilike.%${filters.search}%,` +
      `short_description.ilike.%${filters.search}%`
    )
  }

  if (filters?.city)         query = query.ilike('city', `%${filters.city}%`)
  if (filters?.country)      query = query.ilike('country', `%${filters.country}%`)
  if (filters?.badge)        query = query.ilike('badge', `%${filters.badge}%`)
  if (filters?.min_duration) query = query.gte('duration_months', filters.min_duration)
  if (filters?.max_duration) query = query.lte('duration_months', filters.max_duration)
  if (filters?.min_stipend)  query = query.gte('stipend_monthly', filters.min_stipend)
  if (filters?.max_stipend)  query = query.lte('stipend_monthly', filters.max_stipend)

  const { data, error } = await query

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET SINGLE INTERNSHIP (by id)
// ─────────────────────────────────────────
export async function getInternshipById(internshipId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('internships')
    .select('*')
    .eq('id', internshipId)
    .single()

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// CREATE INTERNSHIP (admin only)
// ─────────────────────────────────────────
export async function createInternship(internshipData: {
  badge?: string
  title: string
  subtitle?: string
  city?: string
  country?: string
  short_description?: string
  long_description?: string
  duration_months?: number
  stipend_monthly?: number
  stipend_yearly?: number
  image_url?: string
  start_date?: string
  work_mode?: string
  key_responsibilities?: string
  skills_learned?: string
  eligibility_requirements?: string
  stipend_benefits?: string
  secondary_image_url?: string
  flag_emoji?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('internships')
    .insert(internshipData)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// UPDATE INTERNSHIP (admin only)
// ─────────────────────────────────────────
export async function updateInternship(internshipId: string, internshipData: {
  badge?: string
  title?: string
  subtitle?: string
  city?: string
  country?: string
  short_description?: string
  long_description?: string
  duration_months?: number
  stipend_monthly?: number
  stipend_yearly?: number
  image_url?: string
  start_date?: string
  work_mode?: string
  key_responsibilities?: string
  skills_learned?: string
  eligibility_requirements?: string
  stipend_benefits?: string
  secondary_image_url?: string
  flag_emoji?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('internships')
    .update({ ...internshipData, updated_at: new Date().toISOString() })
    .eq('id', internshipId)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// DELETE INTERNSHIP (admin only)
// ─────────────────────────────────────────
export async function deleteInternship(internshipId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('internships')
    .delete()
    .eq('id', internshipId)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET RECENT INTERNSHIPS
// ─────────────────────────────────────────
export async function getRecentInternships(limit: number = 6) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('internships')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET TOP PAID INTERNSHIPS
// ─────────────────────────────────────────
export async function getTopPaidInternships(limit: number = 3) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('internships')
    .select('*')
    .order('stipend_monthly', { ascending: false })
    .limit(limit)

  return toPlainResponse(data, error)
}
