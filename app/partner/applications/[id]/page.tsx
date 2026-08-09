'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowLeft } from 'lucide-react'
import {
  ApplicationPaperForm,
  type ApplicationPaperData,
  type ApplicationPaperInternship,
  type ApplicationPaperStudentProfile,
} from '@/components/ApplicationPaperForm'
import { DetailSkeleton, PAGE_CLASS } from '@/components/detailLayout'
import {
  getMyAssignedApplicationById,
  getPartnerApplicationFile,
  getPartnerStudentDocumentUrl,
} from '@/lib/partnerApplications'
import { getMyPartnerProfile } from '@/lib/partnerProfiles'
import { getMyProfile } from '@/lib/profiles'
import { formatApplicationReferenceId } from '@/lib/utils'

type ApplicationDetail = ApplicationPaperData & {
  internships?: ApplicationPaperInternship | null
  student_profiles?: ApplicationPaperStudentProfile | null
}

type PartnerProfile = {
  first_name?: string
  last_name?: string
}

type Profile = {
  unique_id?: string
}

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

  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

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

  useEffect(() => {
    async function loadApplication() {
      setLoading(true)
      const result = await getMyAssignedApplicationById(id)

      if (result.error || !result.data) {
        setNotFound(true)
        setApplication(null)
      } else {
        setApplication(result.data as ApplicationDetail)
        setNotFound(false)
      }

      setLoading(false)
    }

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

  return (
    <div className="min-h-screen bg-[#EFEDE8] flex flex-col">
      <div className="bg-white border-b border-[#DDD9D0] px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
        <div className="relative flex items-center justify-center">
          <Link
            href="/partner/applications"
            className="absolute left-0 flex items-center gap-2 text-gray-600 hover:text-[#8DC63F] transition-colors"
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
              <p className="text-xs text-[#8DC63F] font-medium">
                ID: {(myProfile as Profile | null)?.unique_id || 'N/A'}
              </p>
            </div>
            <Link
              href="/partner/profile"
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
              href="/partner/applications"
              className="text-sm font-semibold text-[#8DC63F] hover:underline"
            >
              Back to Applications
            </Link>
          </div>
        ) : (
          <div className={`${PAGE_CLASS} p-4 sm:p-6 lg:p-8 space-y-5`}>
            <div className="bg-white border border-[#EEEEEE] rounded-2xl p-4 sm:p-5">
              <p className="text-xs uppercase tracking-wide text-gray-500">Application</p>
              <p className="text-lg font-bold text-[#8DC63F] mt-1">
                {formatApplicationReferenceId(application.id, application.submitted_at)}
              </p>
            </div>

            <ApplicationPaperForm
              application={application}
              student={student}
              internship={internship}
              uniqueId={profileMeta?.unique_id}
              registeredAt={profileMeta?.created_at}
              mode="admin"
              getStudentDocUrl={(filePath) => getPartnerStudentDocumentUrl(id, filePath)}
              getApplicationDocUrl={(filePath) => getPartnerApplicationFile(id, filePath)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
