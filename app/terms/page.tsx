import LegalDocument, { type LegalDocumentData } from '@/components/LegalDocument'
import termsData from '@/config/legal/terms.json'

export default function TermsPage() {
  return <LegalDocument data={termsData as LegalDocumentData} variant="terms" />
}
