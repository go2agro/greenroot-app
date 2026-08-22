export const APPLICATION_STAGES = [
  { key: 'application_selected', label: 'Application Selected', order: 1 },
  { key: 'interview_started', label: 'Interview Process Started', order: 2 },
  { key: 'interview_ended', label: 'Interview Process Ended', order: 3 },
  { key: 'fees_discussion_started', label: 'Fees Discussion Started', order: 4 },
  { key: 'fees_discussion_ended', label: 'Fees Discussion Ended', order: 5 },
  { key: 'visa_application_started', label: 'Visa Application Started', order: 6 },
  { key: 'visa_application_ended', label: 'Visa Application Ended', order: 7 },
  { key: 'predeparture_training_completed', label: 'Pre-departure Training Completed', order: 8 },
  { key: 'departed', label: 'Departed', order: 9 },
] as const

export type ApplicationStageKey = typeof APPLICATION_STAGES[number]['key']

export type ApplicationStageRecord = {
  id: string
  application_id: string
  stage_key: ApplicationStageKey
  comment: string
  recorded_by: string
  recorded_at: string
  admin_name?: string
}

export function getStageLabel(stageKey: ApplicationStageKey): string {
  const stage = APPLICATION_STAGES.find(s => s.key === stageKey)
  return stage?.label ?? stageKey
}

/** Most recently recorded stage update (by timestamp). */
export function getMostRecentStageUpdate(
  stages: ApplicationStageRecord[]
): ApplicationStageRecord | null {
  if (stages.length === 0) return null

  return stages.reduce((latest, current) =>
    new Date(current.recorded_at).getTime() > new Date(latest.recorded_at).getTime()
      ? current
      : latest
  )
}

/** Furthest completed stage in the pipeline (by stage order). */
export function getCurrentPipelineStage(
  stages: ApplicationStageRecord[]
): ApplicationStageRecord | null {
  if (stages.length === 0) return null

  return stages.reduce((latest, current) => {
    const latestOrder = APPLICATION_STAGES.find(s => s.key === latest.stage_key)?.order ?? 0
    const currentOrder = APPLICATION_STAGES.find(s => s.key === current.stage_key)?.order ?? 0
    return currentOrder > latestOrder ? current : latest
  })
}
