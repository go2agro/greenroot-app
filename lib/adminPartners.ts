'use server'

import { getAdminDbClient } from './adminAuth'
import { toPlainResponse } from '@/lib/utils/serverResponse'
import { recordApplicationEvent } from '@/lib/applicationEvents'
import { createNotification } from '@/lib/notifications'

type PartnerRow = {
  id: string
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  official_email?: string | null
  countries?: string[] | null
}

type ProfileMeta = {
  unique_id?: string
  role?: string
  created_at?: string
}

type PartnerListRow = PartnerRow & {
  profiles?: ProfileMeta
}

function mapPartnerRow(partner: PartnerRow, profile: ProfileMeta | null) {
  return {
    id: partner.id,
    first_name: partner.first_name ?? undefined,
    middle_name: partner.middle_name ?? undefined,
    last_name: partner.last_name ?? undefined,
    official_email: partner.official_email ?? undefined,
    countries: partner.countries ?? [],
    unique_id: profile?.unique_id ?? undefined,
  }
}

async function fetchPartnerProfileMeta(
  supabase: NonNullable<Awaited<ReturnType<typeof getAdminDbClient>>['client']>,
  partnerIds: string[]
) {
  const profileMap = new Map<string, ProfileMeta>()

  if (!partnerIds.length) return profileMap

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, unique_id, role, created_at')
    .in('id', partnerIds)

  if (profilesError) throw profilesError

  profiles?.forEach((profile) => {
    profileMap.set(profile.id, {
      unique_id: profile.unique_id ?? undefined,
      role: profile.role ?? undefined,
      created_at: profile.created_at ?? undefined,
    })
  })

  return profileMap
}

async function fetchAllPartnerRows(
  supabase: NonNullable<Awaited<ReturnType<typeof getAdminDbClient>>['client']>
) {
  const { data: partners, error } = await supabase
    .from('partner_profiles')
    .select('id, first_name, middle_name, last_name, official_email, countries')
    .order('first_name', { ascending: true })

  if (error) throw error

  const partnerIds = (partners ?? []).map((partner) => partner.id)
  const profileMap = await fetchPartnerProfileMeta(supabase, partnerIds)

  return (partners ?? []).map((partner) => ({
    ...partner,
    profiles: profileMap.get(partner.id),
  }))
}

export async function getAllPartners() {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  try {
    const partners = await fetchAllPartnerRows(supabase)
    const sorted = [...partners].sort((a, b) => {
      const aTime = a.profiles?.created_at ? new Date(a.profiles.created_at).getTime() : 0
      const bTime = b.profiles?.created_at ? new Date(b.profiles.created_at).getTime() : 0
      return bTime - aTime
    })
    return toPlainResponse(sorted, null)
  } catch (error) {
    return toPlainResponse(null, error)
  }
}

async function fetchPartnersWithIds(
  supabase: NonNullable<Awaited<ReturnType<typeof getAdminDbClient>>['client']>
) {
  const partners = await fetchAllPartnerRows(supabase)

  return partners.map((partner) =>
    mapPartnerRow(partner, partner.profiles ?? null)
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
  const { client: supabase, error: authError, userId } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  const { data: partner, error: partnerError } = await supabase
    .from('partner_profiles')
    .select('id, first_name, last_name')
    .eq('id', partnerId)
    .maybeSingle()

  if (partnerError) return toPlainResponse(null, partnerError)
  if (!partner) return toPlainResponse(null, { message: 'Partner not found' })

  const { data, error } = await supabase
    .from('applications')
    .update({ partner_id: partnerId })
    .eq('id', applicationId)
    .in('status', ['under_review', 'admin_accepted', 'forwarded_to_partner'])
    .select('id, partner_id, student_id')
    .single()

  if (!error && data) {
    const partnerName = [partner.first_name, partner.last_name].filter(Boolean).join(' ')

    await recordApplicationEvent({
      applicationId,
      eventType: 'forwarded_to_partner',
      actorId: userId ?? undefined,
      actorRole: 'admin',
      message: `Forwarded to ${partnerName}`,
      metadata: { partner_id: partnerId },
    })

    await createNotification({
      userId: partnerId,
      type: 'application_assigned',
      title: 'New Application Assigned',
      message: 'An application has been forwarded to you for review.',
      relatedId: applicationId,
      relatedType: 'application',
      category: 'application',
    })
  }

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
      partner: mapPartnerRow(partner, profile ? {
        unique_id: profile.unique_id ?? undefined,
      } : null),
    },
    null
  )
}
