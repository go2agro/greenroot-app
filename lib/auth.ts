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

// Delete Account — removes user data and signs out
export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const { data: applications } = await supabase
    .from('applications')
    .select('id')
    .eq('student_id', user.id)

  if (applications?.length) {
    const applicationIds = applications.map((app) => app.id)
    await supabase
      .from('application_answers')
      .delete()
      .in('application_id', applicationIds)
    await supabase
      .from('applications')
      .delete()
      .eq('student_id', user.id)
  }

  const { error: studentProfileError } = await supabase
    .from('student_profiles')
    .delete()
    .eq('id', user.id)

  if (studentProfileError) return toPlainResponse(null, studentProfileError)

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id)

  if (profileError) return toPlainResponse(null, profileError)

  const { error: signOutError } = await supabase.auth.signOut()
  return toPlainResponse(null, signOutError)
}