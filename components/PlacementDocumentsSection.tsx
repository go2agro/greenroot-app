'use client'

import { useCallback, useRef, useState } from 'react'
import useSWR from 'swr'
import {
  CloudUpload,
  FileText,
  Loader2,
  Trash2,
  SendHorizontal,
} from 'lucide-react'
import { FormSection } from '@/components/ApplicationPaperForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  deleteAdminPlacementDocument,
  deletePartnerPlacementDocument,
  forwardPlacementDocumentToStudent,
  getAdminPlacementDocumentUrl,
  getAdminPlacementDocuments,
  getPartnerPlacementDocumentUrl,
  getPartnerPlacementDocuments,
  getStudentPlacementDocumentUrl,
  getStudentPlacementDocuments,
  uploadPartnerPlacementDocument,
  type PlacementDocumentRecord,
} from '@/lib/placementDocuments'
import {
  MAX_PLACEMENT_DOCUMENT_UPLOAD_BYTES,
  MAX_PLACEMENT_DOCUMENT_UPLOAD_ERROR,
  MAX_PLACEMENT_DOCUMENT_UPLOAD_MB,
} from '@/lib/appConfig'
import { BTN_DELETE, BTN_VIEW } from '@/lib/appConfig'

type PlacementDocumentsSectionProps = {
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

async function fetchDocuments(applicationId: string, role: PlacementDocumentsSectionProps['role']) {
  const response =
    role === 'partner'
      ? await getPartnerPlacementDocuments(applicationId)
      : role === 'admin'
        ? await getAdminPlacementDocuments(applicationId)
        : await getStudentPlacementDocuments(applicationId)

  if (response.error) {
    throw new Error(
      typeof response.error === 'object' && response.error && 'message' in response.error
        ? String((response.error as { message: string }).message)
        : 'Failed to load placement documents'
    )
  }

  return (response.data ?? []) as PlacementDocumentRecord[]
}

async function getSignedUrl(
  applicationId: string,
  role: PlacementDocumentsSectionProps['role'],
  filePath: string
) {
  const response =
    role === 'partner'
      ? await getPartnerPlacementDocumentUrl(applicationId, filePath)
      : role === 'admin'
        ? await getAdminPlacementDocumentUrl(applicationId, filePath)
        : await getStudentPlacementDocumentUrl(applicationId, filePath)

  if (response.error || !response.data?.signedUrl) {
    throw new Error(
      typeof response.error === 'object' && response.error && 'message' in response.error
        ? String((response.error as { message: string }).message)
        : 'Unable to open document'
    )
  }

  return response.data.signedUrl
}

export function PlacementDocumentsSection({
  applicationId,
  role,
  sectionNumber,
}: PlacementDocumentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerTitle, setViewerTitle] = useState<string>('Placement Document')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const { data: documents = [], mutate, isLoading } = useSWR(
    ['placement-documents', applicationId, role],
    () => fetchDocuments(applicationId, role),
    { revalidateOnFocus: true }
  )

  const refresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  const handleUploadFiles = async (files: FileList | File[] | null) => {
    if (!files?.length || role !== 'partner') return

    setError(null)
    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_PLACEMENT_DOCUMENT_UPLOAD_BYTES) {
          throw new Error(MAX_PLACEMENT_DOCUMENT_UPLOAD_ERROR)
        }

        const formData = new FormData()
        formData.append('file', file)
        const result = await uploadPartnerPlacementDocument(applicationId, formData)

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
      const result =
        role === 'partner'
          ? await deletePartnerPlacementDocument(applicationId, documentId)
          : await deleteAdminPlacementDocument(applicationId, documentId)

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

  const handleForward = async (documentId: string) => {
    setError(null)
    setActionId(documentId)

    try {
      const result = await forwardPlacementDocumentToStudent(applicationId, documentId)

      if (result.error) {
        throw new Error(
          typeof result.error === 'object' && result.error && 'message' in result.error
            ? String((result.error as { message: string }).message)
            : 'Forward failed'
        )
      }

      await refresh()
    } catch (forwardError) {
      setError(forwardError instanceof Error ? forwardError.message : 'Forward failed')
    } finally {
      setActionId(null)
    }
  }

  const handleView = async (document: PlacementDocumentRecord) => {
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
    role === 'partner'
      ? 'No placement documents uploaded yet. Upload PDFs confirming internship placement when available.'
      : role === 'admin'
        ? 'No placement documents uploaded by the partner yet.'
        : 'No placement documents have been shared with you yet.'

  return (
    <>
      <FormSection number={sectionNumber} title="Placement Documents">
        {role === 'partner' && (
          <div className="mb-4 space-y-3">
            <p className="text-sm text-gray-600">
              Upload placement-related PDFs (offer letters, placement confirmations, etc.).
              Files save immediately and are visible to admin only until forwarded to the student.
            </p>

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
                  PDF only · up to {MAX_PLACEMENT_DOCUMENT_UPLOAD_MB} MB · saves immediately
                </p>
              </div>
            </div>
          </div>
        )}

        {role === 'admin' && (
          <p className="mb-4 text-sm text-gray-600">
            Review placement documents uploaded by the partner. Delete unwanted files or forward
            selected documents to the student when appropriate.
          </p>
        )}

        {role === 'student' && (
          <p className="mb-4 text-sm text-gray-600">
            These placement documents were shared with you by the admin. View only.
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
            Loading placement documents...
          </div>
        ) : documents.length === 0 ? (
          <p className="py-3 text-sm italic text-gray-500">{emptyCopy}</p>
        ) : (
          <ol className="divide-y divide-gray-100 border border-gray-200">
            {documents.map((document, index) => {
              const isBusy = actionId === document.id
              const isForwarded = Boolean(document.forwarded_at)

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
                      {role !== 'student' && (
                        <p className="mt-1 text-xs text-gray-500">
                          Uploaded {formatUploadedAt(document.uploaded_at)}
                          {isForwarded && (
                            <>
                              {' '}
                              · Forwarded {formatUploadedAt(document.forwarded_at)}
                            </>
                          )}
                        </p>
                      )}
                      {role === 'admin' && isForwarded && (
                        <span className="mt-2 inline-flex rounded-sm border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green-700">
                          Forwarded to Student
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {(role === 'partner' || role === 'admin' || role === 'student') && (
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
                    )}

                    {role === 'partner' && (
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

                    {role === 'admin' && (
                      <>
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

                        {!isForwarded && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void handleForward(document.id)}
                            disabled={isBusy}
                            className="h-8 bg-gr-primary hover:bg-gr-primary-hover"
                          >
                            {isBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <SendHorizontal className="h-3.5 w-3.5" />
                            )}
                            Forward to Student
                          </Button>
                        )}
                      </>
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
