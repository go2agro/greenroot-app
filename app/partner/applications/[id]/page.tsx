'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import {
  ApplicationPaperForm,
  FormCell,
  type ApplicationPaperData,
  type ApplicationPaperInternship,
  type ApplicationPaperStudentProfile,
} from '@/components/ApplicationPaperForm'
import { ApplicationTimeline } from '@/components/ApplicationTimeline'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { DetailSkeleton, PAGE_CLASS } from '@/components/detailLayout'
import PartnerBottomNavigation from '@/components/PartnerBottomNavigation'
import { Textarea } from '@/components/ui/textarea'
import { getPartnerApplicationTimeline } from '@/lib/applicationEvents'
import { buildApplicationTimeline, type TimelineStep } from '@/lib/applicationTimeline'
import {
  getMyAssignedApplicationById,
  getPartnerApplicationFile,
  getPartnerStudentDocumentUrl,
  submitPartnerDecision,
} from '@/lib/partnerApplications'
import { getMyPartnerProfile } from '@/lib/partnerProfiles'
import { getMyProfile } from '@/lib/profiles'
import {
  formatApplicationReferenceId,
  formatApplicationStatusLabel,
} from '@/lib/utils'

type ApplicationDetail = ApplicationPaperData & {
  internships?: ApplicationPaperInternship | null
  student_profiles?: ApplicationPaperStudentProfile | null
  partner_id?: string | null
  reviewed_at?: string | null
  partner_decision?: 'approve' | 'reject' | null
  partner_remarks?: string | null
  partner_decided_at?: string | null
}

type PartnerProfile = {
  first_name?: string
  last_name?: string
}

type Profile = {
  unique_id?: string
}

type DecisionDialog = 'approve' | 'reject' | null

const fetcher = async (fn: () => Promise<{ data: unknown; error: unknown }>) => {
  const res = await fn()
  if (res.error) {
    throw new Error(
      typeof res.error === 'object' && res.error && 'message' in res.error
        ? String((res.error as { message: string }).message)
        : 'Failed to load data'
    )
  }
  return res.data
}

function getNestedUniqueId(student?: ApplicationPaperStudentProfile | null) {
  if (!student?.profiles) return null
  return Array.isArray(student.profiles) ? student.profiles[0] : student.profiles
}

export default function PartnerApplicationDetails({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [decisionDialog, setDecisionDialog] = useState<DecisionDialog>(null)
  const [decisionLoading, setDecisionLoading] = useState(false)
  const [remarks, setRemarks] = useState('')

  const { data: partnerProfile } = useSWR(
    'partnerProfileApplicationDetail',
    () => fetcher(getMyPartnerProfile),
    { revalidateOnFocus: false }
  )

  const { data: myProfile } = useSWR(
    'partnerMyProfileApplicationDetail',
    () => fetcher(getMyProfile),
    { revalidateOnFocus: false }
  )

  const loadTimeline = async (applicationId: string, app?: ApplicationDetail) => {
    const result = await getPartnerApplicationTimeline(applicationId)
    if (!result.error && result.data?.timeline?.length) {
      setTimelineSteps(result.data.timeline as TimelineStep[])
      return
    }

    if (app) {
      setTimelineSteps(buildApplicationTimeline(app))
    }
  }

  const loadApplication = async () => {
    setLoading(true)
    const result = await getMyAssignedApplicationById(id)

    if (result.error || !result.data) {
      setNotFound(true)
      setApplication(null)
      setTimelineSteps([])
    } else {
      const app = result.data as ApplicationDetail
      setApplication(app)
      setNotFound(false)
      setRemarks(app.partner_remarks || '')
      await loadTimeline(app.id, app)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadApplication()
  }, [id])

  const partnerName =
    [(partnerProfile as PartnerProfile | null)?.first_name, (partnerProfile as PartnerProfile | null)?.last_name]
      .filter(Boolean)
      .join(' ') || 'Partner'

  const getAvatarInitials = () => {
    const profile = partnerProfile as PartnerProfile | null
    const first = profile?.first_name?.trim()
    const last = profile?.last_name?.trim()
    if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    if (first) return first.charAt(0).toUpperCase()
    return 'P'
  }

  const student = application?.student_profiles
  const internship = application?.internships
  const profileMeta = getNestedUniqueId(student)
  const applicationRef = application
    ? formatApplicationReferenceId(application.id, application.submitted_at)
    : ''

  const canDecide =
    application &&
    ['under_review', 'forwarded_to_partner'].includes(application.status) &&
    !application.partner_decision

  const hasDecided = application?.partner_decision

  const closeDecisionDialog = () => {
    if (decisionLoading) return
    setDecisionDialog(null)
  }

  const handleDecisionConfirm = async () => {
    if (!application || !decisionDialog) return

    if (!remarks.trim()) {
      return
    }

    setDecisionLoading(true)
    const result = await submitPartnerDecision(application.id, decisionDialog, remarks.trim())
    setDecisionLoading(false)

    if (result.error || !result.data) {
      return
    }

    setDecisionDialog(null)
    await loadApplication()
  }

  const decisionSlot =
    canDecide || hasDecided ? (
      <div className="space-y-5">
        {canDecide && (
          <div className="relative border-2 border-gr-secondary bg-gr-secondary/10 p-4 sm:p-5 shadow-[0_0_0_4px_color-mix(in_srgb,var(--gr-secondary)_15%,transparent)]">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gr-secondary" />
            <div className="pl-2">
              <div className="mb-4 inline-flex items-center gap-2 rounded-sm bg-gr-secondary px-2.5 py-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                  Your Decision Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mb-4">
                <FormCell label="Application" value={applicationRef} />
                <FormCell
                  label="Current Status"
                  value={formatApplicationStatusLabel(application!.status)}
                />
                <FormCell label="Reviewing Partner" value={partnerName} />
                <FormCell
                  label="Partner ID"
                  value={(myProfile as Profile | null)?.unique_id}
                />
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Review the application thoroughly. Your decision and remarks will be sent
                to the admin for final review. The admin will make the final decision and
                notify the student.
              </p>

              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-700 mb-1.5">
                Your Remarks <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Provide detailed remarks about your decision. This will only be visible to the admin..."
                className={`min-h-[120px] rounded-none bg-white focus-visible:ring-gr-secondary focus-visible:border-gr-secondary ${
                  !remarks.trim()
                    ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-200'
                    : 'border-gr-secondary/50'
                }`}
              />
              <p className="text-[11px] text-gray-500 mt-2">
                Your remarks will only be visible to the admin, not the student.
              </p>

              <div className="mt-5 pt-4 border-t border-gr-secondary/40 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionDialog('reject')}
                  disabled={!remarks.trim()}
                  className="inline-flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  Recommend Rejection
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionDialog('approve')}
                  disabled={!remarks.trim()}
                  className="inline-flex items-center gap-2 rounded-sm bg-gr-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-gr-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  Recommend Approval
                </button>
              </div>
            </div>
          </div>
        )}

        {hasDecided && (
          <div
            className={`relative border-2 p-4 sm:p-5 ${
              application.partner_decision === 'approve'
                ? 'border-gr-primary bg-[#F4FBE8]'
                : 'border-red-300 bg-red-50'
            }`}
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                application.partner_decision === 'approve' ? 'bg-gr-primary' : 'bg-red-400'
              }`}
            />
            <div className="pl-2">
              <div
                className={`mb-4 inline-flex items-center gap-2 rounded-sm px-2.5 py-1 ${
                  application.partner_decision === 'approve'
                    ? 'bg-gr-primary'
                    : 'bg-red-500'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                  Decision Submitted
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {application.partner_decision === 'approve' ? (
                  <CheckCircle className="w-5 h-5 text-gr-primary" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <p
                  className={`font-semibold ${
                    application.partner_decision === 'approve'
                      ? 'text-[#5F8F2D]'
                      : 'text-red-700'
                  }`}
                >
                  You recommended{' '}
                  {application.partner_decision === 'approve' ? 'approval' : 'rejection'}
                </p>
              </div>

              <div className="bg-white/60 rounded-lg border border-gray-200 p-3 mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Your Remarks
                </p>
                <p className="text-sm text-gray-700">{application.partner_remarks}</p>
              </div>

              <p className="text-sm text-gray-500">
                The admin has received your decision and will make the final call. The
                student will be notified by the admin.
              </p>
            </div>
          </div>
        )}
      </div>
    ) : null

  return (
    <div className="min-h-screen bg-[#EFEDE8] flex flex-col">
      <div className="bg-white border-b border-[#DDD9D0] px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
        <div className="relative flex items-center justify-center">
          <Link
            href="/partner/applications"
            className="absolute left-0 flex items-center gap-2 text-gray-600 hover:text-gr-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>

          <Link href="/partner/dashboard" className="flex items-center gap-2">
            <Image
              src="/greenroot-logo.svg"
              alt="GreenRoot"
              width={32}
              height={32}
              priority
            />
            <span className="text-xl font-bold text-gray-900">GreenRoot</span>
          </Link>

          <div className="absolute right-0 flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                {partnerName}
              </p>
              <p className="text-xs text-gr-primary font-medium">
                ID: {(myProfile as Profile | null)?.unique_id || 'N/A'}
              </p>
            </div>
            <Link
              href="/partner/profile"
              className="w-10 h-10 rounded-full bg-gr-secondary flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition-opacity flex-shrink-0"
            >
              {getAvatarInitials()}
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <DetailSkeleton />
        ) : notFound || !application ? (
          <div className="flex flex-col items-center justify-center py-24 px-4">
            <p className="text-gray-500 mb-4">Application not found.</p>
            <Link
              href="/partner/applications"
              className="text-sm font-semibold text-gr-primary hover:underline"
            >
              Back to Applications
            </Link>
          </div>
        ) : (
          <div className={`${PAGE_CLASS} p-4 sm:p-6 lg:p-8 space-y-5`}>
            <ApplicationTimeline steps={timelineSteps} applicationRef={applicationRef} />

            <ApplicationPaperForm
              application={application}
              student={student}
              internship={internship}
              uniqueId={profileMeta?.unique_id}
              registeredAt={profileMeta?.created_at}
              mode="admin"
              getStudentDocUrl={(filePath) => getPartnerStudentDocumentUrl(id, filePath)}
              getApplicationDocUrl={(filePath) => getPartnerApplicationFile(id, filePath)}
              decisionSlot={decisionSlot}
            />

            {hasDecided && (
              <div className="flex justify-center pt-2 pb-10">
                <Link
                  href="/partner/applications"
                  className="inline-flex items-center justify-center rounded-xl bg-gr-primary px-8 py-3 text-sm font-semibold text-white hover:bg-gr-primary-hover transition-colors"
                >
                  Go to Applications
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={decisionDialog === 'approve'}
        onOpenChange={(open) => {
          if (!open) closeDecisionDialog()
        }}
        variant="success"
        icon={<CheckCircle />}
        title="Recommend Approval?"
        description="Your recommendation and remarks will be sent to the admin for final review. The admin will make the final decision."
        confirmText="Recommend Approval"
        onConfirm={handleDecisionConfirm}
        isLoading={decisionLoading}
        loadingText="Submitting..."
      />

      <ConfirmationDialog
        open={decisionDialog === 'reject'}
        onOpenChange={(open) => {
          if (!open) closeDecisionDialog()
        }}
        variant="danger"
        icon={<XCircle />}
        title="Recommend Rejection?"
        description="Your recommendation and remarks will be sent to the admin for final review. The admin will make the final decision."
        confirmText="Recommend Rejection"
        onConfirm={handleDecisionConfirm}
        isLoading={decisionLoading}
        loadingText="Submitting..."
      />

      <PartnerBottomNavigation />
    </div>
  )
}
