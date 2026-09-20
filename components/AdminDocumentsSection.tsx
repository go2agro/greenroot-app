'use client'

import { useCallback, useRef, useState } from 'react'
import useSWR from 'swr'
import { CloudUpload, FileText, Loader2, Trash2 } from 'lucide-react'
import { FormSection } from '@/components/ApplicationPaperForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  deleteAdminApplicationDocument,
  getAdminApplicationDocumentUrl,
  getAdminApplicationDocuments,
  getPartnerAdminApplicationDocumentUrl,
  getPartnerAdminApplicationDocuments,
  getStudentAdminApplicationDocumentUrl,
  getStudentAdminApplicationDocuments,
  uploadAdminApplicationDocument,
  type AdminApplicationDocumentRecord,
} from '@/lib/adminApplicationDocuments'
import {
  MAX_ADMIN_APPLICATION_DOCUMENTS_COUNT,
  MAX_ADMIN_APPLICATION_DOCUMENT_UPLOAD_BYTES,
  MAX_ADMIN_APPLICATION_DOCUMENT_UPLOAD_ERROR,
  MAX_ADMIN_APPLICATION_DOCUMENT_UPLOAD_MB,
} from '@/lib/appConfig'
import { BTN_DELETE, BTN_VIEW } from '@/lib/appConfig'

type AdminDocumentsSectionProps = {
  applicationId: string
  role: 'partner' | 'admin' | 'student'
  sectionNumber: string
}

function formatUploadedAt(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

async function fetchDocuments(
  applicationId: string,
  role: AdminDocumentsSectionProps['role']
) {
  const response =
    role === 'partner'
      ? await getPartnerAdminApplicationDocuments(applicationId)
      : role === 'admin'
        ? await getAdminApplicationDocuments(applicationId)
        : await getStudentAdminApplicationDocuments(applicationId)

  if (response.error) {
    throw new Error(
      typeof response.error === 'object' && response.error && 'message' in response.error
        ? String((response.error as { message: string }).message)
        : 'Failed to load administrative documents'
    )
  }

  return (response.data ?? []) as AdminApplicationDocumentRecord[]
}

async function getSignedUrl(
  applicationId: string,
  role: AdminDocumentsSectionProps['role'],
  filePath: string
) {
  const response =
    role === 'partner'
      ? await getPartnerAdminApplicationDocumentUrl(applicationId, filePath)
      : role === 'admin'
        ? await getAdminApplicationDocumentUrl(applicationId, filePath)
        : await getStudentAdminApplicationDocumentUrl(applicationId, filePath)

  if (response.error || !response.data?.signedUrl) {
    throw new Error(
      typeof response.error === 'object' && response.error && 'message' in response.error
        ? String((response.error as { message: string }).message)
        : 'Unable to open document'
    )
  }

  return response.data.signedUrl
}

export function AdminDocumentsSection({
  applicationId,
  role,
  sectionNumber,
}: AdminDocumentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerTitle, setViewerTitle] = useState<string>('Administrative Document')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const { data: documents = [], mutate, isLoading } = useSWR(
    ['admin-application-documents', applicationId, role],
    () => fetchDocuments(applicationId, role),
    { revalidateOnFocus: true }
  )

  const refresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  const remainingSlots = MAX_ADMIN_APPLICATION_DOCUMENTS_COUNT - documents.length
  const canUpload = role === 'admin' && remainingSlots > 0

  const handleUploadFiles = async (files: FileList | File[] | null) => {
    if (!files?.length || role !== 'admin') return

    setError(null)
    setUploading(true)

    try {
      const selectedFiles = Array.from(files)

      if (selectedFiles.length > remainingSlots) {
        throw new Error(
          `Maximum ${MAX_ADMIN_APPLICATION_DOCUMENTS_COUNT} documents allowed per application`
        )
      }

      for (const file of selectedFiles) {
        if (file.size > MAX_ADMIN_APPLICATION_DOCUMENT_UPLOAD_BYTES) {
          throw new Error(MAX_ADMIN_APPLICATION_DOCUMENT_UPLOAD_ERROR)
        }

        const formData = new FormData()
        formData.append('file', file)
        const result = await uploadAdminApplicationDocument(applicationId, formData)

        if (result.error) {
          throw new Error(
            typeof result.error === 'object' && result.error && 'message' in result.error
              ? String((result.error as { message: string }).message)
              : 'Upload failed'
          )
        }
      }

      await refresh()
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (documentId: string) => {
    setError(null)
    setActionId(documentId)

    try {
      const result = await deleteAdminApplicationDocument(applicationId, documentId)

      if (result.error) {
        throw new Error(
          typeof result.error === 'object' && result.error && 'message' in result.error
            ? String((result.error as { message: string }).message)
            : 'Delete failed'
        )
      }

      await refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed')
    } finally {
      setActionId(null)
    }
  }

  const handleView = async (document: AdminApplicationDocumentRecord) => {
    setError(null)
    setActionId(document.id)

    try {
      const signedUrl = await getSignedUrl(applicationId, role, document.file_url)

      if (role === 'student') {
        setViewerTitle(document.file_name)
        setViewerUrl(signedUrl)
        setViewerOpen(true)
      } else {
        window.open(signedUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (viewError) {
      setError(viewError instanceof Error ? viewError.message : 'Unable to open document')
    } finally {
      setActionId(null)
    }
  }

  const emptyCopy =
    role === 'admin'
      ? 'No administrative documents uploaded yet. Upload PDFs such as insurance letters, cover letters, or other shared application documents.'
      : 'No administrative documents have been shared yet.'

  return (
    <>
      <FormSection number={sectionNumber} title="Administrative Documents">
        {role === 'admin' && (
          <div className="mb-4 space-y-3">
            <p className="text-sm text-gray-600">
              Upload general administrative PDFs for this application. Documents are visible to
              the student and partner immediately.
            </p>

            {canUpload ? (
              <div
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={(event) => {
                  event.preventDefault()
                  setIsDragging(false)
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  setIsDragging(false)
                  void handleUploadFiles(event.dataTransfer.files)
                }}
                className={`rounded-2xl border-2 border-dashed p-6 transition-colors ${
                  isDragging
                    ? 'border-gr-primary bg-green-50'
                    : 'border-gray-300 bg-gray-50'
                } ${uploading ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(event) => void handleUploadFiles(event.target.files)}
                />
                <div className="text-center">
                  {uploading ? (
                    <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-gr-primary" />
                  ) : (
                    <CloudUpload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                  )}
                  <p className="font-medium text-gray-600">
                    {uploading ? 'Uploading...' : 'Click or drag PDF files here'}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    PDF only · up to {MAX_ADMIN_APPLICATION_DOCUMENT_UPLOAD_MB} MB ·{' '}
                    {remainingSlots} of {MAX_ADMIN_APPLICATION_DOCUMENTS_COUNT} slots remaining
                  </p>
                </div>
              </div>
            ) : (
              <p className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Maximum of {MAX_ADMIN_APPLICATION_DOCUMENTS_COUNT} documents reached. Delete an
                existing document to upload a new one.
              </p>
            )}
          </div>
        )}

        {(role === 'partner' || role === 'student') && (
          <p className="mb-4 text-sm text-gray-600">
            Administrative documents shared for this application. View only.
          </p>
        )}

        {error && (
          <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading administrative documents...
          </div>
        ) : documents.length === 0 ? (
          <p className="py-3 text-sm italic text-gray-500">{emptyCopy}</p>
        ) : (
          <ol className="divide-y divide-gray-100 border border-gray-200">
            {documents.map((document, index) => {
              const isBusy = actionId === document.id

              return (
                <li
                  key={document.id}
                  className="flex flex-col gap-3 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="pt-0.5 text-xs font-bold tabular-nums text-gray-400">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <FileText className="h-8 w-8 flex-shrink-0 text-red-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {document.file_name}
                      </p>
                      <p className="mt-0.5 text-xs uppercase text-gray-400">PDF</p>
                      {role === 'admin' && (
                        <p className="mt-1 text-xs text-gray-500">
                          Uploaded {formatUploadedAt(document.uploaded_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => void handleView(document)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gr-primary hover:text-[#7DB62F] disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      {BTN_VIEW}
                    </button>

                    {role === 'admin' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleDelete(document.id)}
                        disabled={isBusy}
                        className="h-8 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        {BTN_DELETE}
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </FormSection>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="border-b border-gray-200 px-5 py-4">
            <DialogTitle className="text-base">{viewerTitle}</DialogTitle>
          </DialogHeader>
          {viewerUrl && (
            <iframe
              title={viewerTitle}
              src={viewerUrl}
              className="h-[75vh] w-full border-0 bg-gray-100"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
