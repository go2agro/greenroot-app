'use client'

import { useState } from 'react'
import { getMessage } from '@/lib/messages'
import { BTN_ACCEPT_OFFER } from '@/lib/appConfig'
import { CheckCircle2, Loader2, AlertCircle, Info } from 'lucide-react'
import { acceptApplication } from '@/lib/studentApplications'
import { formatApplicationReferenceId } from '@/lib/utils'

type AcceptApplicationSectionProps = {
  applicationId: string
  submittedAt?: string
  onAccepted?: () => void
}

export function AcceptApplicationSection({
  applicationId,
  submittedAt,
  onAccepted,
}: AcceptApplicationSectionProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [closedCount, setClosedCount] = useState(0)

  const applicationRefId = formatApplicationReferenceId(applicationId, submittedAt)
  const expectedText = `I am accepting this application ${applicationRefId}`
  const isTextValid = confirmationText.trim() === expectedText

  const handleAccept = async () => {
    if (!isTextValid) {
      setError('Please type the exact confirmation text shown above.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await acceptApplication(applicationId, confirmationText, applicationRefId)

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error.message || 'Failed to accept application')
      return
    }

    setSuccess(true)
    setClosedCount(result.data?.closedCount ?? 0)
    onAccepted?.()
  }

  if (success) {
    return (
      <div className="bg-[#FFFEFA] border border-[#D6D1C4] rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-green-800">Application Accepted</h3>
              <p className="text-sm text-green-600">{getMessage('success', 'offerAccept')}</p>
            </div>
          </div>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Congratulations! Your acceptance has been recorded. For any queries or to know about the next steps, please reach out to us via the{' '}
              <a href="/contact" className="font-semibold text-green-700 underline hover:text-green-900">
                Contact Us
              </a>{' '}
              section.
            </p>
          </div>
          {closedCount > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  {closedCount} other approved application{closedCount > 1 ? 's have' : ' has'} been automatically closed as you can only proceed with one internship.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#FFFEFA] border border-[#D6D1C4] rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-300 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-yellow-800">Accept This Application</h3>
            <p className="text-sm text-yellow-700">Start your internship process</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-800">Important Notice</p>
              <p className="text-sm text-amber-700">
                You can only accept <strong>one</strong> approved application. Once you accept this application, all your other approved applications will be automatically closed and cannot be reopened.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            To confirm your acceptance, please type the following text exactly:
          </p>
          
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <code className="text-sm text-gray-900 font-semibold break-all select-none">
              {expectedText}
            </code>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type confirmation text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={confirmationText}
              onChange={(e) => {
                setConfirmationText(e.target.value)
                setError(null)
              }}
              placeholder="Type the exact text shown above..."
              rows={2}
              disabled={isSubmitting}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              onPaste={(e) => e.preventDefault()}
              className={`w-full bg-white border-2 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors ${
                error ? 'border-red-300' : isTextValid ? 'border-green-400' : 'border-gray-300'
              } ${isSubmitting ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
            />
            {isTextValid && (
              <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Text matches! You can proceed.
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={!isTextValid || isSubmitting}
          className="w-full bg-yellow-500 text-gray-900 rounded-xl py-4 font-semibold text-base hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {getMessage('loading', 'processing')}
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              {BTN_ACCEPT_OFFER}
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By accepting, you confirm that you want to proceed with this internship and understand that other approved applications will be closed.
        </p>
      </div>
    </div>
  )
}
