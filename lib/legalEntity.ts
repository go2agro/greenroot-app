import entityConfig from '@/config/legal/entity.json'

export type LegalEntityConfig = typeof entityConfig

export function getLegalEntity(): LegalEntityConfig {
  return entityConfig
}

/** Flat token map for {{key}} substitution in legal document JSON */
export function getLegalEntityTokens(): Record<string, string> {
  const entity = entityConfig
  const platformHost = entity.platformUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return {
    platformName: entity.platformName,
    platformDescription: entity.platformDescription,
    platformUrl: entity.platformUrl,
    platformHost,
    operatorName: entity.operatorName,
    operatorShortName: entity.operatorShortName,
    registeredName: entity.registeredName,
    llpin: entity.llpin,
    registeredOffice: entity.registeredOffice,
    correspondenceAddress: entity.correspondenceAddress,
    supportEmail: entity.supportEmail,
    generalEmail: entity.generalEmail,
    supportPhone: entity.supportPhone,
    governingLawState: entity.governingLawState,
    governingLawCity: entity.governingLawCity,
    officeHours: entity.officeHours,
    grievanceOfficerName: entity.grievanceOfficer.name,
    grievanceOfficerDesignation: entity.grievanceOfficer.designation,
    grievanceOfficerEmail: entity.grievanceOfficer.email,
    grievanceOfficerPhone: entity.grievanceOfficer.phone,
    grievanceOfficerAddress: entity.grievanceOfficer.address,
  }
}

export function applyLegalEntityTokens(text: string, tokens: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => tokens[key] ?? match)
}
