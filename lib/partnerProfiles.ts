'use server'

import { createClient } from './supabase'
import { MAX_FILE_UPLOAD_BYTES, MAX_FILE_UPLOAD_ERROR } from '@/lib/appConfig'
import { toPlainResponse } from '@/lib/utils/serverResponse'

type PartnerProfileFields = {
  first_name?: string
  middle_name?: string
  last_name?: string
  personal_email?: string
  official_email?: string
  phone_number?: string
  alternate_phone_number?: string
  gender?: 'male' | 'female' | 'other'
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  pincode?: string
  passport_number?: string
  passport_url?: string | null
  passport_photo_url?: string | null
  countries?: string[]
}

export async function getMyPartnerProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return toPlainResponse(data, error)
}

export async function createPartnerProfile(profileData: PartnerProfileFields) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('partner_profiles')
    .insert({ id: user.id, ...profileData })

  return toPlainResponse(data, error)
}

export async function updatePartnerProfile(profileData: PartnerProfileFields) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, null)

  const { data, error } = await supabase
    .from('partner_profiles')
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  return toPlainResponse(data, error)
}

export async function uploadPartnerDocument(
  file: File,
  documentType: 'passport' | 'passport_photo'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  if (file.size > MAX_FILE_UPLOAD_BYTES) {
    return toPlainResponse(null, { message: MAX_FILE_UPLOAD_ERROR })
  }

  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/${documentType}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('partner-documents')
    .upload(filePath, file, { upsert: true })

  if (uploadError) return toPlainResponse(null, uploadError)

  const { data, error } = await supabase
    .from('partner_profiles')
    .update({ [`${documentType}_url`]: filePath })
    .eq('id', user.id)

  return toPlainResponse(data, error)
}
