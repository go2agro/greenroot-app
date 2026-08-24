import LegalDocument, { type LegalDocumentData } from '@/components/LegalDocument'
import privacyData from '@/config/legal/privacy.json'

export default function PrivacyPage() {
  return <LegalDocument data={privacyData as LegalDocumentData} variant="privacy" />
}
