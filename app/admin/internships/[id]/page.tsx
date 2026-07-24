"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  MapPin,
  CalendarDays,
  Clock,
  CreditCard,
  Briefcase,
} from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getInternshipById, updateInternship, deleteInternship } from '@/lib/internships'
import { extractRequiredDocuments, mergeRequiredDocuments } from '@/lib/internshipContent'
import { getMyAdminProfile } from '@/lib/adminProfiles'
import { getMyProfile } from '@/lib/profiles'

interface InternshipRecord {
  id: string
  badge?: string
  title: string
  subtitle?: string
  city?: string
  country?: string
  short_description?: string
  long_description?: string
  duration_months?: number
  stipend_monthly?: number
  stipend_yearly?: number
  image_url?: string
  secondary_image_url?: string
  start_date?: string
  work_mode?: string
  key_responsibilities?: string | string[]
  skills_learned?: string | { icon: string; name: string }[]
  eligibility_requirements?: string | string[]
  stipend_benefits?: string | string[]
  flag_emoji?: string
}

interface InternshipForm {
  badge: string
  title: string
  subtitle: string
  city: string
  country: string
  short_description: string
  long_description: string
  duration_months: string
  stipend_monthly: string
  stipend_yearly: string
  image_url: string
  secondary_image_url: string
  start_date: string
  work_mode: string
  flag_emoji: string
  key_responsibilities: string
  skills_learned: string
  eligibility_requirements: string
  stipend_benefits: string
  required_documents: string
}

type AdminProfile = {
  first_name?: string
  last_name?: string
}

type Profile = {
  unique_id?: string
}

const CARD_CLASS = 'bg-white border border-[#EEEEEE] rounded-2xl p-6'
const FIELD_CLASS =
  'border-[#EEEEEE] rounded-xl h-10 focus-visible:ring-[#8DC63F] focus-visible:border-[#8DC63F]'
const TEXTAREA_CLASS =
  'border-[#EEEEEE] rounded-xl min-h-[100px] focus-visible:ring-[#8DC63F] focus-visible:border-[#8DC63F]'

const fetcher = (fn: () => Promise<{ data: unknown }>) => fn().then((res) => res.data)

function parseArrayField(data: string | string[] | undefined): string[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  try {
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : [data]
  } catch {
    return data.split('\n').filter((line) => line.trim())
  }
}

function parseSkillsField(
  data: string | { icon: string; name: string }[] | undefined
): string[] {
  if (!data) return []
  if (Array.isArray(data)) return data.map((skill) => skill.name)
  try {
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed)) {
      return parsed.map((skill: { name?: string }) => skill.name || '').filter(Boolean)
    }
  } catch {
    return data.split('\n').filter((line) => line.trim())
  }
  return []
}

function arrayFieldToText(data: string | string[] | undefined): string {
  return parseArrayField(data).join('\n')
}

function skillsFieldToText(data: string | { icon: string; name: string }[] | undefined): string {
  return parseSkillsField(data).join('\n')
}

function textToArrayJson(text: string): string {
  const items = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  return JSON.stringify(items)
}

function textToSkillsJson(text: string): string {
  const items = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => ({ icon: 'Leaf', name }))
  return JSON.stringify(items)
}

function recordToForm(record: InternshipRecord): InternshipForm {
  const { description, requiredDocuments } = extractRequiredDocuments(record.long_description)

  return {
    badge: record.badge || '',
    title: record.title || '',
    subtitle: record.subtitle || '',
    city: record.city || '',
    country: record.country || '',
    short_description: record.short_description || '',
    long_description: description,
    duration_months: record.duration_months?.toString() || '',
    stipend_monthly: record.stipend_monthly?.toString() || '',
    stipend_yearly: record.stipend_yearly?.toString() || '',
    image_url: record.image_url || '',
    secondary_image_url: record.secondary_image_url || '',
    start_date: record.start_date ? record.start_date.split('T')[0] : '',
    work_mode: record.work_mode || '',
    flag_emoji: record.flag_emoji || '',
    key_responsibilities: arrayFieldToText(record.key_responsibilities),
    skills_learned: skillsFieldToText(record.skills_learned),
    eligibility_requirements: arrayFieldToText(record.eligibility_requirements),
    stipend_benefits: arrayFieldToText(record.stipend_benefits),
    required_documents: requiredDocuments,
  }
}

function formToPayload(form: InternshipForm) {
  return {
    badge: form.badge.trim() || undefined,
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || undefined,
    city: form.city.trim() || undefined,
    country: form.country.trim() || undefined,
    short_description: form.short_description.trim() || undefined,
    long_description: mergeRequiredDocuments(
      form.long_description.trim(),
      form.required_documents
    ) || undefined,
    duration_months: form.duration_months ? Number(form.duration_months) : undefined,
    stipend_monthly: form.stipend_monthly ? Number(form.stipend_monthly) : undefined,
    stipend_yearly: form.stipend_yearly ? Number(form.stipend_yearly) : undefined,
    image_url: form.image_url.trim() || undefined,
    secondary_image_url: form.secondary_image_url.trim() || undefined,
    start_date: form.start_date || undefined,
    work_mode: form.work_mode.trim() || undefined,
    flag_emoji: form.flag_emoji.trim() || undefined,
    key_responsibilities: form.key_responsibilities.trim()
      ? textToArrayJson(form.key_responsibilities)
      : undefined,
    skills_learned: form.skills_learned.trim()
      ? textToSkillsJson(form.skills_learned)
      : undefined,
    eligibility_requirements: form.eligibility_requirements.trim()
      ? textToArrayJson(form.eligibility_requirements)
      : undefined,
    stipend_benefits: form.stipend_benefits.trim()
      ? textToArrayJson(form.stipend_benefits)
      : undefined,
  }
}

const PAGE_CLASS = 'w-full max-w-5xl mx-auto'

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className={CARD_CLASS}>
      <div className="mb-5 text-center">
        <h2 className="font-bold text-lg text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function ImageUrlField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [previewError, setPreviewError] = useState(false)
  const trimmedValue = value.trim()

  useEffect(() => {
    setPreviewError(false)
  }, [trimmedValue])

  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${FIELD_CLASS} flex-1 min-w-0`}
        />
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#EEEEEE] flex-shrink-0 bg-gray-100">
          {trimmedValue && !previewError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trimmedValue}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 px-1 text-center">
              {trimmedValue && previewError ? 'Invalid' : 'Preview'}
            </div>
          )}
        </div>
      </div>
    </Field>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-gray-700">{label}</Label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className={`${PAGE_CLASS} p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse`}>
      <div className="h-56 bg-gray-200 rounded-2xl" />
      <div className={`${CARD_CLASS} space-y-4`}>
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded-xl" />
        <div className="h-10 bg-gray-200 rounded-xl" />
        <div className="h-24 bg-gray-200 rounded-xl" />
      </div>
      <div className={`${CARD_CLASS} h-48`} />
    </div>
  )
}

export default function AdminInternshipDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [form, setForm] = useState<InternshipForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const { data: adminProfile } = useSWR('adminProfileDetail', () => fetcher(getMyAdminProfile), {
    revalidateOnFocus: false,
  })

  const { data: myProfile } = useSWR('adminMyProfileDetail', () => fetcher(getMyProfile), {
    revalidateOnFocus: false,
  })

  useEffect(() => {
    async function loadInternship() {
      setLoading(true)
      const result = await getInternshipById(id)

      if (result.error || !result.data) {
        setNotFound(true)
        setForm(null)
      } else {
        setForm(recordToForm(result.data as InternshipRecord))
        setNotFound(false)
      }

      setLoading(false)
    }

    loadInternship()
  }, [id])

  const profile = adminProfile as AdminProfile | null
  const profileMeta = myProfile as Profile | null

  const adminName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Admin'

  const getAvatarInitials = () => {
    const first = profile?.first_name?.trim()
    const last = profile?.last_name?.trim()
    if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    if (first) return first.charAt(0).toUpperCase()
    return 'A'
  }

  const updateField = (field: keyof InternshipForm, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSave = async () => {
    if (!form) return

    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }

    setSaving(true)
    const result = await updateInternship(id, formToPayload(form))

    if (result.error) {
      toast.error(result.error.message || 'Failed to save internship')
      setSaving(false)
      return
    }

    toast.success('Internship updated successfully')
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteInternship(id)

    if (result.error) {
      toast.error(result.error.message || 'Failed to delete internship')
      setDeleting(false)
      setShowDeleteDialog(false)
      return
    }

    toast.success('Internship deleted')
    router.push('/admin/internships')
  }

  const formatPreviewDate = (dateString?: string) => {
    if (!dateString) return 'TBA'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <div className="bg-white border-b border-[#EEEEEE] px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
        <div className="relative flex items-center justify-center">
          <Link
            href="/admin/internships"
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
                ID: {profileMeta?.unique_id || 'N/A'}
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
          ) : notFound || !form ? (
            <div className="flex flex-col items-center justify-center py-24 px-4">
              <p className="text-gray-500 mb-4">Internship not found.</p>
              <Link
                href="/admin/internships"
                className="text-sm font-semibold text-[#8DC63F] hover:underline"
              >
                Back to Internships
              </Link>
            </div>
          ) : (
            <div className={`${PAGE_CLASS} p-4 sm:p-6 lg:p-8 space-y-6`}>
              <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-[#EEEEEE]">
                <Image
                  src={form.image_url || `https://picsum.photos/seed/${id}/1200/600`}
                  alt={form.title || 'Internship cover'}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  {form.badge && (
                    <span className="inline-block bg-[#8DC63F] text-white text-xs font-bold px-3 py-1 rounded-full uppercase mb-2">
                      {form.badge}
                    </span>
                  )}
                  <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-2">
                    {form.title || 'Untitled Internship'}
                  </h2>
                  {(form.city || form.country) && (
                    <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
                      {form.flag_emoji && <span>{form.flag_emoji}</span>}
                      <MapPin className="w-3.5 h-3.5" />
                      {[form.city, form.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    icon: CalendarDays,
                    label: 'Start Date',
                    value: formatPreviewDate(form.start_date),
                  },
                  {
                    icon: Clock,
                    label: 'Duration',
                    value: form.duration_months ? `${form.duration_months} Months` : 'N/A',
                  },
                  {
                    icon: CreditCard,
                    label: 'Stipend',
                    value: form.stipend_monthly
                      ? `$${Number(form.stipend_monthly).toLocaleString()}/mo`
                      : 'N/A',
                  },
                  {
                    icon: Briefcase,
                    label: 'Work Mode',
                    value: form.work_mode || 'N/A',
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
                      <p className="text-sm font-semibold text-gray-900 truncate capitalize">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <FormSection title="Basic Information" description="Title and summary shown on listing cards.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Title *">
                    <Input
                      value={form.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="e.g. Soil Research Internship"
                      className={FIELD_CLASS}
                    />
                  </Field>
                  <Field label="Badge">
                    <Input
                      value={form.badge}
                      onChange={(e) => updateField('badge', e.target.value)}
                      placeholder="e.g. Research, Field Work"
                      className={FIELD_CLASS}
                    />
                  </Field>
                </div>
                <Field label="Subtitle">
                  <Input
                    value={form.subtitle}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    placeholder="Short tagline for the internship"
                    className={FIELD_CLASS}
                  />
                </Field>
                <Field label="Short Description" hint="Shown on internship cards in the listing.">
                  <Textarea
                    value={form.short_description}
                    onChange={(e) => updateField('short_description', e.target.value)}
                    placeholder="Brief overview for the card view..."
                    className={TEXTAREA_CLASS}
                    rows={3}
                  />
                </Field>
              </FormSection>

              <FormSection title="Location & Schedule">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="City">
                    <Input
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="e.g. Amsterdam"
                      className={FIELD_CLASS}
                    />
                  </Field>
                  <Field label="Country">
                    <Input
                      value={form.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      placeholder="e.g. Netherlands"
                      className={FIELD_CLASS}
                    />
                  </Field>
                  <Field label="Flag Emoji">
                    <Input
                      value={form.flag_emoji}
                      onChange={(e) => updateField('flag_emoji', e.target.value)}
                      placeholder="e.g. 🇳🇱"
                      className={FIELD_CLASS}
                    />
                  </Field>
                  <Field label="Work Mode">
                    <select
                      value={form.work_mode}
                      onChange={(e) => updateField('work_mode', e.target.value)}
                      className="w-full h-10 border border-[#EEEEEE] rounded-xl px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                    >
                      <option value="">Select work mode</option>
                      <option value="onsite">Onsite</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </Field>
                  <Field label="Start Date">
                    <Input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => updateField('start_date', e.target.value)}
                      className={FIELD_CLASS}
                    />
                  </Field>
                  <Field label="Duration (months)">
                    <Input
                      type="number"
                      min="1"
                      value={form.duration_months}
                      onChange={(e) => updateField('duration_months', e.target.value)}
                      placeholder="e.g. 6"
                      className={FIELD_CLASS}
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection title="Compensation">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Monthly Stipend ($)">
                    <Input
                      type="number"
                      min="0"
                      value={form.stipend_monthly}
                      onChange={(e) => updateField('stipend_monthly', e.target.value)}
                      placeholder="e.g. 1500"
                      className={FIELD_CLASS}
                    />
                  </Field>
                  <Field label="Yearly Stipend ($)">
                    <Input
                      type="number"
                      min="0"
                      value={form.stipend_yearly}
                      onChange={(e) => updateField('stipend_yearly', e.target.value)}
                      placeholder="Optional"
                      className={FIELD_CLASS}
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection title="Media" description="Image URLs for the cover and skills section.">
                <ImageUrlField
                  label="Cover Image URL"
                  value={form.image_url}
                  onChange={(value) => updateField('image_url', value)}
                  placeholder="https://..."
                />
                <ImageUrlField
                  label="Secondary Image URL"
                  value={form.secondary_image_url}
                  onChange={(value) => updateField('secondary_image_url', value)}
                  placeholder="https://..."
                />
              </FormSection>

              <FormSection title="Full Description">
                <Field label="About this Internship">
                  <Textarea
                    value={form.long_description}
                    onChange={(e) => updateField('long_description', e.target.value)}
                    placeholder="Detailed description of the internship..."
                    className={`${TEXTAREA_CLASS} min-h-[160px]`}
                    rows={8}
                  />
                </Field>
              </FormSection>

              <FormSection
                title="Key Responsibilities"
                description="One responsibility per line. Shown as cards on the detail page."
              >
                <Textarea
                  value={form.key_responsibilities}
                  onChange={(e) => updateField('key_responsibilities', e.target.value)}
                  placeholder={'Conduct soil sample analysis\nMaintain field equipment\nPrepare research reports'}
                  className={`${TEXTAREA_CLASS} min-h-[140px]`}
                  rows={6}
                />
              </FormSection>

              <FormSection
                title="Skills Students Will Learn"
                description="One skill per line. Each skill appears on the detail page."
              >
                <Textarea
                  value={form.skills_learned}
                  onChange={(e) => updateField('skills_learned', e.target.value)}
                  placeholder={'Soil Analysis\nCrop Management\nData Collection'}
                  className={`${TEXTAREA_CLASS} min-h-[120px]`}
                  rows={5}
                />
              </FormSection>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSection title="Eligibility Requirements" description="One requirement per line.">
                  <Textarea
                    value={form.eligibility_requirements}
                    onChange={(e) => updateField('eligibility_requirements', e.target.value)}
                    placeholder={'Currently enrolled in agriculture program\nMinimum 3.0 GPA\nValid passport'}
                    className={`${TEXTAREA_CLASS} min-h-[140px]`}
                    rows={6}
                  />
                </FormSection>

                <FormSection title="Stipend Benefits" description="Additional benefits, one per line.">
                  <Textarea
                    value={form.stipend_benefits}
                    onChange={(e) => updateField('stipend_benefits', e.target.value)}
                    placeholder={'Housing allowance\nTravel reimbursement\nHealth insurance'}
                    className={`${TEXTAREA_CLASS} min-h-[140px]`}
                    rows={6}
                  />
                </FormSection>
              </div>

              <FormSection
                title="Required Documents"
                description="Plain text list shown to students on application Step 4. They read this and upload files using the standard upload box. Not shown on the public internship page."
              >
                <Textarea
                  value={form.required_documents}
                  onChange={(e) => updateField('required_documents', e.target.value)}
                  placeholder={'Passport copy\nAcademic transcripts\nResume / CV\nLetter of recommendation'}
                  className={`${TEXTAREA_CLASS} min-h-[140px]`}
                  rows={6}
                />
              </FormSection>

              <div className="flex flex-col sm:flex-row gap-3 pb-4 justify-center">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || deleting}
                  className="inline-flex items-center justify-center gap-2 bg-[#8DC63F] text-white rounded-xl px-6 py-3 font-semibold hover:bg-[#7DB62F] transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={saving || deleting}
                  className="inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 rounded-xl px-6 py-3 font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Internship
                </button>
              </div>
            </div>
          )}
        </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        icon={<Trash2 className="w-14 h-14" />}
        title="Delete Internship?"
        description="This will permanently remove the internship and it will no longer be visible to students. This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={deleting}
        loadingText="Deleting..."
      />
    </div>
  )
}
