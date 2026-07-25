"use client"

import { use, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
  Shield,
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  Briefcase,
  ChevronRight,
} from 'lucide-react'
import { getStudentById, getStudentDocumentUrl } from '@/lib/adminQueries'
import { getAllApplications } from '@/lib/adminApplications'
import { getMyAdminProfile } from '@/lib/adminProfiles'
import { getMyProfile } from '@/lib/profiles'
import { DetailSection } from '@/components/DetailSection'
import { DetailGrid } from '@/components/DetailGrid'
import { DocumentCard } from '@/components/DocumentCard'
import { CARD_CLASS, PAGE_CLASS, DetailSkeleton } from '@/components/detailLayout'

type Gender = 'male' | 'female' | 'other'

type StudentProfile = {
  id: string
  first_name?: string
  middle_name?: string
  last_name?: string
  email?: string
  alternate_email?: string
  mobile_number?: string
  alternate_phone?: string
  whatsapp_number?: string
  emergency_contact_number?: string
  gender?: Gender
  date_of_birth?: string
  nationality?: string
  marital_status?: string
  short_bio?: string
  country?: string
  state?: string
  city?: string
  district?: string
  pincode?: string
  address_line_1?: string
  address_line_2?: string
  current_residential_address?: string
  passport_number?: string
  passport_issue_date?: string
  passport_expiry_date?: string
  passport_country_of_issue?: string
  aadhar_number?: string
  pan_number?: string
  driving_license_number?: string
  university_name?: string
  college_name?: string
  degree_name?: string
  branch_specialization?: string
  passport_url?: string
  passport_photo_url?: string
  aadhar_front_url?: string
  aadhar_back_url?: string
  pan_url?: string
  driving_license_url?: string
  digital_signature_url?: string
  profile_photo_url?: string
  updated_at?: string
  profiles?: { unique_id?: string; created_at?: string; role?: string } | { unique_id?: string; created_at?: string; role?: string }[] | null
}

type Application = {
  id: string
  status: string
  started_at?: string
  submitted_at?: string
  internships?: {
    title?: string
    city?: string
    country?: string
    badge?: string
  } | null
}

type AdminProfile = {
  first_name?: string
  last_name?: string
}

type Profile = {
  unique_id?: string
}

const PROFILE_COMPLETION_FIELDS = [
  'first_name',
  'last_name',
  'gender',
  'date_of_birth',
  'nationality',
  'marital_status',
  'email',
  'mobile_number',
  'emergency_contact_number',
  'country',
  'state',
  'city',
  'address_line_1',
  'pincode',
  'passport_number',
  'aadhar_number',
  'pan_number',
  'university_name',
  'college_name',
  'degree_name',
  'branch_specialization',
] as const

const DOCUMENT_FIELDS: { key: keyof StudentProfile; label: string }[] = [
  { key: 'profile_photo_url', label: 'Profile Photo' },
  { key: 'passport_url', label: 'Passport Document' },
  { key: 'passport_photo_url', label: 'Passport Photo' },
  { key: 'aadhar_front_url', label: 'Aadhar Front' },
  { key: 'aadhar_back_url', label: 'Aadhar Back' },
  { key: 'pan_url', label: 'PAN Card' },
  { key: 'driving_license_url', label: 'Driving License' },
  { key: 'digital_signature_url', label: 'Digital Signature' },
]

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

function getNestedProfile(student: StudentProfile | null | undefined) {
  if (!student?.profiles) return null
  return Array.isArray(student.profiles) ? student.profiles[0] : student.profiles
}

function displayValue(value?: string | null) {
  return value?.trim() ? value : '-'
}

function formatGenderText(gender?: Gender) {
  if (!gender) return '-'
  return gender.charAt(0).toUpperCase() + gender.slice(1)
}

function formatDate(dateString?: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(dateString?: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getStudentName(student: StudentProfile) {
  return [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(' ') || 'Unnamed Student'
}

function getStudentInitials(student: StudentProfile) {
  const first = student.first_name?.trim()
  const last = student.last_name?.trim()
  if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  if (first) return first.charAt(0).toUpperCase()
  return 'S'
}

function isProfileComplete(student: StudentProfile) {
  return PROFILE_COMPLETION_FIELDS.every((field) => Boolean(student[field]))
}

function getProfileCompletionPercentage(student: StudentProfile) {
  const filled = PROFILE_COMPLETION_FIELDS.filter((field) => Boolean(student[field])).length
  return Math.round((filled / PROFILE_COMPLETION_FIELDS.length) * 100)
}

function formatStatusText(status: string) {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-600'
    case 'submitted':
      return 'bg-blue-100 text-blue-600'
    case 'under_review':
      return 'bg-amber-100 text-amber-600'
    case 'approved':
      return 'bg-green-100 text-green-600'
    case 'rejected':
      return 'bg-red-100 text-red-600'
    case 'accepted':
      return 'bg-purple-100 text-purple-600'
    case 'closed':
      return 'bg-gray-100 text-gray-500'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export default function AdminStudentDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const { data: adminProfile } = useSWR('adminProfileStudentDetail', () => fetcher(getMyAdminProfile), {
    revalidateOnFocus: false,
  })

  const { data: myProfile } = useSWR('adminMyProfileStudentDetail', () => fetcher(getMyProfile), {
    revalidateOnFocus: false,
  })

  const { data: applications } = useSWR(
    student ? ['adminStudentApplications', id] : null,
    () => fetcher(() => getAllApplications({ student_id: id })),
    { revalidateOnFocus: true, revalidateOnReconnect: true }
  )

  useEffect(() => {
    async function loadStudent() {
      setLoading(true)
      const result = await getStudentById(id)

      if (result.error || !result.data) {
        setNotFound(true)
        setStudent(null)
      } else {
        setStudent(result.data as StudentProfile)
        setNotFound(false)
      }

      setLoading(false)
    }

    loadStudent()
  }, [id])

  const profileMeta = getNestedProfile(student)
  const profileComplete = student ? isProfileComplete(student) : false
  const completionPercentage = student ? getProfileCompletionPercentage(student) : 0

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

  const personalFields = useMemo(() => {
    if (!student) return []
    return [
      { label: 'First Name', value: displayValue(student.first_name) },
      { label: 'Middle Name', value: displayValue(student.middle_name) },
      { label: 'Last Name', value: displayValue(student.last_name) },
      { label: 'Gender', value: formatGenderText(student.gender) },
      { label: 'Date of Birth', value: formatDate(student.date_of_birth) },
      { label: 'Nationality', value: displayValue(student.nationality) },
      { label: 'Marital Status', value: displayValue(student.marital_status) },
    ]
  }, [student])

  const contactFields = useMemo(() => {
    if (!student) return []
    return [
      { label: 'Primary Email', value: displayValue(student.email) },
      { label: 'Alternate Email', value: displayValue(student.alternate_email) },
      { label: 'Mobile Number', value: displayValue(student.mobile_number) },
      { label: 'Alternate Phone', value: displayValue(student.alternate_phone) },
      { label: 'WhatsApp Number', value: displayValue(student.whatsapp_number) },
      { label: 'Emergency Contact', value: displayValue(student.emergency_contact_number) },
    ]
  }, [student])

  const addressFields = useMemo(() => {
    if (!student) return []
    return [
      { label: 'Country', value: displayValue(student.country) },
      { label: 'State', value: displayValue(student.state) },
      { label: 'City', value: displayValue(student.city) },
      { label: 'District', value: displayValue(student.district) },
      { label: 'Pincode', value: displayValue(student.pincode) },
      { label: 'Address Line 1', value: displayValue(student.address_line_1) },
      { label: 'Address Line 2', value: displayValue(student.address_line_2) },
      { label: 'Current Residential Address', value: displayValue(student.current_residential_address) },
    ]
  }, [student])

  const identityFields = useMemo(() => {
    if (!student) return []
    return [
      { label: 'Passport Number', value: displayValue(student.passport_number) },
      { label: 'Passport Issue Date', value: formatDate(student.passport_issue_date) },
      { label: 'Passport Expiry Date', value: formatDate(student.passport_expiry_date) },
      { label: 'Passport Country of Issue', value: displayValue(student.passport_country_of_issue) },
      { label: 'Aadhar Number', value: displayValue(student.aadhar_number) },
      { label: 'PAN Number', value: displayValue(student.pan_number) },
      { label: 'Driving License Number', value: displayValue(student.driving_license_number) },
    ]
  }, [student])

  const academicFields = useMemo(() => {
    if (!student) return []
    return [
      { label: 'University', value: displayValue(student.university_name) },
      { label: 'College', value: displayValue(student.college_name) },
      { label: 'Degree', value: displayValue(student.degree_name) },
      { label: 'Branch / Specialization', value: displayValue(student.branch_specialization) },
    ]
  }, [student])

  const applicationList = (applications as Application[] | undefined) ?? []

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <div className="bg-white border-b border-[#EEEEEE] px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
        <div className="relative flex items-center justify-center">
          <Link
            href="/admin/students"
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
              <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{adminName}</p>
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
        ) : notFound || !student ? (
          <div className="flex flex-col items-center justify-center py-24 px-4">
            <p className="text-gray-500 mb-4">Student not found.</p>
            <Link
              href="/admin/students"
              className="text-sm font-semibold text-[#8DC63F] hover:underline"
            >
              Back to Students
            </Link>
          </div>
        ) : (
          <div className={`${PAGE_CLASS} p-4 sm:p-6 lg:p-8 space-y-6`}>
            <div className="relative overflow-hidden rounded-2xl border border-[#EEEEEE] bg-gradient-to-br from-[#8DC63F] via-[#6BA82E] to-[#3B82F6]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
              <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0">
                  {getStudentInitials(student)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                      {displayValue(profileMeta?.unique_id)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        profileComplete ? 'bg-white text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {profileComplete ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      {profileComplete ? 'Complete Profile' : `${completionPercentage}% Complete`}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                    {getStudentName(student)}
                  </h1>
                  <p className="text-white/85 text-sm mt-1 truncate">{displayValue(student.email)}</p>
                  {student.short_bio && (
                    <p className="text-white/80 text-sm mt-3 line-clamp-2">{student.short_bio}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  icon: CalendarDays,
                  label: 'Joined',
                  value: formatDate(profileMeta?.created_at),
                },
                {
                  icon: Clock,
                  label: 'Last Updated',
                  value: formatDate(student.updated_at),
                },
                {
                  icon: User,
                  label: 'Gender',
                  value: formatGenderText(student.gender),
                },
                {
                  icon: MapPin,
                  label: 'Location',
                  value: [student.city, student.state, student.country].filter(Boolean).join(', ') || '-',
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="bg-white border border-[#EEEEEE] rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DetailSection
                title="Personal Information"
                description="Basic identity details provided by the student."
                icon={User}
              >
                <DetailGrid fields={personalFields} />
              </DetailSection>

              <DetailSection
                title="Contact Information"
                description="Primary and alternate contact channels."
                icon={Phone}
              >
                <DetailGrid fields={contactFields} />
              </DetailSection>
            </div>

            <DetailSection
              title="Address Details"
              description="Permanent and current residential address information."
              icon={MapPin}
            >
              <DetailGrid fields={addressFields} />
            </DetailSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DetailSection
                title="Identity Documents"
                description="Government IDs and passport details."
                icon={Shield}
              >
                <DetailGrid fields={identityFields} />
              </DetailSection>

              <DetailSection
                title="Academic Information"
                description="University and program details."
                icon={GraduationCap}
              >
                <DetailGrid fields={academicFields} />
              </DetailSection>
            </div>

            {student.short_bio && (
              <DetailSection
                title="About"
                description="Student bio and introduction."
                icon={FileText}
              >
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {student.short_bio}
                </p>
              </DetailSection>
            )}

            <DetailSection
              title="Uploaded Documents"
              description="View-only access to documents uploaded by the student."
              icon={FileText}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DOCUMENT_FIELDS.map(({ key, label }) => (
                  <DocumentCard
                    key={key}
                    label={label}
                    filePath={student[key] as string | undefined}
                    getSignedUrl={getStudentDocumentUrl}
                  />
                ))}
              </div>
            </DetailSection>

            <DetailSection
              title="Applications"
              description="Internship applications submitted by this student."
              icon={Briefcase}
            >
              {applicationList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#EEEEEE] bg-[#FAFAFA] p-8 text-center">
                  <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">No applications yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    This student has not started any internship applications.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applicationList.map((application) => (
                    <Link
                      key={application.id}
                      href={`/admin/applications/${application.id}`}
                      className="group flex items-center justify-between gap-4 rounded-xl border border-[#EEEEEE] p-4 hover:border-[#8DC63F] hover:bg-green-50/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {application.internships?.title || 'Untitled Internship'}
                          </p>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadgeClass(application.status)}`}
                          >
                            {formatStatusText(application.status)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {[application.internships?.city, application.internships?.country]
                            .filter(Boolean)
                            .join(', ') || 'Location not specified'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Started {formatDateTime(application.started_at)}
                          {application.submitted_at
                            ? ` · Submitted ${formatDateTime(application.submitted_at)}`
                            : ''}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-gray-500 group-hover:bg-[#8DC63F] group-hover:text-white transition-colors flex-shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </DetailSection>

            <div className={`${CARD_CLASS} bg-[#FAFAFA]`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Account Metadata</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Platform registration and profile update timestamps.
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500 space-y-1">
                  <p>
                    Registered: <span className="text-gray-700">{formatDateTime(profileMeta?.created_at)}</span>
                  </p>
                  <p>
                    Last profile update:{' '}
                    <span className="text-gray-700">{formatDateTime(student.updated_at)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
