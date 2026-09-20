'use server'

import { randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from './supabase'
import { createAdminClient } from './supabase-admin'
import { getAdminDbClient } from './adminAuth'
import { getPartnerDbClient } from './partnerAuth'
import { PARTNER_VISIBLE_STATUSES } from './partnerApplicationVisibility'
import { toPlainResponse } from '@/lib/utils/serverResponse'
import {
  MAX_PLACEMENT_DOCUMENT_UPLOAD_BYTES,
  MAX_PLACEMENT_DOCUMENT_UPLOAD_ERROR,
} from '@/lib/appConfig'

const BUCKET = 'application-documents'

export type PlacementDocumentRecord = {
  id: string
  application_id: string
  file_url: string
  file_name: string
  file_type: string
  uploaded_by: string
  uploaded_at: string
  forwarded_at: string | null
  forwarded_by: string | null
}

function isPdfFile(file: File) {
  return (
    file.type.toLowerCase().includes('pdf') ||
    file.name.toLowerCase().endsWith('.pdf')
  )
}

async function getAcceptedApplication(
  supabase: SupabaseClient,
  applicationId: string
) {
  const { data, error } = await supabase
    .from('applications')
    .select('id, status, student_id, partner_id')
    .eq('id', applicationId)
    .single()

  if (error || !data) {
    return { application: null, error: error || { message: 'Application not found' } }
  }

  if (data.status !== 'accepted') {
    return {
      application: null,
      error: { message: 'Placement documents are only available after acceptance' },
    }
  }

  return { application: data, error: null }
}

async function getPlacementDocumentById(
  supabase: SupabaseClient,
  documentId: string,
  applicationId: string
) {
  const { data, error } = await supabase
    .from('placement_documents')
    .select('*')
    .eq('id', documentId)
    .eq('application_id', applicationId)
    .maybeSingle()

  if (error || !data) {
    return { document: null, error: error || { message: 'Document not found' } }
  }

  return { document: data as PlacementDocumentRecord, error: null }
}

async function removePlacementDocumentFiles(
  supabase: SupabaseClient,
  documents: Pick<PlacementDocumentRecord, 'file_url'>[]
) {
  const filePaths = documents
    .map((doc) => doc.file_url)
    .filter((path): path is string => Boolean(path))

  if (!filePaths.length) return null

  const { error } = await supabase.storage.from(BUCKET).remove(filePaths)
  return error
}

export async function deleteAllPlacementDocumentsForApplication(
  applicationId: string,
  supabaseClient?: SupabaseClient
) {
  const supabase = supabaseClient ?? createAdminClient()

  const { data: documents, error: fetchError } = await supabase
    .from('placement_documents')
    .select('id, file_url')
    .eq('application_id', applicationId)

  if (fetchError) return fetchError
  if (!documents?.length) return null

  const storageError = await removePlacementDocumentFiles(supabase, documents)
  if (storageError) return storageError

  const { error: deleteError } = await supabase
    .from('placement_documents')
    .delete()
    .eq('application_id', applicationId)

  return deleteError
}

export async function getPartnerPlacementDocuments(applicationId: string) {
  const { client: supabase, userId, error: authError } = await getPartnerDbClient()
  if (!supabase || !userId) return toPlainResponse(null, authError)

  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('id, status, partner_id')
    .eq('id', applicationId)
    .eq('partner_id', userId)
    .in('status', [...PARTNER_VISIBLE_STATUSES])
    .not('reviewed_at', 'is', null)
    .maybeSingle()

  if (appError || !application) {
    return toPlainResponse(null, appError || { message: 'Application not found' })
  }

  if (application.status !== 'accepted') {
    return toPlainResponse([], null)
  }

  const { data, error } = await supabase
    .from('placement_documents')
    .select('*')
    .eq('application_id', applicationId)
    .order('uploaded_at', { ascending: true })

  return toPlainResponse(data as PlacementDocumentRecord[] | null, error)
}

export async function getAdminPlacementDocuments(applicationId: string) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  const { application, error: appError } = await getAcceptedApplication(
    supabase,
    applicationId
  )
  if (appError || !application) return toPlainResponse(null, appError)

  const { data, error } = await supabase
    .from('placement_documents')
    .select('*')
    .eq('application_id', applicationId)
    .order('uploaded_at', { ascending: true })

  return toPlainResponse(data as PlacementDocumentRecord[] | null, error)
}

export async function getStudentPlacementDocuments(applicationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const admin = createAdminClient()

  const { data: application, error: appError } = await admin
    .from('applications')
    .select('id, status, student_id')
    .eq('id', applicationId)
    .eq('student_id', user.id)
    .single()

  if (appError || !application) {
    return toPlainResponse(null, appError || { message: 'Application not found' })
  }

  if (application.status !== 'accepted') {
    return toPlainResponse([], null)
  }

  const { data, error } = await admin
    .from('placement_documents')
    .select('*')
    .eq('application_id', applicationId)
    .not('forwarded_at', 'is', null)
    .order('forwarded_at', { ascending: true })

  return toPlainResponse(data as PlacementDocumentRecord[] | null, error)
}

export async function uploadPartnerPlacementDocument(
  applicationId: string,
  formData: FormData
) {
  const { client: supabase, userId, error: authError } = await getPartnerDbClient()
  if (!supabase || !userId) return toPlainResponse(null, authError)

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return toPlainResponse(null, { message: 'A PDF file is required' })
  }

  if (file.size > MAX_PLACEMENT_DOCUMENT_UPLOAD_BYTES) {
    return toPlainResponse(null, { message: MAX_PLACEMENT_DOCUMENT_UPLOAD_ERROR })
  }

  if (!isPdfFile(file)) {
    return toPlainResponse(null, { message: 'Only PDF files are allowed' })
  }

  const { application, error: appError } = await getAcceptedApplication(
    supabase,
    applicationId
  )
  if (appError || !application) return toPlainResponse(null, appError)

  if (application.partner_id !== userId) {
    return toPlainResponse(null, { message: 'Unauthorized' })
  }

  const filePath = `${application.student_id}/${applicationId}/placement/${randomUUID()}-${Date.now()}.pdf`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { contentType: 'application/pdf', upsert: false })

  if (uploadError) return toPlainResponse(null, uploadError)

  const { data, error } = await supabase
    .from('placement_documents')
    .insert({
      application_id: applicationId,
      file_url: filePath,
      file_name: file.name,
      file_type: 'pdf',
      uploaded_by: userId,
    })
    .select('*')
    .single()

  if (error) {
    await supabase.storage.from(BUCKET).remove([filePath])
    return toPlainResponse(null, error)
  }

  return toPlainResponse(data as PlacementDocumentRecord, null)
}

async function deletePlacementDocumentInternal(
  supabase: SupabaseClient,
  documentId: string,
  applicationId: string
) {
  const { document, error: docError } = await getPlacementDocumentById(
    supabase,
    documentId,
    applicationId
  )
  if (docError || !document) return toPlainResponse(null, docError)

  const storageError = await removePlacementDocumentFiles(supabase, [document])
  if (storageError) return toPlainResponse(null, storageError)

  const { error } = await supabase
    .from('placement_documents')
    .delete()
    .eq('id', documentId)

  return toPlainResponse({ id: documentId }, error)
}

export async function deletePartnerPlacementDocument(
  applicationId: string,
  documentId: string
) {
  const { client: supabase, userId, error: authError } = await getPartnerDbClient()
  if (!supabase || !userId) return toPlainResponse(null, authError)

  const { application, error: appError } = await getAcceptedApplication(
    supabase,
    applicationId
  )
  if (appError || !application) return toPlainResponse(null, appError)

  if (application.partner_id !== userId) {
    return toPlainResponse(null, { message: 'Unauthorized' })
  }

  return deletePlacementDocumentInternal(supabase, documentId, applicationId)
}

export async function deleteAdminPlacementDocument(
  applicationId: string,
  documentId: string
) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  const { application, error: appError } = await getAcceptedApplication(
    supabase,
    applicationId
  )
  if (appError || !application) return toPlainResponse(null, appError)

  return deletePlacementDocumentInternal(supabase, documentId, applicationId)
}

export async function forwardPlacementDocumentToStudent(
  applicationId: string,
  documentId: string
) {
  const { client: supabase, error: authError, userId } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  const { application, error: appError } = await getAcceptedApplication(
    supabase,
    applicationId
  )
  if (appError || !application) return toPlainResponse(null, appError)

  const { document, error: docError } = await getPlacementDocumentById(
    supabase,
    documentId,
    applicationId
  )
  if (docError || !document) return toPlainResponse(null, docError)

  if (document.forwarded_at) {
    return toPlainResponse(document, null)
  }

  const { data, error } = await supabase
    .from('placement_documents')
    .update({
      forwarded_at: new Date().toISOString(),
      forwarded_by: userId ?? null,
    })
    .eq('id', documentId)
    .eq('application_id', applicationId)
    .select('*')
    .single()

  return toPlainResponse(data as PlacementDocumentRecord, error)
}

async function createSignedPlacementUrl(
  supabase: SupabaseClient,
  applicationId: string,
  filePath: string,
  options?: { forwardedOnly?: boolean; studentId?: string }
) {
  let query = supabase
    .from('placement_documents')
    .select('id, file_url, forwarded_at, application_id')
    .eq('application_id', applicationId)
    .eq('file_url', filePath)

  if (options?.forwardedOnly) {
    query = query.not('forwarded_at', 'is', null)
  }

  const { data: document, error: docError } = await query.maybeSingle()
  if (docError || !document) {
    return toPlainResponse(null, docError || { message: 'Document not found' })
  }

  if (options?.studentId) {
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('student_id')
      .eq('id', applicationId)
      .eq('student_id', options.studentId)
      .maybeSingle()

    if (appError || !application) {
      return toPlainResponse(null, appError || { message: 'Unauthorized' })
    }
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 60 * 60)

  return toPlainResponse(data, error)
}

export async function getPartnerPlacementDocumentUrl(
  applicationId: string,
  filePath: string
) {
  const { client: supabase, userId, error: authError } = await getPartnerDbClient()
  if (!supabase || !userId) return toPlainResponse(null, authError)

  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('id, partner_id, status')
    .eq('id', applicationId)
    .eq('partner_id', userId)
    .maybeSingle()

  if (appError || !application || application.status !== 'accepted') {
    return toPlainResponse(null, appError || { message: 'Unauthorized' })
  }

  return createSignedPlacementUrl(supabase, applicationId, filePath)
}

export async function getAdminPlacementDocumentUrl(
  applicationId: string,
  filePath: string
) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  return createSignedPlacementUrl(supabase, applicationId, filePath)
}

export async function getStudentPlacementDocumentUrl(
  applicationId: string,
  filePath: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const admin = createAdminClient()

  return createSignedPlacementUrl(admin, applicationId, filePath, {
    forwardedOnly: true,
    studentId: user.id,
  })
}
