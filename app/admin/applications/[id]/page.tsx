'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  XCircle,
} from 'lucide-react'
import {
  ApplicationPaperForm,
  FormCell,
  type ApplicationPaperData,
  type ApplicationPaperInternship,
  type ApplicationPaperStudentProfile,
} from '@/components/ApplicationPaperForm'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { DetailSkeleton, PAGE_CLASS } from '@/components/detailLayout'
import { Textarea } from '@/components/ui/textarea'
import {
  approveApplication,
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
}

type AdminProfile = {
  first_name?: string
  last_name?: string
}

type Profile = {
  unique_id?: string
}

type ActionDialog = 'approve' | 'reject' | null

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

  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [actionDialog, setActionDialog] = useState<ActionDialog>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [remarks, setRemarks] = useState('')

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

  const loadApplication = async () => {
    setLoading(true)
    const result = await getApplicationById(id)

    if (result.error || !result.data) {
      setNotFound(true)
      setApplication(null)
    } else {
      setApplication(result.data as ApplicationDetail)
      setNotFound(false)
      setRemarks((result.data as ApplicationDetail).admin_remarks || '')
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

  const canDecide =
    application?.status === 'submitted' || application?.status === 'under_review'

  const closeActionDialog = () => {
    if (actionLoading) return
    setActionDialog(null)
  }

  const remarksRequired = !remarks.trim()

  const openDecisionDialog = (dialog: Exclude<ActionDialog, null>) => {
    if (remarksRequired) {
      toast.error('Administrative remarks are required before taking a decision')
      return
    }
    setActionDialog(dialog)
  }

  const handleActionConfirm = async () => {
    if (!application || !actionDialog) return

    if (remarksRequired) {
      toast.error('Administrative remarks are required before taking a decision')
      return
    }

    setActionLoading(true)

    const trimmedRemarks = remarks.trim()
    const result =
      actionDialog === 'approve'
        ? await approveApplication(application.id, trimmedRemarks)
        : await rejectApplication(application.id, trimmedRemarks)

    setActionLoading(false)

    if (result.error) {
      toast.error(
        typeof result.error === 'object' && result.error && 'message' in result.error
          ? String((result.error as { message: string }).message)
          : 'Action failed'
      )
      return
    }

    toast.success(
      actionDialog === 'approve'
        ? 'Application approved'
        : 'Application rejected'
    )
    setActionDialog(null)
    invalidateAdminApplications()
    await loadApplication()
  }

  return (
    <div className="min-h-screen bg-[#EFEDE8] flex flex-col">
      <div className="bg-white border-b border-[#DDD9D0] px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
        <div className="relative flex items-center justify-center">
          <Link
            href="/admin/applications"
            className="absolute left-0 flex items-center gap-2 text-gray-600 hover:text-[#8DC63F] transition-colors"
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
              <p className="text-xs text-[#8DC63F] font-medium">
                ID: {(myProfile as Profile | null)?.unique_id || 'N/A'}
              </p>
            </div>
            <Link
              href="/admin/profile"
              className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition-opacity flex-shrink-0"
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
              className="text-sm font-semibold text-[#8DC63F] hover:underline"
            >
              Back to Applications
            </Link>
          </div>
        ) : (
          <div className={`${PAGE_CLASS} p-4 sm:p-6 lg:p-8 space-y-5`}>
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
              decisionSlot={
                <div className="relative border-2 border-[#8DC63F] bg-[#F4FBE8] p-4 sm:p-5 shadow-[0_0_0_4px_rgba(141,198,63,0.15)]">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#8DC63F]" />
                  <div className="pl-2">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-sm bg-[#8DC63F] px-2.5 py-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                        Action Required
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mb-4">
                      <FormCell label="Application" value={applicationRef} />
                      <FormCell
                        label="Current Status"
                        value={formatApplicationStatusLabel(application.status)}
                      />
                      <FormCell label="Application Reviewer" value={adminName} />
                      <FormCell
                        label="Reviewer ID"
                        value={(myProfile as Profile | null)?.unique_id}
                      />
                    </div>

                    <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-700 mb-1.5">
                      Administrative Remarks <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Remarks are mandatory for every decision..."
                      className={`min-h-[110px] rounded-none bg-white focus-visible:ring-[#8DC63F] focus-visible:border-[#8DC63F] ${
                        remarksRequired
                          ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-200'
                          : 'border-[#8DC63F]/50'
                      }`}
                    />
                    <p className="text-[11px] text-gray-500 mt-2">
                      Remarks are mandatory before Approve or Reject.
                    </p>

                    {canDecide && (
                      <div className="mt-5 pt-4 border-t border-[#8DC63F]/40 flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openDecisionDialog('reject')}
                          disabled={remarksRequired}
                          className="inline-flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => openDecisionDialog('approve')}
                          disabled={remarksRequired}
                          className="inline-flex items-center gap-2 rounded-sm bg-[#8DC63F] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#7DB62F] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              }
            />
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={actionDialog === 'approve'}
        onOpenChange={(open) => {
          if (!open) closeActionDialog()
        }}
        variant="success"
        icon={<CheckCircle />}
        title="Approve Application?"
        description="The student will be marked as approved and your remarks will be saved with this application."
        confirmText="Approve"
        onConfirm={handleActionConfirm}
        isLoading={actionLoading}
        loadingText="Approving..."
      />

      <ConfirmationDialog
        open={actionDialog === 'reject'}
        onOpenChange={(open) => {
          if (!open) closeActionDialog()
        }}
        variant="danger"
        icon={<XCircle />}
        title="Reject Application?"
        description="This decision and your administrative remarks will be saved with the application."
        confirmText="Reject"
        onConfirm={handleActionConfirm}
        isLoading={actionLoading}
        loadingText="Rejecting..."
      />
    </div>
  )
}
