export type ApplicationEventType =
  | 'submitted'
  | 'admin_accepted'
  | 'admin_rejected'
  | 'forwarded_to_partner'
  | 'partner_decided'
  | 'final_approved'
  | 'final_rejected'
  | 'student_accepted'
  | 'auto_closed'
  | 'closed'
  | 'deleted'

export type ApplicationEvent = {
  id: string
  application_id: string
  event_type: ApplicationEventType
  actor_id?: string | null
  actor_role?: string | null
  message?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
}

export type TimelineStep = {
  key: string
  label: string
  description?: string
  timestamp?: string
  status: 'completed' | 'current' | 'pending' | 'skipped' | 'terminal'
  actorRole?: string
  message?: string
}

export type ApplicationTimelineSource = {
  id: string
  status: string
  submitted_at?: string | null
  reviewed_at?: string | null
  forwarded_at?: string | null
  partner_decided_at?: string | null
  partner_decision?: 'approve' | 'reject' | null
  partner_remarks?: string | null
  decided_at?: string | null
  accepted_at?: string | null
  closed_at?: string | null
  updated_at?: string | null
  partner_id?: string | null
  admin_remarks?: string | null
  rejection_message?: string | null
}

function findEvent(events: ApplicationEvent[], type: ApplicationEventType) {
  return events.find((event) => event.event_type === type)
}

function formatTimelineDate(dateString?: string | null) {
  if (!dateString) return undefined
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function buildApplicationTimeline(
  application: ApplicationTimelineSource,
  events: ApplicationEvent[] = []
): TimelineStep[] {
  const isEarlyRejection =
    application.status === 'rejected' || application.status === 'closed'
  const submittedEvent = findEvent(events, 'submitted')
  const adminAcceptedEvent = findEvent(events, 'admin_accepted')
  const forwardedEvent = findEvent(events, 'forwarded_to_partner')
  const partnerDecidedEvent = findEvent(events, 'partner_decided')
  const finalApprovedEvent = findEvent(events, 'final_approved')
  const finalRejectedEvent = findEvent(events, 'final_rejected')
  const rejectedEvent = findEvent(events, 'admin_rejected')
  const closedEvent = findEvent(events, 'closed')
  const autoClosedEvent = findEvent(events, 'auto_closed')
  const deletedEvent = findEvent(events, 'deleted')

  const submittedAt =
    submittedEvent?.created_at ?? application.submitted_at ?? undefined
  const adminAcceptedAt =
    adminAcceptedEvent?.created_at ??
    (application.reviewed_at &&
    (application.status === 'under_review' ||
      application.status === 'admin_accepted' ||
      application.status === 'forwarded_to_partner' ||
      application.status === 'partner_review' ||
      application.status === 'approved' ||
      application.status === 'accepted')
      ? application.reviewed_at
      : undefined)
  const forwardedAt =
    forwardedEvent?.created_at ??
    application.forwarded_at ??
    (application.partner_id ? application.updated_at : undefined)
  const partnerDecidedAt =
    partnerDecidedEvent?.created_at ?? application.partner_decided_at ?? undefined
  const finalDecisionAt =
    finalApprovedEvent?.created_at ??
    finalRejectedEvent?.created_at ??
    application.decided_at ??
    undefined

  if (deletedEvent) {
    return [
      {
        key: 'submitted',
        label: 'Application Submitted',
        timestamp: formatTimelineDate(submittedAt),
        status: 'completed',
      },
      {
        key: 'deleted',
        label: 'Application Deleted',
        description: 'Removed by admin',
        timestamp: formatTimelineDate(deletedEvent.created_at),
        status: 'terminal',
        message: deletedEvent.message ?? undefined,
      },
    ]
  }

  if (isEarlyRejection && !adminAcceptedAt) {
    const rejectionAt =
      rejectedEvent?.created_at ??
      closedEvent?.created_at ??
      application.decided_at ??
      application.closed_at ??
      application.updated_at
    const rejectionMessage =
      rejectedEvent?.message ??
      closedEvent?.message ??
      application.rejection_message ??
      application.admin_remarks

    return [
      {
        key: 'submitted',
        label: 'Application Submitted',
        timestamp: formatTimelineDate(submittedAt),
        status: 'completed',
      },
      {
        key: 'rejected',
        label: 'Rejected & Closed',
        description: 'Application closed by admin',
        timestamp: formatTimelineDate(rejectionAt),
        status: 'terminal',
        actorRole: 'admin',
        message: rejectionMessage ?? undefined,
      },
    ]
  }

  const steps: TimelineStep[] = [
    {
      key: 'submitted',
      label: 'Application Submitted',
      description: 'Student submitted the application',
      timestamp: formatTimelineDate(submittedAt),
      status: submittedAt ? 'completed' : 'pending',
    },
    {
      key: 'admin_accepted',
      label: 'Screening by Admin',
      description: 'Admin screening completed',
      timestamp: formatTimelineDate(adminAcceptedAt),
      status: adminAcceptedAt
        ? 'completed'
        : application.status === 'submitted'
          ? 'current'
          : 'pending',
      actorRole: 'admin',
      message: adminAcceptedEvent?.message ?? undefined,
    },
    {
      key: 'forwarded_to_partner',
      label: 'Forwarded to Partner',
      description: 'Assigned to partner reviewer',
      timestamp: formatTimelineDate(forwardedAt),
      status: forwardedAt
        ? 'completed'
        : adminAcceptedAt && !forwardedAt
          ? 'current'
          : 'pending',
      actorRole: 'admin',
    },
    {
      key: 'partner_decided',
      label: 'Partner Decision',
      description: application.partner_decision
        ? `Partner recommends ${application.partner_decision === 'approve' ? 'approval' : 'rejection'}`
        : 'Partner reviewed and sent back to admin',
      timestamp: formatTimelineDate(partnerDecidedAt),
      status: partnerDecidedAt
        ? 'completed'
        : forwardedAt && !partnerDecidedAt
          ? 'current'
          : 'pending',
      actorRole: 'partner',
      message: partnerDecidedEvent?.message ?? application.partner_remarks ?? undefined,
    },
    {
      key: 'final_decision',
      label: 'Final Admin Decision',
      description: 'Final outcome recorded',
      timestamp: formatTimelineDate(finalDecisionAt),
      status:
        application.status === 'approved' || application.status === 'accepted'
          ? 'completed'
          : application.status === 'rejected' && adminAcceptedAt
            ? 'terminal'
            : partnerDecidedAt
              ? 'current'
              : 'pending',
      actorRole: 'admin',
      message:
        finalApprovedEvent?.message ??
        finalRejectedEvent?.message ??
        application.admin_remarks ??
        undefined,
    },
  ]

  if (application.status === 'closed' && adminAcceptedAt) {
    const isAutoClosed = Boolean(autoClosedEvent)
    const closedTimestamp = autoClosedEvent?.created_at ?? closedEvent?.created_at ?? application.closed_at ?? application.updated_at
    
    let closedMessage: string | undefined
    if (autoClosedEvent) {
      closedMessage = autoClosedEvent.message ?? 'Student accepted a different application'
    } else if (closedEvent) {
      closedMessage = closedEvent.message ?? undefined
    }

    steps.push({
      key: 'closed',
      label: isAutoClosed ? 'Auto-Closed' : 'Application Closed',
      description: isAutoClosed 
        ? 'Closed because student chose another application' 
        : 'Application closed by admin',
      timestamp: formatTimelineDate(closedTimestamp),
      status: 'terminal',
      actorRole: isAutoClosed ? 'system' : 'admin',
      message: closedMessage,
    })
  }

  return steps
}
