"use server"

import { createClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'

// Sign Up
export async function signUp(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`
    }
  })
  return toPlainResponse(data, error)
}

// Sign In
export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return toPlainResponse(data, error)
}

// Sign Out
export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  return toPlainResponse(null, error)
}

// Get current logged-in user
export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return toPlainResponse(user, error)
}

// Get current session
export async function getSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  return toPlainResponse(session, error)
}

// Reset Password (sends email)
export async function resetPassword(email: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email,
    {redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`}
  )
  return toPlainResponse(data, error)
}

// Update Password (after reset)
export async function updatePassword(newPassword: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  return toPlainResponse(data, error)
}