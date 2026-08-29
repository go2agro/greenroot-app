import type { LegalDocumentData } from '@/components/LegalDocument'
import termsData from '@/config/legal/terms.json'
import privacyData from '@/config/legal/privacy.json'
import {
  applyLegalEntityTokens,
  getLegalEntityTokens,
} from '@/lib/legalEntity'

type LegalBlock = LegalDocumentData['sections'][number]['blocks'][number]

function resolveBlock(block: LegalBlock, tokens: Record<string, string>): LegalBlock {
  if (block.type === 'p' || block.type === 'h3') {
    return { ...block, text: applyLegalEntityTokens(block.text, tokens) }
  }

  return {
    ...block,
    items: block.items.map((item) => applyLegalEntityTokens(item, tokens)),
  }
}

function resolveLegalDocument(
  data: LegalDocumentData,
  tokens: Record<string, string>
): LegalDocumentData {
  return {
    ...data,
    title: applyLegalEntityTokens(data.title, tokens),
    subtitle: applyLegalEntityTokens(data.subtitle, tokens),
    effectiveNote: applyLegalEntityTokens(data.effectiveNote, tokens),
    lastUpdated: applyLegalEntityTokens(data.lastUpdated, tokens),
    intro: data.intro ? applyLegalEntityTokens(data.intro, tokens) : undefined,
    sections: data.sections.map((section) => ({
      ...section,
      title: applyLegalEntityTokens(section.title, tokens),
      blocks: section.blocks.map((block) => resolveBlock(block, tokens)),
    })),
  }
}

export function getTermsDocument(): LegalDocumentData {
  const tokens = getLegalEntityTokens()
  return resolveLegalDocument(termsData as LegalDocumentData, tokens)
}

export function getPrivacyDocument(): LegalDocumentData {
  const tokens = getLegalEntityTokens()
  return resolveLegalDocument(privacyData as LegalDocumentData, tokens)
}
