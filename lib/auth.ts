"use server"

import { createClient } from './supabase'
import { createAdminClient, listAllStoragePaths, removeStoragePaths } from './supabase-admin'
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

// Delete Account — removes auth user, database records, and storage assets
export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return toPlainResponse(null, { message: 'Account deletion is not configured. Contact support.' })
  }

  const userId = user.id
  const studentDocumentPaths: string[] = []
  const applicationDocumentPaths: string[] = []

  const { data: studentProfile } = await admin
    .from('student_profiles')
    .select(`
      passport_url,
      passport_photo_url,
      aadhar_front_url,
      aadhar_back_url,
      pan_url,
      driving_license_url,
      digital_signature_url,
      profile_photo_url
    `)
    .eq('id', userId)
    .maybeSingle()

  if (studentProfile) {
    Object.values(studentProfile).forEach((path) => {
      if (typeof path === 'string' && path) {
        studentDocumentPaths.push(path)
      }
    })
  }

  const { data: applications, error: applicationsError } = await admin
    .from('applications')
    .select('id, offer_letter_url')
    .eq('student_id', userId)

  if (applicationsError) return toPlainResponse(null, applicationsError)

  const applicationIds = applications?.map((app) => app.id) ?? []

  applications?.forEach((app) => {
    if (app.offer_letter_url) {
      applicationDocumentPaths.push(app.offer_letter_url)
    }
  })

  if (applicationIds.length) {
    const { data: answers, error: answersError } = await admin
      .from('application_answers')
      .select('file_url')
      .in('application_id', applicationIds)

    if (answersError) return toPlainResponse(null, answersError)

    answers?.forEach((answer) => {
      if (answer.file_url) {
        applicationDocumentPaths.push(answer.file_url)
      }
    })

    const { error: deleteAnswersError } = await admin
      .from('application_answers')
      .delete()
      .in('application_id', applicationIds)

    if (deleteAnswersError) return toPlainResponse(null, deleteAnswersError)

    const { error: deleteApplicationsError } = await admin
      .from('applications')
      .delete()
      .eq('student_id', userId)

    if (deleteApplicationsError) return toPlainResponse(null, deleteApplicationsError)
  }

  studentDocumentPaths.push(...await listAllStoragePaths(admin, 'student-documents', userId))
  applicationDocumentPaths.push(...await listAllStoragePaths(admin, 'application-documents', userId))

  for (const applicationId of applicationIds) {
    applicationDocumentPaths.push(
      ...await listAllStoragePaths(admin, 'application-documents', `offer-letters/${applicationId}`)
    )
  }

  if (studentDocumentPaths.length) {
    try {
      await removeStoragePaths(admin, 'student-documents', studentDocumentPaths)
    } catch (error) {
      return toPlainResponse(null, error)
    }
  }

  if (applicationDocumentPaths.length) {
    try {
      await removeStoragePaths(admin, 'application-documents', applicationDocumentPaths)
    } catch (error) {
      return toPlainResponse(null, error)
    }
  }

  const { error: studentProfileError } = await admin
    .from('student_profiles')
    .delete()
    .eq('id', userId)

  if (studentProfileError) return toPlainResponse(null, studentProfileError)

  const { error: profileError } = await admin
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (profileError) return toPlainResponse(null, profileError)

  const { error: authDeleteError } = await admin.auth.admin.deleteUser(userId)
  if (authDeleteError) return toPlainResponse(null, authDeleteError)

  await supabase.auth.signOut()
  return toPlainResponse({ deleted: true }, null)
}