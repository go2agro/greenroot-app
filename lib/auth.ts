import { supabase } from './supabase'

// Sign Up
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

// Sign In
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

// Sign Out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current logged-in user
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Get current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Reset Password (sends email)
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)
  return { data, error }
}

// Update Password (after reset)
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  return { data, error }
}