'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Check,
  Loader2,
  X,
} from 'lucide-react'
import {
  APPLICATION_STAGES,
  getMostRecentStageUpdate,
  getStageLabel,
  type ApplicationStageKey,
  type ApplicationStageRecord,
} from '@/lib/applicationStages.shared'
import {
  getApplicationStages,
  recordApplicationStage,
} from '@/lib/applicationStages'

type ApplicationStagesStepperProps = {
  applicationId: string
  onStageUpdated?: (latestStage: ApplicationStageRecord | null) => void
}

export function ApplicationStagesStepper({
  applicationId,
  onStageUpdated,
}: ApplicationStagesStepperProps) {
  const [completedStages, setCompletedStages] = useState<ApplicationStageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<ApplicationStageKey | null>(null)
  const [viewingStageKey, setViewingStageKey] = useState<ApplicationStageKey | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStages = useCallback(async () => {
    const result = await getApplicationStages(applicationId)
    if (result.data) {
      setCompletedStages(result.data)
      onStageUpdated?.(getMostRecentStageUpdate(result.data))
    }
    setLoading(false)
  }, [applicationId, onStageUpdated])

  useEffect(() => {
    loadStages()
  }, [loadStages])

  const isStageCompleted = (stageKey: ApplicationStageKey) => {
    return completedStages.some(s => s.stage_key === stageKey)
  }

  const getStageRecord = (stageKey: ApplicationStageKey) => {
    return completedStages.find(s => s.stage_key === stageKey)
  }

  const handleStageClick = (stageKey: ApplicationStageKey) => {
    if (isStageCompleted(stageKey)) {
      setViewingStageKey(stageKey)
      setSelectedStage(null)
      setComment('')
      setError(null)
      return
    }

    setViewingStageKey(null)
    setSelectedStage(stageKey)
    setComment('')
    setError(null)
  }

  const handleSubmit = async () => {
    if (!selectedStage || !comment.trim()) {
      setError('Please enter a comment')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await recordApplicationStage(applicationId, selectedStage, comment)

      if (result.error) {
        setError(result.error.message || 'Failed to record stage')
        setIsSubmitting(false)
        return
      }

      setSelectedStage(null)
      setComment('')
      
      const stagesResult = await getApplicationStages(applicationId)
      if (stagesResult.data) {
        setCompletedStages(stagesResult.data)
        onStageUpdated?.(getMostRecentStageUpdate(stagesResult.data))
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setSelectedStage(null)
    setViewingStageKey(null)
    setComment('')
    setError(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading stages...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-4">
        <h3 className="font-semibold text-gray-900">Post-Acceptance Progress</h3>
        <p className="text-xs text-gray-500 mt-1">
          Click an incomplete stage to mark it complete, or click a completed stage to view its note
        </p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-3">
          {APPLICATION_STAGES.map((stage, index) => {
            const isCompleted = isStageCompleted(stage.key)
            const record = getStageRecord(stage.key)
            const stageNumber = index + 1

            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => handleStageClick(stage.key)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  isCompleted
                    ? 'bg-green-50 border-green-300 hover:border-green-400 hover:bg-green-100/70 cursor-pointer'
                    : 'bg-gray-50 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-xs font-bold ${
                      isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    STAGE {stageNumber}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs font-bold text-white">{stageNumber}</span>
                    )}
                  </div>
                </div>

                <p
                  className={`text-sm font-medium leading-tight ${
                    isCompleted ? 'text-green-800' : 'text-gray-700'
                  }`}
                >
                  {stage.label}
                </p>

                {record && (
                  <p className="text-[10px] text-green-600 mt-2 truncate">
                    {formatDate(record.recorded_at)} · View note
                  </p>
                )}

                {!isCompleted && (
                  <p className="text-[10px] text-gray-400 mt-2">Click to complete</p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {viewingStageKey && (() => {
        const stageRecord = getStageRecord(viewingStageKey)
        if (!stageRecord) return null

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Stage Note
                  </h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {getStageLabel(viewingStageKey)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <p className="text-xs font-medium text-green-800">Completed</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    {formatDate(stageRecord.recorded_at)}
                    {stageRecord.admin_name ? ` · ${stageRecord.admin_name}` : ''}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <div className="w-full min-h-[120px] border-2 border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-900 leading-relaxed whitespace-pre-wrap break-words bg-gray-50">
                    {stageRecord.comment}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {selectedStage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Complete Stage
                </h4>
                <p className="text-sm text-gray-500 mt-0.5">
                  {getStageLabel(selectedStage)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value)
                    setError(null)
                  }}
                  placeholder="Enter details about this stage completion..."
                  rows={4}
                  disabled={isSubmitting}
                  autoFocus
                  className={`w-full bg-white border-2 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-0 focus:border-green-500 transition-colors resize-none ${
                    error ? 'border-red-300' : 'border-gray-200'
                  } ${isSubmitting ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!comment.trim() || isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Mark Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
