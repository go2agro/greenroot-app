import LegalDocument from '@/components/LegalDocument'
import { getTermsDocument } from '@/lib/legal'

export default function TermsPage() {
  return <LegalDocument data={getTermsDocument()} variant="terms" />
}
