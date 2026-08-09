'use server'

import { getAdminDbClient } from './adminAuth'
import { toPlainResponse } from '@/lib/utils/serverResponse'

type PartnerRow = {
  id: string
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  official_email?: string | null
  countries?: string[] | null
}

function mapPartnerRow(partner: PartnerRow, uniqueId: string | null) {
  return {
    id: partner.id,
    first_name: partner.first_name ?? undefined,
    middle_name: partner.middle_name ?? undefined,
    last_name: partner.last_name ?? undefined,
    official_email: partner.official_email ?? undefined,
    countries: partner.countries ?? [],
    unique_id: uniqueId,
  }
}

async function fetchPartnersWithIds(
  supabase: NonNullable<Awaited<ReturnType<typeof getAdminDbClient>>['client']>
) {
  const { data: partners, error } = await supabase
    .from('partner_profiles')
    .select('id, first_name, middle_name, last_name, official_email, countries')
    .order('first_name', { ascending: true })
    .limit(200)

  if (error) throw error

  const partnerIds = (partners ?? []).map((partner) => partner.id)
  const profileMap = new Map<string, string>()

  if (partnerIds.length) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, unique_id')
      .in('id', partnerIds)

    if (profilesError) throw profilesError

    profiles?.forEach((profile) => {
      if (profile.unique_id) profileMap.set(profile.id, profile.unique_id)
    })
  }

  return (partners ?? []).map((partner) =>
    mapPartnerRow(partner, profileMap.get(partner.id) ?? null)
  )
}

function filterPartners(
  partners: ReturnType<typeof mapPartnerRow>[],
  search?: string
) {
  const term = search?.trim().toLowerCase()
  if (!term) return partners.slice(0, 20)

  return partners
    .filter((partner) => {
      const firstName = partner.first_name?.toLowerCase() ?? ''
      const lastName = partner.last_name?.toLowerCase() ?? ''
      const fullName = [partner.first_name, partner.middle_name, partner.last_name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const partnerId = partner.unique_id?.toLowerCase() ?? ''
      const countryMatch = (partner.countries ?? []).some((country) =>
        country.toLowerCase().includes(term)
      )

      return (
        firstName.includes(term) ||
        lastName.includes(term) ||
        fullName.includes(term) ||
        partnerId.includes(term) ||
        countryMatch
      )
    })
    .slice(0, 20)
}

export async function searchPartnersForAssignment(search?: string) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  try {
    const partners = await fetchPartnersWithIds(supabase)
    return toPlainResponse(filterPartners(partners, search), null)
  } catch (error) {
    return toPlainResponse(null, error)
  }
}

export async function assignApplicationToPartner(applicationId: string, partnerId: string) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  const { data: partner, error: partnerError } = await supabase
    .from('partner_profiles')
    .select('id')
    .eq('id', partnerId)
    .maybeSingle()

  if (partnerError) return toPlainResponse(null, partnerError)
  if (!partner) return toPlainResponse(null, { message: 'Partner not found' })

  const { data, error } = await supabase
    .from('applications')
    .update({ partner_id: partnerId })
    .eq('id', applicationId)
    .select('id, partner_id')
    .single()

  return toPlainResponse(data, error)
}

export async function getApplicationAssignment(applicationId: string) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select('id, partner_id')
    .eq('id', applicationId)
    .single()

  if (applicationError) return toPlainResponse(null, applicationError)
  if (!application?.partner_id) return toPlainResponse({ partner: null }, null)

  const { data: partner, error: partnerError } = await supabase
    .from('partner_profiles')
    .select('id, first_name, middle_name, last_name, official_email, countries')
    .eq('id', application.partner_id)
    .maybeSingle()

  if (partnerError) return toPlainResponse(null, partnerError)
  if (!partner) return toPlainResponse({ partner: null }, null)

  const { data: profile } = await supabase
    .from('profiles')
    .select('unique_id')
    .eq('id', partner.id)
    .maybeSingle()

  return toPlainResponse(
    {
      partner: mapPartnerRow(partner, profile?.unique_id ?? null),
    },
    null
  )
}
