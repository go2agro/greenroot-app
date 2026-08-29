"use server"

import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from './supabase'
import { getAdminDbClient } from './adminAuth'
import { getPartnerDbClient } from './partnerAuth'
import { toPlainResponse } from '@/lib/utils/serverResponse'
import {
  buildApplicationTimeline,
  type ApplicationEvent,
  type ApplicationEventType,
} from '@/lib/applicationTimeline'

export async function recordApplicationEvent({
  applicationId,
  eventType,
  actorId,
  actorRole,
  message,
  metadata,
}: {
  applicationId: string
  eventType: ApplicationEventType
  actorId?: string
  actorRole?: string
  message?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('application_events')
    .insert({
      application_id: applicationId,
      event_type: eventType,
      actor_id: actorId ?? null,
      actor_role: actorRole ?? null,
      message: message ?? null,
      metadata: metadata ?? {},
    })
    .select()
    .single()

  return toPlainResponse(data, error)
}

export async function getApplicationEvents(applicationId: string) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  const { data, error } = await supabase
    .from('application_events')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true })

  return toPlainResponse(data as ApplicationEvent[] | null, error)
}

async function fetchApplicationTimeline(
  supabase: SupabaseClient,
  applicationId: string,
  partnerId?: string
) {
  let applicationQuery = supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)

  if (partnerId) {
    applicationQuery = applicationQuery.eq('partner_id', partnerId)
  }

  const { data: application, error: applicationError } = await applicationQuery.single()

  if (applicationError || !application) {
    return { timeline: null, events: null, error: applicationError }
  }

  const { data: events, error: eventsError } = await supabase
    .from('application_events')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true })

  if (eventsError) {
    const timeline = buildApplicationTimeline(application, [])
    return { timeline, events: [], error: null }
  }

  const timeline = buildApplicationTimeline(
    application,
    (events as ApplicationEvent[]) ?? []
  )

  return { timeline, events: events ?? [], error: null }
}

export async function getApplicationTimeline(applicationId: string) {
  const { client: supabase, error: authError } = await getAdminDbClient()
  if (!supabase) return toPlainResponse(null, authError)

  const { timeline, events, error } = await fetchApplicationTimeline(
    supabase,
    applicationId
  )

  if (error || !timeline) {
    return toPlainResponse(null, error || { message: 'Application not found' })
  }

  return toPlainResponse({ timeline, events }, null)
}

export async function getPartnerApplicationTimeline(applicationId: string) {
  const { client: supabase, userId, error: authError } = await getPartnerDbClient()
  if (!supabase || !userId) return toPlainResponse(null, authError)

  const { timeline, events, error } = await fetchApplicationTimeline(
    supabase,
    applicationId,
    userId
  )

  if (error || !timeline) {
    return toPlainResponse(null, error || { message: 'Application not found' })
  }

  return toPlainResponse({ timeline, events }, null)
}
