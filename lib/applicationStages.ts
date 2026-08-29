"use server"

import { createAdminClient } from './supabase-admin'
import { toPlainResponse } from '@/lib/utils/serverResponse'
import { APPLICATION_STAGES, type ApplicationStageKey, type ApplicationStageRecord } from './applicationStages.shared'
import { getAdminDbClient } from './adminAuth'

// ─────────────────────────────────────────
// GET APPLICATION STAGES
// ─────────────────────────────────────────
export async function getApplicationStages(applicationId: string) {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('application_stages')
    .select('*')
    .eq('application_id', applicationId)
    .order('recorded_at', { ascending: true })

  if (error) {
    console.error('Error fetching application stages:', error)
    return toPlainResponse([] as ApplicationStageRecord[], null)
  }

  if (!data || data.length === 0) {
    return toPlainResponse([] as ApplicationStageRecord[], null)
  }

  const adminIds = [...new Set(data.map((d: any) => d.recorded_by).filter(Boolean))]
  
  let adminNames: Record<string, string> = {}
  if (adminIds.length > 0) {
    const { data: admins } = await adminClient
      .from('admin_profiles')
      .select('id, first_name, last_name')
      .in('id', adminIds)
    
    if (admins) {
      adminNames = admins.reduce((acc: Record<string, string>, admin: any) => {
        acc[admin.id] = [admin.first_name, admin.last_name].filter(Boolean).join(' ')
        return acc
      }, {})
    }
  }

  const stages: ApplicationStageRecord[] = data.map((record: any) => ({
    id: record.id,
    application_id: record.application_id,
    stage_key: record.stage_key,
    comment: record.comment,
    recorded_by: record.recorded_by,
    recorded_at: record.recorded_at,
    admin_name: adminNames[record.recorded_by] || undefined,
  }))

  return toPlainResponse(stages, null)
}

// ─────────────────────────────────────────
// RECORD APPLICATION STAGE
// ─────────────────────────────────────────
export async function recordApplicationStage(
  applicationId: string,
  stageKey: ApplicationStageKey,
  comment: string
) {
  const { client: supabase, userId, error: authError } = await getAdminDbClient()
  if (!supabase || !userId) return toPlainResponse(null, authError)

  if (!comment.trim()) {
    return toPlainResponse(null, { message: 'Comment is required' })
  }

  const validStage = APPLICATION_STAGES.find(s => s.key === stageKey)
  if (!validStage) {
    return toPlainResponse(null, { message: 'Invalid stage' })
  }

  const adminClient = createAdminClient()

  const { data: application, error: appError } = await adminClient
    .from('applications')
    .select('id, status')
    .eq('id', applicationId)
    .single()

  if (appError || !application) {
    console.error('Error fetching application:', appError)
    return toPlainResponse(null, appError || { message: 'Application not found' })
  }

  if (application.status !== 'accepted') {
    return toPlainResponse(null, { message: 'Stages can only be recorded for accepted applications' })
  }

  const { data: existingStage } = await adminClient
    .from('application_stages')
    .select('id')
    .eq('application_id', applicationId)
    .eq('stage_key', stageKey)
    .maybeSingle()

  if (existingStage) {
    return toPlainResponse(null, { message: 'This stage has already been recorded' })
  }

  const { data, error } = await adminClient
    .from('application_stages')
    .insert({
      application_id: applicationId,
      stage_key: stageKey,
      comment: comment.trim(),
      recorded_by: userId,
      recorded_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error recording stage:', error)
    return toPlainResponse(null, error)
  }

  return toPlainResponse(data, null)
}
