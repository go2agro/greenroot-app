'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import {
  formatApplicationReferenceId,
  formatApplicationStatusLabel,
  formatStudentStatusLabel,
} from '@/lib/utils'

export type ApplicationAnswer = {
  field_key: string
  answer_text?: string
  file_url?: string
  file_name?: string
  file_type?: string
  step_number?: number
  updated_at?: string
}

export type ApplicationPaperStudentProfile = {
  id?: string
  first_name?: string
  middle_name?: string
  last_name?: string
  email?: string
  alternate_email?: string
  mobile_number?: string
  phone_number?: string
  alternate_phone?: string
  whatsapp_number?: string
  emergency_contact_number?: string
  university_name?: string
  college_name?: string
  degree_name?: string
  degree?: string
  branch_specialization?: string
  gender?: string
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
  passport_url?: string
  passport_photo_url?: string
  aadhar_front_url?: string
  aadhar_back_url?: string
  pan_url?: string
  driving_license_url?: string
  digital_signature_url?: string
  profile_photo_url?: string
  updated_at?: string
  profiles?:
    | { unique_id?: string; created_at?: string; role?: string }
    | { unique_id?: string; created_at?: string; role?: string }[]
    | null
}

export type ApplicationPaperInternship = {
  id?: string
  title?: string
  subtitle?: string
  badge?: string
  city?: string
  country?: string
  flag_emoji?: string
  duration_months?: number
  stipend_monthly?: number
  stipend_yearly?: number
  work_mode?: string
  start_date?: string
  short_description?: string
  long_description?: string
  key_responsibilities?: string | string[]
  skills_learned?: string | { icon?: string; name?: string }[]
  eligibility_requirements?: string | string[]
  stipend_benefits?: string | string[]
}

export type ApplicationPaperData = {
  id: string
  student_id: string
  internship_id: string
  status: string
  current_step?: number
  started_at?: string
  submitted_at?: string
  reviewed_at?: string
  decided_at?: string
  accepted_at?: string
  updated_at?: string
  admin_remarks?: string
  application_answers?: ApplicationAnswer[]
}

export type SignedUrlResult = {
  data: { signedUrl?: string } | null
  error: unknown
}

export type GetSignedUrl = (filePath: string) => Promise<SignedUrlResult>

type Language = {
  language?: string
  read?: string
  write?: string
  speak?: string
}

export const IDENTITY_DOCUMENTS: {
  key: keyof ApplicationPaperStudentProfile
  label: string
}[] = [
  { key: 'profile_photo_url', label: 'Profile Photo' },
  { key: 'passport_url', label: 'Passport Document' },
  { key: 'passport_photo_url', label: 'Passport Photo' },
  { key: 'aadhar_front_url', label: 'Aadhar Front' },
  { key: 'aadhar_back_url', label: 'Aadhar Back' },
  { key: 'pan_url', label: 'PAN Card' },
  { key: 'driving_license_url', label: 'Driving License' },
  { key: 'digital_signature_url', label: 'Digital Signature' },
]

function blank(value?: string | number | null) {
  if (value === null || value === undefined) return '—'
  const text = String(value).trim()
  return text || '—'
}

function formatDate(dateString?: string) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(dateString?: string) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-700 border-gray-200'
    case 'submitted':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'under_review':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'admin_accepted':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    case 'forwarded_to_partner':
      return 'bg-sky-50 text-sky-800 border-sky-200'
    case 'partner_review':
      return 'bg-violet-50 text-violet-800 border-violet-200'
    case 'approved':
      return 'bg-green-50 text-green-800 border-green-200'
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'accepted':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

function getStudentName(student?: ApplicationPaperStudentProfile | null) {
  if (!student) return 'Unknown Student'
  return (
    [student.first_name, student.middle_name, student.last_name]
      .filter(Boolean)
      .join(' ') || 'Unnamed Student'
  )
}

function getAnswerMap(answers?: ApplicationAnswer[]) {
  const map = new Map<string, ApplicationAnswer>()
  answers?.forEach((answer) => {
    if (answer.field_key) map.set(answer.field_key, answer)
  })
  return map
}

function parseLanguages(raw?: string): Language[] {
  if (!raw?.trim()) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function isPdfFile(fileType?: string, fileName?: string) {
  const type = (fileType || '').toLowerCase()
  const name = (fileName || '').toLowerCase()
  return type.includes('pdf') || name.endsWith('.pdf')
}

function isImageFile(fileType?: string, fileName?: string) {
  const type = (fileType || '').toLowerCase()
  const name = (fileName || '').toLowerCase()
  return (
    type.includes('image') ||
    /\.(jpe?g|png|gif|webp|bmp)$/i.test(name)
  )
}

export function FormCell({
  label,
  value,
  className,
}: {
  label: string
  value?: string | number | null
  className?: string
}) {
  return (
    <div className={`min-w-0 py-2.5 ${className ?? ''}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-sm text-gray-900 border-b border-dotted border-gray-300 pb-1.5 break-words leading-relaxed">
        {blank(value)}
      </p>
    </div>
  )
}

export function FormBlock({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400 mb-1.5">
        {label}
      </p>
      <div className="min-h-[72px] border border-gray-200 bg-gr-background px-3 py-2.5 text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
        {blank(value)}
      </div>
    </div>
  )
}

export function FormSection({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="pt-7 first:pt-0">
      <div className="flex items-baseline gap-3 border-b-2 border-gray-900 pb-2 mb-3">
        <span className="text-sm font-bold text-gray-900 tabular-nums">{number}.</span>
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-gray-900">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

export function DocumentRow({
  index,
  label,
  subtitle,
  filePath,
  fileType,
  fileName,
  openingDoc,
  onView,
  getSignedUrl,
}: {
  index: number
  label: string
  subtitle?: string
  filePath?: string
  fileType?: string
  fileName?: string
  openingDoc: string | null
  onView: (path: string) => void
  getSignedUrl?: GetSignedUrl
}) {
  const uploaded = Boolean(filePath?.trim())
  const isPdf = isPdfFile(fileType, fileName || label)
  const isImage = !isPdf && isImageFile(fileType, fileName || label)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!uploaded || !isImage || !filePath || !getSignedUrl) {
      setPreviewUrl(null)
      return
    }

    let cancelled = false

    getSignedUrl(filePath).then((result) => {
      if (!cancelled && result.data?.signedUrl) {
        setPreviewUrl(result.data.signedUrl)
      }
    })

    return () => {
      cancelled = true
    }
  }, [uploaded, isImage, filePath, getSignedUrl])

  return (
    <li className="flex items-center justify-between gap-3 px-3 py-3 bg-white">
      <div className="min-w-0 flex items-start gap-3">
        <span className="text-xs font-bold text-gray-400 tabular-nums pt-0.5">
          {String(index).padStart(2, '0')}
        </span>
        {uploaded && isImage && previewUrl ? (
          <div className="w-12 h-12 rounded-sm border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
        ) : uploaded && isPdf ? (
          <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
        ) : uploaded && isImage ? (
          <ImageIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5 uppercase">
            {subtitle || (uploaded ? (isPdf ? 'PDF' : isImage ? 'Image' : 'Uploaded') : 'Not uploaded')}
          </p>
        </div>
      </div>
      {uploaded ? (
        <button
          type="button"
          onClick={() => filePath && onView(filePath)}
          disabled={openingDoc === filePath}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gr-primary hover:text-[#7DB62F] disabled:opacity-50 flex-shrink-0"
        >
          {openingDoc === filePath ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isImage ? (
            <ImageIcon className="w-3.5 h-3.5" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          View
        </button>
      ) : (
        <span className="text-xs text-gray-400 flex-shrink-0">Missing</span>
      )}
    </li>
  )
}

export type ApplicationPaperFormProps = {
  application: ApplicationPaperData
  student?: ApplicationPaperStudentProfile | null
  internship?: ApplicationPaperInternship | null
  uniqueId?: string | null
  registeredAt?: string | null
  mode: 'admin' | 'student'
  getStudentDocUrl: GetSignedUrl
  getApplicationDocUrl: GetSignedUrl
  decisionSlot?: React.ReactNode
  showAdminLinks?: boolean
}

export function ApplicationPaperForm({
  application,
  student,
  internship,
  uniqueId,
  registeredAt,
  mode,
  getStudentDocUrl,
  getApplicationDocUrl,
  decisionSlot,
  showAdminLinks = false,
}: ApplicationPaperFormProps) {
  const [openingDoc, setOpeningDoc] = useState<string | null>(null)

  const applicationRef = formatApplicationReferenceId(
    application.id,
    application.submitted_at
  )

  const answerMap = useMemo(
    () => getAnswerMap(application.application_answers),
    [application.application_answers]
  )

  const languages = useMemo(
    () =>
      parseLanguages(answerMap.get('languages')?.answer_text).filter(
        (l) => l.language
      ),
    [answerMap]
  )

  const documentAnswers = useMemo(
    () =>
      (application.application_answers ?? [])
        .filter(
          (answer) =>
            answer.field_key?.startsWith('doc_upload_') &&
            Boolean(answer.file_url?.trim() || answer.file_name?.trim())
        )
        .sort((a, b) => {
          const aIndex = Number.parseInt(
            a.field_key?.replace('doc_upload_', '') || '0',
            10
          )
          const bIndex = Number.parseInt(
            b.field_key?.replace('doc_upload_', '') || '0',
            10
          )
          return aIndex - bIndex
        }),
    [application.application_answers]
  )

  const academicUniversity =
    answerMap.get('academic_university')?.answer_text || student?.university_name
  const academicCollege =
    answerMap.get('academic_college')?.answer_text || student?.college_name
  const academicDegree =
    answerMap.get('academic_degree')?.answer_text ||
    student?.degree_name ||
    student?.degree
  const academicBranch =
    answerMap.get('academic_branch')?.answer_text || student?.branch_specialization
  const academicStatus = answerMap.get('academic_current_status')?.answer_text
  const academicYear = answerMap.get('academic_graduation_year')?.answer_text

  const showAdminRemarks =
    mode === 'student' && Boolean(application.admin_remarks?.trim())

  const openSignedFile = async (filePath: string, getter: GetSignedUrl) => {
    setOpeningDoc(filePath)
    const result = await getter(filePath)
    setOpeningDoc(null)

    if (result.error || !result.data?.signedUrl) {
      return
    }

    window.open(result.data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <article className="bg-white border border-gr-border shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <header className="border-b-4 border-double border-gray-900 px-5 sm:px-8 pt-7 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gr-primary">
              GreenRoot
            </p>
            <h1 className="mt-1 text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight">
              Internship Application
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Official application record for administrative review
            </p>
          </div>
          <div className="sm:text-right space-y-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                Application No.
              </p>
              <p className="text-xl font-bold text-gray-900 tracking-wide">
                {applicationRef}
              </p>
            </div>
            <span
              className={`inline-flex px-2.5 py-1 rounded-sm text-xs font-semibold border ${getStatusBadgeClass(application.status)}`}
            >
              {mode === 'student' ? formatStudentStatusLabel(application.status) : formatApplicationStatusLabel(application.status)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 border-t border-gray-200 pt-5">
          <FormCell
            label="Programme / Internship"
            value={
              internship?.title
                ? `${internship.flag_emoji ? `${internship.flag_emoji} ` : ''}${internship.title}`
                : '—'
            }
          />
          <FormCell
            label="Location"
            value={
              [internship?.city, internship?.country].filter(Boolean).join(', ') ||
              '—'
            }
          />
          <FormCell label="Applicant" value={getStudentName(student)} />
          <FormCell label="Student ID" value={uniqueId} />
          <FormCell
            label="Submitted On"
            value={formatDateTime(application.submitted_at)}
          />
        </div>

        {showAdminLinks && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <Link
              href={`/admin/students/${application.student_id}`}
              className="inline-flex items-center gap-1 font-semibold text-gr-primary hover:underline"
            >
              Open student profile <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href={`/admin/internships/${internship?.id || application.internship_id}`}
              className="inline-flex items-center gap-1 font-semibold text-gr-primary hover:underline"
            >
              Open internship <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </header>

      <div className="px-5 sm:px-8 py-7 space-y-1">
        <FormSection number="1" title="Internship Programme">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
            <FormCell label="Title" value={internship?.title} />
            <FormCell label="Subtitle" value={internship?.subtitle} />
            <FormCell label="Badge / Category" value={internship?.badge} />
            <FormCell label="City" value={internship?.city} />
            <FormCell label="Country" value={internship?.country} />
            <FormCell label="Work Mode" value={internship?.work_mode} />
            <FormCell
              label="Duration"
              value={
                internship?.duration_months
                  ? `${internship.duration_months} months`
                  : '—'
              }
            />
            <FormCell
              label="Start Date"
              value={formatDate(internship?.start_date)}
            />
            <FormCell
              label="Monthly Stipend"
              value={
                internship?.stipend_monthly != null
                  ? `₹${internship.stipend_monthly.toLocaleString()}`
                  : '—'
              }
            />
            <FormCell
              label="Yearly Stipend"
              value={
                internship?.stipend_yearly != null
                  ? `₹${internship.stipend_yearly.toLocaleString()}`
                  : '—'
              }
            />
          </div>
        </FormSection>

        <FormSection number="2" title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
            <FormCell label="First Name" value={student?.first_name} />
            <FormCell label="Middle Name" value={student?.middle_name} />
            <FormCell label="Last Name" value={student?.last_name} />
            <FormCell label="Gender" value={student?.gender} />
            <FormCell
              label="Date of Birth"
              value={formatDate(student?.date_of_birth)}
            />
            <FormCell label="Nationality" value={student?.nationality} />
            <FormCell label="Marital Status" value={student?.marital_status} />
            <FormCell label="Student ID" value={uniqueId} />
            <FormCell
              label="Registered On"
              value={formatDateTime(registeredAt ?? undefined)}
            />
          </div>
          {student?.short_bio && (
            <FormBlock label="Short Bio" value={student.short_bio} />
          )}
        </FormSection>

        <FormSection number="3" title="Contact Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
            <FormCell label="Primary Email" value={student?.email} />
            <FormCell label="Alternate Email" value={student?.alternate_email} />
            <FormCell
              label="Mobile Number"
              value={student?.mobile_number || student?.phone_number}
            />
            <FormCell label="Alternate Phone" value={student?.alternate_phone} />
            <FormCell label="WhatsApp Number" value={student?.whatsapp_number} />
            <FormCell
              label="Emergency Contact"
              value={student?.emergency_contact_number}
            />
          </div>
        </FormSection>

        <FormSection number="4" title="Address Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
            <FormCell label="Country" value={student?.country} />
            <FormCell label="State" value={student?.state} />
            <FormCell label="City" value={student?.city} />
            <FormCell label="District" value={student?.district} />
            <FormCell label="Pincode" value={student?.pincode} />
            <FormCell label="Address Line 1" value={student?.address_line_1} />
            <FormCell label="Address Line 2" value={student?.address_line_2} />
          </div>
          <FormBlock
            label="Current Residential Address"
            value={student?.current_residential_address}
          />
        </FormSection>

        <FormSection number="5" title="Identity & Government IDs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
            <FormCell label="Passport Number" value={student?.passport_number} />
            <FormCell
              label="Passport Issue Date"
              value={formatDate(student?.passport_issue_date)}
            />
            <FormCell
              label="Passport Expiry Date"
              value={formatDate(student?.passport_expiry_date)}
            />
            <FormCell
              label="Passport Country of Issue"
              value={student?.passport_country_of_issue}
            />
            <FormCell label="Aadhar Number" value={student?.aadhar_number} />
            <FormCell label="PAN Number" value={student?.pan_number} />
            <FormCell
              label="Driving License Number"
              value={student?.driving_license_number}
            />
          </div>
        </FormSection>

        <FormSection number="6" title="Identity Documents (Profile)">
          <ol className="border border-gray-200 divide-y divide-gray-100">
            {IDENTITY_DOCUMENTS.map((doc, index) => (
              <DocumentRow
                key={doc.key}
                index={index + 1}
                label={doc.label}
                filePath={student?.[doc.key] as string | undefined}
                fileName={doc.label}
                openingDoc={openingDoc}
                onView={(path) => openSignedFile(path, getStudentDocUrl)}
                getSignedUrl={getStudentDocUrl}
              />
            ))}
          </ol>
        </FormSection>

        <FormSection number="7" title="Academic Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <FormCell label="University Name" value={academicUniversity} />
            <FormCell label="College Name" value={academicCollege} />
            <FormCell label="Degree Name" value={academicDegree} />
            <FormCell label="Branch / Specialization" value={academicBranch} />
            <FormCell label="Current Status" value={academicStatus} />
            <FormCell
              label={
                academicStatus === 'Studying'
                  ? 'Expected Graduation Year'
                  : 'Graduation Year'
              }
              value={academicYear}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Academic status and graduation year are taken from the application
            answers. Institution fields fall back to the student profile when not
            answered separately.
          </p>
        </FormSection>

        <FormSection number="8" title="Language Proficiency">
          {languages.length === 0 ? (
            <p className="text-sm text-gray-500 py-3 italic">
              No language proficiency declared.
            </p>
          ) : (
            <div className="overflow-x-auto border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white text-left">
                    <th className="px-3 py-2.5 font-semibold text-gray-700 border-b border-gray-200">
                      Language
                    </th>
                    <th className="px-3 py-2.5 font-semibold text-gray-700 border-b border-gray-200">
                      Read
                    </th>
                    <th className="px-3 py-2.5 font-semibold text-gray-700 border-b border-gray-200">
                      Write
                    </th>
                    <th className="px-3 py-2.5 font-semibold text-gray-700 border-b border-gray-200">
                      Speak
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {languages.map((lang, index) => (
                    <tr
                      key={`${lang.language}-${index}`}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-3 py-2.5 text-gray-900 font-medium">
                        {blank(lang.language)}
                      </td>
                      <td className="px-3 py-2.5 text-gray-700">
                        {blank(lang.read)}
                      </td>
                      <td className="px-3 py-2.5 text-gray-700">
                        {blank(lang.write)}
                      </td>
                      <td className="px-3 py-2.5 text-gray-700">
                        {blank(lang.speak)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </FormSection>

        <FormSection number="9" title="Health Declaration">
          <div className="space-y-1">
            <FormBlock
              label="Medical Conditions"
              value={
                answerMap.get('health_medical_conditions')?.answer_text || 'None'
              }
            />
            <FormBlock
              label="Allergies"
              value={answerMap.get('health_allergies')?.answer_text || 'None'}
            />
            <FormBlock
              label="Disabilities"
              value={answerMap.get('health_disabilities')?.answer_text || 'None'}
            />
          </div>
        </FormSection>

        <FormSection number="10" title="Application Documents">
          {documentAnswers.length === 0 ? (
            <p className="text-sm text-gray-500 py-3 italic">
              No documents were attached to this application.
            </p>
          ) : (
            <ol className="border border-gray-200 divide-y divide-gray-100">
              {documentAnswers.map((doc, index) => (
                <DocumentRow
                  key={doc.field_key}
                  index={index + 1}
                  label={doc.file_name || `Document ${index + 1}`}
                  subtitle={
                    isPdfFile(doc.file_type, doc.file_name)
                      ? 'PDF'
                      : isImageFile(doc.file_type, doc.file_name)
                        ? 'Image'
                        : doc.file_type || 'File'
                  }
                  filePath={doc.file_url}
                  fileType={doc.file_type}
                  fileName={doc.file_name}
                  openingDoc={openingDoc}
                  onView={(path) => openSignedFile(path, getApplicationDocUrl)}
                  getSignedUrl={getApplicationDocUrl}
                />
              ))}
            </ol>
          )}
        </FormSection>

        {showAdminRemarks && (
          <FormSection number="11" title="Administrative Remarks">
            <FormBlock
              label="Administrative Remarks"
              value={application.admin_remarks}
            />
          </FormSection>
        )}

        {decisionSlot && (
          <FormSection
            number={showAdminRemarks ? "12" : "11"}
            title="Screening & Forwarding"
          >
            {decisionSlot}
          </FormSection>
        )}
      </div>

      <footer className="border-t border-gray-300 bg-white px-5 sm:px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-500">
          <p>
            Started:{' '}
            <span className="text-gray-800">
              {formatDateTime(application.started_at)}
            </span>
          </p>
          <p>
            Reviewed:{' '}
            <span className="text-gray-800">
              {formatDateTime(application.reviewed_at)}
            </span>
          </p>
          <p>
            Decided:{' '}
            <span className="text-gray-800">
              {formatDateTime(application.decided_at)}
            </span>
          </p>
        </div>
      </footer>
    </article>
  )
}
