"use server"

import { supabase } from './supabase'
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
}) {
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
}) {
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
  const { data, error } = await supabase
    .from('internships')
    .delete()
    .eq('id', internshipId)

  return toPlainResponse(data, error)
}