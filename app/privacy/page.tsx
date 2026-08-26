import LegalDocument from '@/components/LegalDocument'
import { getPrivacyDocument } from '@/lib/legal'

export default function PrivacyPage() {
  return <LegalDocument data={getPrivacyDocument()} variant="privacy" />
}
