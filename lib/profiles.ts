"use server"

import { createClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'

// Get profile of current logged-in user
export async function getMyProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return toPlainResponse(data, error)
}

// Get profile by user ID
export async function getProfileById(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return toPlainResponse(data, error)
}

// Update role (admin use only) [DO NOT USE THIS FUNCTION. ASK FOR PERMISSION BEFORE USING IT.]
export async function updateRole(userId: string, role: 'student' | 'admin') {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  return toPlainResponse(data, error)
}

// Update unique ID (admin use only) [DO NOT USE THIS FUNCTION. ASK FOR PERMISSION BEFORE USING IT.]
export async function updateUniqueId(userId: string, uniqueId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ unique_id: uniqueId })
    .eq('id', userId)

  return toPlainResponse(data, error)
}