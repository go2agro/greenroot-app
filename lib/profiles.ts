import { supabase } from './supabase'

// Get profile of current logged-in user
export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { data, error }
}

// Get profile by user ID
export async function getProfileById(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

// Update role (admin use only) [DO NOT USE THIS FUNCTION. ASK FOR PERMISSION BEFORE USING IT.]
export async function updateRole(userId: string, role: 'student' | 'admin') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  return { data, error }
}

// Update unique ID (admin use only) [DO NOT USE THIS FUNCTION. ASK FOR PERMISSION BEFORE USING IT.]
export async function updateUniqueId(userId: string, uniqueId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ unique_id: uniqueId })
    .eq('id', userId)

  return { data, error }
}