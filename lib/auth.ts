import { supabase } from './supabase'
import { getPostHogClient } from './posthog-server'

// Sign Up
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (!error && data.user) {
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: data.user.id,
      event: 'user_signed_up',
      properties: { email },
    })
    posthog.identify({
      distinctId: data.user.id,
      properties: { email },
    })
  }
  return { data, error }
}

// Sign In
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (!error && data.user) {
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: data.user.id,
      event: 'user_signed_in',
      properties: { email },
    })
    posthog.identify({
      distinctId: data.user.id,
      properties: { email },
    })
  }
  return { data, error }
}

// Sign Out
export async function signOut() {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.auth.signOut()
  if (!error && user) {
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: user.id,
      event: 'user_signed_out',
    })
  }
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
  if (!error) {
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: email,
      event: 'password_reset_requested',
      properties: { email },
    })
  }
  return { data, error }
}

// Update Password (after reset)
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  return { data, error }
}