const DOC_BLOCK_START = '\n\n[[REQUIRED_DOCUMENTS]]\n'
const DOC_BLOCK_END = '\n[[/REQUIRED_DOCUMENTS]]'

export function extractRequiredDocuments(longDescription?: string | null): {
  description: string
  requiredDocuments: string
} {
  const text = longDescription ?? ''
  const start = text.indexOf(DOC_BLOCK_START)
  if (start === -1) {
    return { description: text, requiredDocuments: '' }
  }

  const end = text.indexOf(DOC_BLOCK_END, start)
  if (end === -1) {
    return { description: text, requiredDocuments: '' }
  }

  const requiredDocuments = text.slice(start + DOC_BLOCK_START.length, end).trim()
  const description = (text.slice(0, start) + text.slice(end + DOC_BLOCK_END.length)).trim()

  return { description, requiredDocuments }
}

export function mergeRequiredDocuments(
  description: string,
  requiredDocuments: string
): string {
  const { description: cleanDescription } = extractRequiredDocuments(description)
  const trimmedDocs = requiredDocuments.trim()

  if (!trimmedDocs) {
    return cleanDescription
  }

  const prefix = cleanDescription ? `${cleanDescription}${DOC_BLOCK_START}` : DOC_BLOCK_START.trimStart()
  return `${prefix}${trimmedDocs}${DOC_BLOCK_END}`
}

export function stripRequiredDocumentsBlock(longDescription?: string | null): string {
  return extractRequiredDocuments(longDescription).description
}
