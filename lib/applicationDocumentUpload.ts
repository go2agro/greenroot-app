export const APPLICATION_DOCUMENT_ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export type ApplicationDocumentType = 'pdf' | 'doc' | 'docx'

const APPLICATION_DOCUMENT_CONTENT_TYPES: Record<ApplicationDocumentType, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export function getApplicationDocumentType(
  fileType?: string,
  fileName?: string
): ApplicationDocumentType | null {
  const type = (fileType || '').toLowerCase()
  const name = (fileName || '').toLowerCase()

  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf'
  if (type.includes('wordprocessingml') || name.endsWith('.docx')) return 'docx'
  if (type.includes('msword') || name.endsWith('.doc')) return 'doc'

  return null
}

export function isAllowedApplicationDocument(file: {
  type?: string
  name?: string
}): boolean {
  return getApplicationDocumentType(file.type, file.name) !== null
}

export function getApplicationDocumentContentType(
  fileType?: string,
  fileName?: string
): string | undefined {
  const documentType = getApplicationDocumentType(fileType, fileName)
  return documentType ? APPLICATION_DOCUMENT_CONTENT_TYPES[documentType] : undefined
}

export function getApplicationDocumentLabel(
  fileType?: string,
  fileName?: string
): string {
  const documentType = getApplicationDocumentType(fileType, fileName)
  if (documentType === 'pdf') return 'PDF'
  if (documentType === 'docx') return 'DOCX'
  if (documentType === 'doc') return 'DOC'
  return 'File'
}

export function isApplicationDocumentFile(fileType?: string, fileName?: string): boolean {
  return getApplicationDocumentType(fileType, fileName) !== null
}
