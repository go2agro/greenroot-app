import { CheckCircle } from 'lucide-react'
import {
  getStageLabel,
  type ApplicationStageRecord,
} from '@/lib/applicationStages.shared'

type PostAcceptanceStageBannerProps = {
  latestStage: ApplicationStageRecord | null
  acceptedAt?: string | null
}

export function PostAcceptanceStageBanner({
  latestStage,
  acceptedAt,
}: PostAcceptanceStageBannerProps) {
  return (
    <div className="bg-gradient-to-r from-gr-secondary to-gr-primary border border-gr-primary-hover rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 border border-white/30">
          <CheckCircle className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-bold text-lg text-white">Application Accepted</h3>
            {latestStage && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold border border-white/30">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {getStageLabel(latestStage.stage_key)}
              </span>
            )}
          </div>

          {latestStage ? (
            <div className="mt-3 bg-white rounded-lg p-3 border border-white/40 shadow-sm">
              <p className="text-xs font-semibold text-gr-secondary uppercase tracking-wide mb-1">
                Latest Update
              </p>
              <p className="text-sm font-medium text-gray-900">
                {getStageLabel(latestStage.stage_key)}
              </p>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{latestStage.comment}</p>
              <p className="text-[10px] text-gray-500 mt-2">
                Updated on{' '}
                {new Date(latestStage.recorded_at).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                {latestStage.admin_name && ` by ${latestStage.admin_name}`}
              </p>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-white/95">
                Accepted on{' '}
                <span className="font-semibold">
                  {acceptedAt
                    ? new Date(acceptedAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </span>
              </p>
              <p className="text-xs text-white/80 mt-1">
                No stages recorded yet. Progress updates will appear here as they are added.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
