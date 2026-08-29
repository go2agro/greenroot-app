'use client'

import {
  CheckCircle2,
  Circle,
  Clock3,
  Send,
  UserCheck,
  Users,
  XCircle,
  Trash2,
  Lock,
} from 'lucide-react'
import type { TimelineStep } from '@/lib/applicationTimeline'

type ApplicationTimelineProps = {
  steps: TimelineStep[]
  applicationRef?: string
}

function StepIcon({ step }: { step: TimelineStep }) {
  const className = 'w-4 h-4'

  if (step.status === 'terminal' && step.key === 'rejected') {
    return <XCircle className={className} />
  }
  if (step.status === 'terminal' && step.key === 'deleted') {
    return <Trash2 className={className} />
  }
  if (step.status === 'terminal' && step.key === 'closed') {
    return <Lock className={className} />
  }
  if (step.key === 'submitted') return <Send className={className} />
  if (step.key === 'admin_accepted') return <UserCheck className={className} />
  if (step.key === 'forwarded_to_partner') return <Users className={className} />
  if (step.key === 'partner_decided') return <Clock3 className={className} />
  if (step.status === 'completed') return <CheckCircle2 className={className} />

  return <Circle className={className} />
}

function getStepStyles(step: TimelineStep) {
  switch (step.status) {
    case 'completed':
      return {
        dot: 'bg-gr-primary text-white border-gr-primary shadow-[0_0_0_4px_rgba(141,198,63,0.18)]',
        line: 'bg-gr-primary',
        title: 'text-gray-900',
        description: 'text-gray-500',
        timestamp: 'text-[#5F8F2D]',
      }
    case 'current':
      return {
        dot: 'bg-white text-gr-primary border-gr-primary shadow-[0_0_0_4px_rgba(141,198,63,0.18)]',
        line: 'bg-gradient-to-b from-gr-primary to-[#DDD9D0]',
        title: 'text-gray-900',
        description: 'text-gray-600',
        timestamp: 'text-gr-primary font-medium',
      }
    case 'terminal':
      return {
        dot: 'bg-red-500 text-white border-gr-error shadow-[0_0_0_4px_rgba(239,68,68,0.15)]',
        line: 'bg-red-200',
        title: 'text-red-700',
        description: 'text-red-500/80',
        timestamp: 'text-red-600',
      }
    default:
      return {
        dot: 'bg-white text-gray-400 border-[#DDD9D0]',
        line: 'bg-[#DDD9D0]',
        title: 'text-gray-400',
        description: 'text-gray-300',
        timestamp: 'text-gray-300',
      }
  }
}

export function ApplicationTimeline({
  steps,
  applicationRef,
}: ApplicationTimelineProps) {
  const displaySteps =
    steps.length > 0
      ? steps
      : [
          {
            key: 'pending',
            label: 'Workflow Progress',
            description: 'Timeline will appear once steps are recorded',
            status: 'pending' as const,
          },
        ]

  return (
    <section className="bg-white border border-[#DDD9D0] rounded-2xl overflow-hidden shadow-sm">
      <div className="border-b border-[#EEEAE3] bg-[#F7F5EF] px-5 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gr-primary">
              Application Timeline
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-1">
              Workflow Progress
            </h2>
          </div>
          {applicationRef && (
            <p className="text-sm font-semibold text-gray-500">
              Ref: <span className="text-gray-800">{applicationRef}</span>
            </p>
          )}
        </div>
      </div>

      <div className="px-5 sm:px-6 py-5 sm:py-6">
        <ol className="space-y-0">
          {displaySteps.map((step, index) => {
            const styles = getStepStyles(step)
            const isLast = index === displaySteps.length - 1

            return (
              <li key={step.key} className="relative flex gap-4">
                {!isLast && (
                  <span
                    className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${styles.line}`}
                    aria-hidden
                  />
                )}

                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${styles.dot}`}
                >
                  <StepIcon step={step} />
                </div>

                <div className={`min-w-0 pb-6 ${isLast ? 'pb-0' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
                    <div>
                      <p className={`text-sm font-semibold ${styles.title}`}>
                        {step.label}
                      </p>
                      {step.description && (
                        <p className={`text-xs mt-0.5 ${styles.description}`}>
                          {step.description}
                        </p>
                      )}
                    </div>
                    <p className={`text-xs shrink-0 ${styles.timestamp}`}>
                      {step.timestamp ??
                        (step.status === 'current'
                          ? 'In progress'
                          : step.status === 'pending'
                            ? 'Pending'
                            : '—')}
                    </p>
                  </div>

                  {step.message && (
                    <div
                      className={`mt-2 rounded-lg border px-3 py-2 text-xs ${
                        step.status === 'terminal'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-[#E8E4DB] bg-[#FAFAF8] text-gray-600'
                      }`}
                    >
                      {step.message}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
