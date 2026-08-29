'use client'

import { use, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import {
  ArrowLeft,
  CheckCircle,
  EllipsisVertical,
  Trash2,
  XCircle,
} from 'lucide-react'
import {
  ApplicationPaperForm,
  FormCell,
  type ApplicationPaperData,
  type ApplicationPaperInternship,
  type ApplicationPaperStudentProfile,
} from '@/components/ApplicationPaperForm'
import { ApplicationTimeline } from '@/components/ApplicationTimeline'
import { ApplicationStagesStepper } from '@/components/ApplicationStagesStepper'
import { getMostRecentStageUpdate, getStageLabel, type ApplicationStageRecord } from '@/lib/applicationStages.shared'
import { getApplicationStages } from '@/lib/applicationStages'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { DetailSkeleton, PAGE_CLASS } from '@/components/detailLayout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import PartnerAssignBar from '@/components/PartnerAssignBar'
import { getApplicationTimeline } from '@/lib/applicationEvents'
import { buildApplicationTimeline, type TimelineStep } from '@/lib/applicationTimeline'
import {
  acceptApplicationScreening,
  approveApplication,
  deleteApplication,
  getApplicationById,
  getApplicationFile,
  rejectApplication,
} from '@/lib/adminApplications'
import { getStudentDocumentUrl } from '@/lib/adminQueries'
import { getMyAdminProfile } from '@/lib/adminProfiles'
import { getMyProfile } from '@/lib/profiles'
import { invalidateAdminApplications } from '@/lib/cache'
import {
  formatApplicationReferenceId,
  formatApplicationStatusLabel,
} from '@/lib/utils'

type ApplicationDetail = ApplicationPaperData & {
  internships?: ApplicationPaperInternship | null
  student_profiles?: ApplicationPaperStudentProfile | null
  partner_id?: string | null
  forwarded_at?: string | null
  partner_decided_at?: string | null
  partner_decision?: 'approve' | 'reject' | null
  partner_remarks?: string | null
  closed_at?: string | null
  rejection_message?: string | null
}

type AdminProfile = {
  first_name?: string
  last_name?: string
}

type Profile = {
  unique_id?: string
}

type ActionDialog =
  | 'accept'
  | 'reject'
  | 'approve'
  | 'final_reject'
  | 'delete'
  | null

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

export default function AdminApplicationDetails({
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
  const [actionDialog, setActionDialog] = useState<ActionDialog>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionMessage, setRejectionMessage] = useState('')
  const [finalRemarks, setFinalRemarks] = useState('')
  const [latestStage, setLatestStage] = useState<ApplicationStageRecord | null>(null)
  const partnerSectionRef = useRef<HTMLDivElement>(null)

  const { data: adminProfile } = useSWR(
    'adminProfileApplicationDetail',
    () => fetcher(getMyAdminProfile),
    { revalidateOnFocus: false }
  )

  const { data: myProfile } = useSWR(
    'adminMyProfileApplicationDetail',
    () => fetcher(getMyProfile),
    { revalidateOnFocus: false }
  )

  const loadTimeline = async (applicationId: string, app?: ApplicationDetail) => {
    const result = await getApplicationTimeline(applicationId)
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
    const result = await getApplicationById(id)

    if (result.error || !result.data) {
      setNotFound(true)
      setApplication(null)
      setTimelineSteps([])
    } else {
      const app = result.data as ApplicationDetail
      setApplication(app)
      setNotFound(false)
      setFinalRemarks(app.admin_remarks || '')
      await loadTimeline(app.id, app)

      if (app.status === 'accepted') {
        const stagesResult = await getApplicationStages(app.id)
        if (stagesResult.data) {
          setLatestStage(getMostRecentStageUpdate(stagesResult.data))
        } else {
          setLatestStage(null)
        }
      } else {
        setLatestStage(null)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    loadApplication()
  }, [id])

  const adminName =
    [(adminProfile as AdminProfile | null)?.first_name, (adminProfile as AdminProfile | null)?.last_name]
      .filter(Boolean)
      .join(' ') || 'Admin'

  const getAvatarInitials = () => {
    const profile = adminProfile as AdminProfile | null
    const first = profile?.first_name?.trim()
    const last = profile?.last_name?.trim()
    if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    if (first) return first.charAt(0).toUpperCase()
    return 'A'
  }

  const student = application?.student_profiles
  const internship = application?.internships
  const profileMeta = getNestedUniqueId(student)
  const applicationRef = application
    ? formatApplicationReferenceId(application.id, application.submitted_at)
    : ''

  const canScreen = application?.status === 'submitted'

  const showPartnerSection =
    application?.status === 'under_review' ||
    application?.status === 'admin_accepted' ||
    application?.status === 'forwarded_to_partner' ||
    application?.status === 'partner_review'

  const canFinalDecision = application?.status === 'partner_review'

  const isTerminal =
    application?.status === 'rejected' ||
    application?.status === 'approved' ||
    application?.status === 'accepted' ||
    application?.status === 'closed'

  const closeActionDialog = () => {
    if (actionLoading) return
    setActionDialog(null)
  }

  const handleActionConfirm = async () => {
    if (!application || !actionDialog) return

    if (actionDialog === 'delete') {
      setActionLoading(true)
      const result = await deleteApplication(application.id)
      setActionLoading(false)

      if (result.error) {
        return
      }

      setActionDialog(null)
      invalidateAdminApplications()
      router.push('/admin/applications')
      return
    }

    if (actionDialog === 'reject') {
      if (!rejectionMessage.trim()) {
        return
      }

      setActionLoading(true)
      const result = await rejectApplication(application.id, rejectionMessage.trim())
      setActionLoading(false)

      if (result.error) {
        return
      }

      setActionDialog(null)
      setRejectionMessage('')
      invalidateAdminApplications()
      await loadApplication()
      return
    }

    if (actionDialog === 'accept') {
      setActionLoading(true)
      const result = await acceptApplicationScreening(application.id)
      setActionLoading(false)

      if (result.error || !result.data) {
        return
      }

      const now = new Date().toISOString()
      setApplication((prev) =>
        prev
          ? {
              ...prev,
              status: 'under_review',
              reviewed_at: now,
            }
          : prev
      )
      setActionDialog(null)
      invalidateAdminApplications()
      await loadApplication()
      
      setTimeout(() => {
        partnerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
      return
    }

    if (actionDialog === 'approve' || actionDialog === 'final_reject') {
      if (!finalRemarks.trim()) {
        return
      }

      setActionLoading(true)
      const trimmed = finalRemarks.trim()
      const result =
        actionDialog === 'approve'
          ? await approveApplication(application.id, trimmed)
          : await rejectApplication(application.id, trimmed)

      setActionLoading(false)

      if (result.error) {
        return
      }

      setActionDialog(null)
      invalidateAdminApplications()
      await loadApplication()
    }
  }

  const screeningSlot =
    canScreen || showPartnerSection || canFinalDecision ? (
      <div className="space-y-5">
        {canScreen && (
          <div className="relative border-2 border-gr-primary bg-[#F4FBE8] p-4 sm:p-5 shadow-[0_0_0_4px_rgba(141,198,63,0.15)]">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gr-primary" />
            <div className="pl-2">
              <div className="mb-4 inline-flex items-center gap-2 rounded-sm bg-gr-primary px-2.5 py-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                  Screening Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mb-4">
                <FormCell label="Application" value={applicationRef} />
                <FormCell
                  label="Current Status"
                  value={formatApplicationStatusLabel(application!.status)}
                />
                <FormCell label="Application Reviewer" value={adminName} />
                <FormCell
                  label="Reviewer ID"
                  value={(myProfile as Profile | null)?.unique_id}
                />
              </div>

              <p className="text-sm text-gray-600 mb-5">
                Review the application form above. If everything looks good, accept it
                digitally. If you find issues, reject with a message — the student will be
                notified and the application will be closed.
              </p>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionDialog('reject')}
                  className="inline-flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setActionDialog('accept')}
                  className="inline-flex items-center gap-2 rounded-sm bg-gr-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-gr-primary-hover transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept
                </button>
              </div>
            </div>
          </div>
        )}

        {showPartnerSection && !canFinalDecision && (
          <div ref={partnerSectionRef} className="border-t border-[#DDD9D0] pt-5">
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gr-primary">
                Next Step
              </p>
              <h3 className="text-base font-bold text-gray-900 mt-1">
                Forward to Partner
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Search and assign a partner reviewer for this application.
              </p>
            </div>
            <PartnerAssignBar
              applicationId={application!.id}
              onAssigned={() => loadApplication()}
            />
          </div>
        )}

        {canFinalDecision && application?.partner_decision && (
          <div
            className={`relative border-2 p-4 sm:p-5 mb-5 ${
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
                className={`mb-3 inline-flex items-center gap-2 rounded-sm px-2.5 py-1 ${
                  application.partner_decision === 'approve' ? 'bg-gr-primary' : 'bg-red-500'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                  Partner Recommendation
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
                  Partner recommends{' '}
                  {application.partner_decision === 'approve' ? 'approval' : 'rejection'}
                </p>
              </div>

              {application.partner_remarks && (
                <div className="bg-white/60 rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Partner Remarks
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {application.partner_remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {canFinalDecision && (
          <div className="relative border-2 border-amber-400 bg-amber-50 p-4 sm:p-5">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400" />
            <div className="pl-2">
              <div className="mb-4 inline-flex items-center gap-2 rounded-sm bg-amber-500 px-2.5 py-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                  Final Decision Required
                </span>
              </div>

              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-700 mb-1.5">
                Administrative Remarks <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={finalRemarks}
                onChange={(e) => setFinalRemarks(e.target.value)}
                placeholder="Final decision remarks..."
                className="min-h-[100px] rounded-none bg-white border-amber-300 focus-visible:ring-amber-200 focus-visible:border-amber-400"
              />

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionDialog('final_reject')}
                  disabled={!finalRemarks.trim()}
                  className="inline-flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setActionDialog('approve')}
                  disabled={!finalRemarks.trim()}
                  className="inline-flex items-center gap-2 rounded-sm bg-gr-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-gr-primary-hover disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
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
            href="/admin/applications"
            className="absolute left-0 flex items-center gap-2 text-gray-600 hover:text-gr-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>

          <Link href="/admin/dashboard" className="flex items-center gap-2">
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
                {adminName}
              </p>
              <p className="text-xs text-gr-primary font-medium">
                ID: {(myProfile as Profile | null)?.unique_id || 'N/A'}
              </p>
            </div>
            <Link
              href="/admin/profile"
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
              href="/admin/applications"
              className="text-sm font-semibold text-gr-primary hover:underline"
            >
              Back to Applications
            </Link>
          </div>
        ) : (
          <div className={`${PAGE_CLASS} p-4 sm:p-6 lg:p-8 space-y-5`}>
            {application.status === 'accepted' ? (
              <>
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
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {latestStage.comment}
                          </p>
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
                              {application.accepted_at
                                ? new Date(application.accepted_at).toLocaleString('en-GB', {
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
                            No stages recorded yet. Click on a stage below to begin tracking progress.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <ApplicationStagesStepper 
                  applicationId={application.id} 
                  onStageUpdated={setLatestStage}
                />
              </>
            ) : application.status === 'closed' && timelineSteps.some(step => step.actorRole === 'system') ? (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-300 rounded-lg p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-7 h-7 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-700">Application Auto-Closed</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      This application was automatically closed by the system on{' '}
                      <span className="font-semibold">
                        {application.closed_at
                          ? new Date(application.closed_at).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      The student chose to accept a different approved application. This application is no longer active.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <ApplicationTimeline steps={timelineSteps} applicationRef={applicationRef} />
            )}

            <ApplicationPaperForm
              application={application}
              student={student}
              internship={internship}
              uniqueId={profileMeta?.unique_id}
              registeredAt={profileMeta?.created_at}
              mode="admin"
              showAdminLinks
              getStudentDocUrl={getStudentDocumentUrl}
              getApplicationDocUrl={getApplicationFile}
              decisionSlot={screeningSlot}
            />

            {isTerminal && (
              <div className="flex justify-center pt-2 pb-10">
                <Link
                  href="/admin/applications"
                  className="inline-flex items-center justify-center rounded-xl bg-gr-primary px-8 py-3 text-sm font-semibold text-white hover:bg-gr-primary-hover transition-colors"
                >
                  Go to Applications
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {application && !notFound && (
        <div className="fixed bottom-6 right-6 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 shadow-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                aria-label="Application actions"
              >
                <EllipsisVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setActionDialog('delete')}
              >
                <Trash2 className="h-4 w-4" />
                Delete application
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <ConfirmationDialog
        open={actionDialog === 'accept'}
        onOpenChange={(open) => {
          if (!open) closeActionDialog()
        }}
        variant="success"
        icon={<CheckCircle />}
        title="Accept Application?"
        description="You are digitally accepting this application at the screening stage. You can then forward it to a partner reviewer."
        confirmText="Accept"
        onConfirm={handleActionConfirm}
        isLoading={actionLoading}
        loadingText="Accepting..."
      />

      <ConfirmationDialog
        open={actionDialog === 'reject'}
        onOpenChange={(open) => {
          if (!open) closeActionDialog()
        }}
        variant="danger"
        icon={<XCircle />}
        title="Reject & Close Application?"
        description={
          <div className="space-y-3">
            <p>
              The application will be rejected and closed. The student will receive your
              message as a notification.
            </p>
            <Textarea
              value={rejectionMessage}
              onChange={(e) => setRejectionMessage(e.target.value)}
              placeholder="Write your rejection message for the student..."
              className="min-h-[100px] rounded-lg border-red-200 focus-visible:ring-red-200"
            />
          </div>
        }
        confirmText="Reject & Close"
        onConfirm={handleActionConfirm}
        isLoading={actionLoading}
        loadingText="Rejecting..."
      />

      <ConfirmationDialog
        open={actionDialog === 'approve'}
        onOpenChange={(open) => {
          if (!open) closeActionDialog()
        }}
        variant="success"
        icon={<CheckCircle />}
        title="Approve Application?"
        description="This is the final approval. The student will be notified."
        confirmText="Approve"
        onConfirm={handleActionConfirm}
        isLoading={actionLoading}
        loadingText="Approving..."
      />

      <ConfirmationDialog
        open={actionDialog === 'final_reject'}
        onOpenChange={(open) => {
          if (!open) closeActionDialog()
        }}
        variant="danger"
        icon={<XCircle />}
        title="Reject Application?"
        description="This is the final rejection. The student will be notified with your remarks."
        confirmText="Reject"
        onConfirm={handleActionConfirm}
        isLoading={actionLoading}
        loadingText="Rejecting..."
      />

      <ConfirmationDialog
        open={actionDialog === 'delete'}
        onOpenChange={(open) => {
          if (!open) closeActionDialog()
        }}
        variant="danger"
        icon={<Trash2 />}
        title="Delete Application?"
        description="This will permanently delete the application and all uploaded documents. This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleActionConfirm}
        isLoading={actionLoading}
        loadingText="Deleting..."
      />
    </div>
  )
}
