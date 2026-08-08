"use client"

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  User,
  GraduationCap,
  Languages,
  Heart,
  FileText,
  Info,
  Plus,
  X,
  CloudUpload,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import UserAvatar from '@/components/UserAvatar'
import { ApplicationSubmittedDialog } from '@/components/ApplicationSubmittedDialog'
import {
  ApplicationPaperForm,
  type ApplicationPaperData,
  type ApplicationPaperInternship,
  type ApplicationPaperStudentProfile,
} from '@/components/ApplicationPaperForm'
import { PAGE_CLASS } from '@/components/detailLayout'
import { invalidateApplications } from '@/lib/cache'
import { extractRequiredDocuments } from '@/lib/internshipContent'
import { 
  getMyApplicationById,
  getMyApplicationFile,
  saveTextAnswer,
  uploadFileAnswer,
  updateCurrentStep,
  submitApplication
} from '@/lib/studentApplications'
import { getMyStudentProfile, getMyStudentDocumentUrl } from '@/lib/studentProfiles'
import { getMyProfile } from '@/lib/profiles'
import { formatApplicationStatusLabel, formatApplicationReferenceId } from '@/lib/utils'

type ApplicationData = ApplicationPaperData & {
  internships?: ApplicationPaperInternship & {
    image_url?: string
    long_description?: string
  }
}

type StudentProfile = ApplicationPaperStudentProfile & {
  profile_image_url?: string
  avatar_url?: string
}

type Language = {
  language: string
  read: string
  write: string
  speak: string
}

type UploadedFile = {
  file: File
  fieldKey: string
  preview: string
}

const STEP_NAMES = [
  'Personal Info',
  'Academic Details',
  'Language & Health',
  'Documents',
  'Review & Submit'
]

const MAX_DOCUMENT_UPLOADS = 10
const MAX_LANGUAGES = 8

const isLanguageComplete = (lang: Language) =>
  Boolean(lang.language && lang.read && lang.write && lang.speak)

const isPdfFile = (fileType: string) => fileType.toLowerCase().includes('pdf')

function getStudentStatusBadgeClass(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-600'
    case 'submitted':
      return 'bg-blue-100 text-blue-600'
    case 'under_review':
      return 'bg-amber-100 text-amber-700'
    case 'approved':
      return 'bg-green-100 text-green-700'
    case 'rejected':
      return 'bg-red-100 text-red-700'
    case 'accepted':
      return 'bg-purple-100 text-purple-700'
    case 'closed':
      return 'bg-gray-100 text-gray-500'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const getCountryFlag = (country: string) => {
  const countryToCode: { [key: string]: string } = {
    'USA': 'US',
    'United States': 'US',
    'UK': 'GB',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'India': 'IN',
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'Netherlands': 'NL',
    'Japan': 'JP',
  }
  
  const code = countryToCode[country] || countryToCode[country?.split(',')[0]?.trim()]
  if (!code) return '🌍'
  
  return String.fromCodePoint(...[...code].map(c => c.charCodeAt(0) + 127397))
}

export default function ApplicationForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [application, setApplication] = useState<ApplicationData | null>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [myProfile, setMyProfile] = useState<any>(null)
  
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [languages, setLanguages] = useState<Language[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [existingFiles, setExistingFiles] = useState<Array<{
    fieldKey: string
    fileName: string
    fileType: string
    fileUrl: string
  }>>([])
  
  const [declarations, setDeclarations] = useState({
    confirm: false,
    terms: false
  })
  
  const [isDragging, setIsDragging] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [submittedAt, setSubmittedAt] = useState<string | null>(null)

  const isReadOnly = application?.status !== 'draft'
  const requiredDocumentsText = extractRequiredDocuments(
    application?.internships?.long_description
  ).requiredDocuments

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      const [appResult, profileResult, myProfileResult] = await Promise.all([
        getMyApplicationById(id),
        getMyStudentProfile(),
        getMyProfile()
      ])
      
      if (!appResult.data) {
        toast.error('Application not found')
        router.push('/student/applications')
        return
      }
      
      setApplication(appResult.data)
      setProfile(profileResult.data)
      setMyProfile(myProfileResult.data)
      setCurrentStep(appResult.data.current_step || 1)
      
      if (appResult.data.application_answers) {
        const answers: Record<string, string> = {}
        const languagesData: Language[] = []
        const files: Array<any> = []
        
        appResult.data.application_answers.forEach((answer: any) => {
          if (answer.field_key === 'languages' && answer.answer_text) {
            try {
              const parsed = JSON.parse(answer.answer_text)
              languagesData.push(...parsed)
            } catch (e) {
              console.error('Error parsing languages', e)
            }
          } else if (answer.field_key?.startsWith('doc_upload_') && answer.file_url) {
            const storedType = answer.file_type || ''
            const inferredType = storedType.toLowerCase().includes('pdf') || answer.file_name?.toLowerCase().endsWith('.pdf')
              ? 'pdf'
              : 'image'
            files.push({
              fieldKey: answer.field_key,
              fileName: answer.file_name || 'Document',
              fileType: inferredType,
              fileUrl: answer.file_url
            })
          } else if (answer.answer_text) {
            answers[answer.field_key] = answer.answer_text
          }
        })
        
        setFormData(answers)
        setLanguages(languagesData.length > 0 ? languagesData : [{ language: '', read: '', write: '', speak: '' }])
        setExistingFiles(files)
      } else {
        setLanguages([{ language: '', read: '', write: '', speak: '' }])
      }
    } catch (error) {
      console.error('Error loading application:', error)
      toast.error('Failed to load application')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async () => {
    if (!application) return

    if (isReadOnly) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1)
      }
      return
    }
    
    if (currentStep === 2) {
      if (!validateStep2()) return
      await saveStep2()
    } else if (currentStep === 3) {
      if (!validateStep3()) return
      await saveStep3()
    } else if (currentStep === 4) {
      if (!validateStep4()) return
      await saveStep4()
      setCurrentStep(5)
      await updateCurrentStep(application.id, 5)
      return
    }
    
    if (currentStep < 5) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      await updateCurrentStep(application.id, nextStep)
    }
  }

  const handlePrevious = async () => {
    if (!application) return
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      if (!isReadOnly) {
        await updateCurrentStep(application.id, prevStep)
      }
    }
  }

  const validateStep2 = () => {
    if (!formData.academic_current_status) {
      toast.error('Please select your current status')
      return false
    }
    if (!formData.academic_graduation_year) {
      toast.error('Please enter your graduation year')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    const validLanguages = languages.filter(lang => 
      lang.language && lang.read && lang.write && lang.speak
    )
    if (validLanguages.length === 0) {
      toast.error('Please add at least one language with all proficiency levels')
      return false
    }
    if (validLanguages.length > MAX_LANGUAGES) {
      toast.error(`Maximum ${MAX_LANGUAGES} languages allowed`)
      return false
    }
    return true
  }

  const validateStep4 = () => {
    const totalFiles = uploadedFiles.length + existingFiles.length
    if (totalFiles === 0) {
      toast.error('Please upload at least one document')
      return false
    }
    return true
  }

  const saveStep2 = async () => {
    if (!application || !profile) return
    
    try {
      setIsSaving(true)
      
      const fieldsToSave = [
        { key: 'academic_university', value: profile.university_name || '' },
        { key: 'academic_college', value: profile.college_name || '' },
        { key: 'academic_degree', value: profile.degree_name || '' },
        { key: 'academic_branch', value: profile.branch_specialization || '' },
        { key: 'academic_current_status', value: formData.academic_current_status || '' },
        { key: 'academic_graduation_year', value: formData.academic_graduation_year || '' },
      ]
      
      await Promise.all(
        fieldsToSave.map(field => 
          saveTextAnswer(application.id, 2, field.key, field.value)
        )
      )
      
      toast.success('Academic details saved')
    } catch (error) {
      console.error('Error saving step 2:', error)
      toast.error('Failed to save academic details')
    } finally {
      setIsSaving(false)
    }
  }

  const saveStep3 = async () => {
    if (!application) return
    
    try {
      setIsSaving(true)
      
      const validLanguages = languages.filter(lang => 
        lang.language && lang.read && lang.write && lang.speak
      )
      
      const languagesJson = JSON.stringify(validLanguages)
      
      await Promise.all([
        saveTextAnswer(application.id, 3, 'languages', languagesJson),
        saveTextAnswer(application.id, 3, 'health_medical_conditions', formData.health_medical_conditions || ''),
        saveTextAnswer(application.id, 3, 'health_allergies', formData.health_allergies || ''),
        saveTextAnswer(application.id, 3, 'health_disabilities', formData.health_disabilities || ''),
      ])
      
      toast.success('Language and health information saved')
    } catch (error) {
      console.error('Error saving step 3:', error)
      toast.error('Failed to save information')
    } finally {
      setIsSaving(false)
    }
  }

  const saveStep4 = async () => {
    if (!application) return
    
    try {
      setIsSaving(true)
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadedFile = uploadedFiles[i]
        await uploadFileAnswer(
          application.id,
          4,
          `doc_upload_${existingFiles.length + i}`,
          uploadedFile.file
        )
      }
      
      toast.success('Documents uploaded successfully')
      setUploadedFiles([])
      await loadData()
    } catch (error) {
      console.error('Error uploading documents:', error)
      toast.error('Failed to upload documents')
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    if (currentStep === 2) {
      await saveStep2()
    } else if (currentStep === 3) {
      await saveStep3()
    } else if (currentStep === 4) {
      await saveStep4()
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    
    const totalFiles = uploadedFiles.length + existingFiles.length
    const remainingSlots = MAX_DOCUMENT_UPLOADS - totalFiles
    
    if (remainingSlots === 0) {
      toast.error(`Maximum ${MAX_DOCUMENT_UPLOADS} files allowed`)
      return
    }
    
    const newFiles: UploadedFile[] = []
    
    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i]
      
      if (file.size > 1024 * 1024) {
        toast.error(`${file.name} is over 1MB`)
        continue
      }
      
      const fileType = file.type.toLowerCase()
      const isPdf =
        fileType.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')

      if (!isPdf) {
        toast.error(`${file.name} is not a PDF file`)
        continue
      }
      
      newFiles.push({
        file,
        fieldKey: `doc_upload_${totalFiles + newFiles.length}`,
        preview: URL.createObjectURL(file)
      })
    }
    
    if (newFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...newFiles])
      toast.success(`${newFiles.length} file(s) added`)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles]
    URL.revokeObjectURL(newFiles[index].preview)
    newFiles.splice(index, 1)
    setUploadedFiles(newFiles)
    toast.success('File removed')
  }

  const handleSubmit = async () => {
    if (!declarations.confirm || !declarations.terms) {
      toast.error('Please accept both declarations')
      return
    }
    
    if (!application) return
    
    try {
      setIsSubmitting(true)
      
      const result = await submitApplication(application.id)
      
      if (!result.error) {
        const submissionTime =
          result.data &&
          typeof result.data === 'object' &&
          'submitted_at' in result.data &&
          typeof result.data.submitted_at === 'string'
            ? result.data.submitted_at
            : new Date().toISOString()

        setApplication((prev) =>
          prev
            ? {
                ...prev,
                status: 'submitted',
                submitted_at: submissionTime,
                current_step: 5,
              }
            : prev
        )
        setSubmittedAt(submissionTime)
        setShowSuccessDialog(true)
        invalidateApplications()
      } else {
        toast.error(result.error?.message || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addLanguage = () => {
    if (!languages.some(isLanguageComplete)) {
      toast.error('Please complete at least one language before adding another')
      return
    }
    if (languages.length >= MAX_LANGUAGES) {
      toast.error(`Maximum ${MAX_LANGUAGES} languages allowed`)
      return
    }
    setLanguages([...languages, { language: '', read: '', write: '', speak: '' }])
  }

  const removeLanguage = (index: number) => {
    const newLanguages = [...languages]
    newLanguages.splice(index, 1)
    setLanguages(newLanguages)
  }

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    const newLanguages = [...languages]
    newLanguages[index][field] = value
    setLanguages(newLanguages)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#F9F9F9] items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8DC63F] animate-spin" />
      </div>
    )
  }

  if (!application || !profile) {
    return (
      <div className="flex h-screen bg-[#F9F9F9] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Application not found</p>
          <Link
            href="/student/applications"
            className="text-[#8DC63F] hover:underline"
          >
            Back to Applications
          </Link>
        </div>
      </div>
    )
  }

  const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Student'

  const paperStudent: ApplicationPaperStudentProfile = {
    ...profile,
    profile_photo_url:
      profile.profile_photo_url ||
      profile.profile_image_url ||
      profile.avatar_url,
  }

  const studentHeader = (
    <div className="bg-white border-b border-[#EEEEEE] px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
      <div className="relative flex items-center justify-center">
        <Link
          href="/student/applications"
          className="absolute left-0 flex items-center gap-2 text-gray-600 hover:text-[#8DC63F] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </Link>

        <Link href="/student/dashboard" className="flex items-center gap-2">
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
              {userName}
            </p>
            <p className="text-xs text-[#3B82F6] font-medium">
              ID: {myProfile?.unique_id || 'N/A'}
            </p>
          </div>
          <Link
            href="/student/profile"
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <UserAvatar
              imageUrl={
                profile.profile_photo_url ||
                profile.profile_image_url ||
                profile.avatar_url
              }
              firstName={profile.first_name}
              lastName={profile.last_name}
              fallbackLetter="S"
              size={40}
            />
          </Link>
        </div>
      </div>
    </div>
  )

  // Submitted (and later statuses): paper form matching admin, without Decision Desk
  if (application.status !== 'draft') {
    return (
      <div className="min-h-screen bg-[#EFEDE8] flex flex-col">
        {studentHeader}
        <div className="flex-1 overflow-y-auto">
          <div className={`${PAGE_CLASS} p-4 sm:p-6 lg:p-8 space-y-5`}>
            {application.status === 'rejected' && application.internship_id && (
              <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-red-800">
                  This application was rejected and is closed. You can start a
                  fresh application for the same internship.
                </p>
                <Link
                  href={`/student/internships/${application.internship_id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-[#8DC63F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7DB62F] transition-colors flex-shrink-0"
                >
                  Apply Again
                </Link>
              </div>
            )}
            <ApplicationPaperForm
              application={application}
              student={paperStudent}
              internship={application.internships}
              uniqueId={myProfile?.unique_id}
              registeredAt={myProfile?.created_at}
              mode="student"
              getStudentDocUrl={getMyStudentDocumentUrl}
              getApplicationDocUrl={getMyApplicationFile}
            />
            <div className="flex justify-center pt-2 pb-10">
              <Link
                href="/student/applications"
                className="inline-flex items-center justify-center rounded-xl bg-[#8DC63F] px-8 py-3 text-sm font-semibold text-white hover:bg-[#7DB62F] transition-colors"
              >
                Go back to Applications
              </Link>
            </div>
          </div>
        </div>

        {submittedAt && (
          <ApplicationSubmittedDialog
            open={showSuccessDialog}
            onOpenChange={setShowSuccessDialog}
            applicationId={application.id}
            submittedAt={submittedAt}
          />
        )}
      </div>
    )
  }

  const handleStepClick = (stepNumber: number) => {
    if (isReadOnly) {
      setCurrentStep(stepNumber)
    }
  }

  return (
    <div className="flex h-screen bg-[#F9F9F9]">
      <div className="flex-1 flex flex-col overflow-hidden">
        {studentHeader}

        <div className="flex-1 overflow-y-auto pb-24">
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

            <div className="bg-white border border-[#EEEEEE] rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-4">
                {application.internships?.image_url && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={application.internships.image_url}
                      alt={application.internships.title || 'Internship'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F0F9E8] text-[#5A9A2E]">
                      {formatApplicationReferenceId(application.id, application.submitted_at)}
                    </span>
                  </div>
                  <h2 className="font-bold text-lg text-gray-900">{application.internships?.title}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span>{getCountryFlag(application.internships?.country || '')}</span>
                      <span>{application.internships?.country}</span>
                    </span>
                    <span>•</span>
                    <span>{application.internships?.duration_months} Months</span>
                    <span>•</span>
                    <span>₹{application.internships?.stipend_monthly?.toLocaleString()} / Month</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getStudentStatusBadgeClass(application.status)}`}>
                    {formatApplicationStatusLabel(application.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#EEEEEE] rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-5 mb-8">
                {STEP_NAMES.map((name, index) => {
                  const stepNumber = index + 1
                  const isActive = stepNumber === currentStep
                  const isReached = stepNumber <= currentStep

                  return (
                    <div key={stepNumber} className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center w-full h-10">
                        {index > 0 && (
                          <div
                            className={`absolute right-1/2 left-0 top-1/2 -translate-y-1/2 h-[3px] transition-colors ${
                              currentStep > index ? 'bg-[#8DC63F]' : 'bg-gray-200'
                            }`}
                          />
                        )}
                        {index < STEP_NAMES.length - 1 && (
                          <div
                            className={`absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-[3px] transition-colors ${
                              currentStep > stepNumber ? 'bg-[#8DC63F]' : 'bg-gray-200'
                            }`}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleStepClick(stepNumber)}
                          disabled={!isReadOnly}
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                            isReached
                              ? 'bg-[#8DC63F] text-white'
                              : 'bg-gray-200 text-gray-400'
                          } ${isReadOnly ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
                        >
                          {stepNumber}
                        </button>
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs mt-2 font-medium text-center leading-tight max-w-[72px] sm:max-w-none ${
                          isActive ? 'text-[#8DC63F]' : 'text-gray-500'
                        }`}
                      >
                        {name}
                      </span>
                    </div>
                  )
                })}
              </div>

              {currentStep === 1 && (
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-sm text-gray-500 mb-4">Auto-filled from your profile. To edit go to Profile page.</p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">These details are read-only. Update them in your Profile.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={profile.first_name || ''}
                          disabled
                          className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm cursor-not-allowed opacity-75"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                        <input
                          type="text"
                          value={profile.middle_name || ''}
                          disabled
                          className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm cursor-not-allowed opacity-75"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={profile.last_name || ''}
                          disabled
                          className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm cursor-not-allowed opacity-75"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <input
                          type="text"
                          value={profile.gender || ''}
                          disabled
                          className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm cursor-not-allowed opacity-75"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="text"
                          value={profile.date_of_birth || ''}
                          disabled
                          className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm cursor-not-allowed opacity-75"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                        <input
                          type="text"
                          value={profile.nationality || ''}
                          disabled
                          className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm cursor-not-allowed opacity-75"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                        <input
                          type="text"
                          value={profile.marital_status || ''}
                          disabled
                          className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm cursor-not-allowed opacity-75"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-6">Academic Details</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">University Name</label>
                        <input
                          type="text"
                          value={profile.university_name || ''}
                          disabled
                          className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm cursor-not-allowed opacity-75"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">College Name</label>
                        <input
                          type="text"
                          value={profile.college_name || ''}
                          disabled
                          className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm cursor-not-allowed opacity-75"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Degree Name</label>
                        <input
                          type="text"
                          value={profile.degree_name || ''}
                          disabled
                          className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm cursor-not-allowed opacity-75"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Branch / Specialization</label>
                        <input
                          type="text"
                          value={profile.branch_specialization || ''}
                          disabled
                          className="w-full bg-gray-50 rounded-lg py-3 px-4 text-sm cursor-not-allowed opacity-75"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.academic_current_status || ''}
                          onChange={(e) => setFormData({ ...formData, academic_current_status: e.target.value })}
                          disabled={isReadOnly}
                          className={`w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                        >
                          <option value="">Select status</option>
                          <option value="Studying">Studying</option>
                          <option value="Graduated">Graduated</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {formData.academic_current_status === 'Studying' ? 'Expected Graduation Year' : 'Graduation Year'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2025"
                          value={formData.academic_graduation_year || ''}
                          onChange={(e) => setFormData({ ...formData, academic_graduation_year: e.target.value })}
                          disabled={isReadOnly}
                          className={`w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-6">Language & Health Information</h3>

                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Language Proficiency</h4>
                      {!isReadOnly && (
                      <button
                        onClick={addLanguage}
                        disabled={languages.length >= MAX_LANGUAGES}
                        className="border border-[#8DC63F] text-[#8DC63F] rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                        Add Language
                      </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {languages.map((lang, index) => (
                        <div key={index} className="relative border border-[#EEEEEE] rounded-xl p-4">
                          {languages.length > 1 && !isReadOnly && (
                            <button
                              onClick={() => removeLanguage(index)}
                              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}

                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <select
                                value={lang.language}
                                onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                                disabled={isReadOnly}
                                className={`w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                              >
                                <option value="">Select language</option>
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="German">German</option>
                                <option value="French">French</option>
                                <option value="Spanish">Spanish</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Mandarin">Mandarin</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <select
                                value={lang.read}
                                onChange={(e) => updateLanguage(index, 'read', e.target.value)}
                                disabled={isReadOnly}
                                className={`w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                              >
                                <option value="">Read level</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Native">Native</option>
                              </select>

                              <select
                                value={lang.write}
                                onChange={(e) => updateLanguage(index, 'write', e.target.value)}
                                disabled={isReadOnly}
                                className={`w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                              >
                                <option value="">Write level</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Native">Native</option>
                              </select>

                              <select
                                value={lang.speak}
                                onChange={(e) => updateLanguage(index, 'speak', e.target.value)}
                                disabled={isReadOnly}
                                className={`w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                              >
                                <option value="">Speak level</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Native">Native</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Health Information</h4>
                    <p className="text-xs text-gray-400 mb-4">This information is kept confidential.</p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                        <textarea
                          rows={3}
                          placeholder="List any known medical conditions, or type 'None'"
                          value={formData.health_medical_conditions || ''}
                          onChange={(e) => setFormData({ ...formData, health_medical_conditions: e.target.value })}
                          disabled={isReadOnly}
                          className={`w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                        <textarea
                          rows={2}
                          placeholder="List any allergies, or type 'None'"
                          value={formData.health_allergies || ''}
                          onChange={(e) => setFormData({ ...formData, health_allergies: e.target.value })}
                          disabled={isReadOnly}
                          className={`w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Disabilities</label>
                        <textarea
                          rows={2}
                          placeholder="List any disabilities, or type 'None'"
                          value={formData.health_disabilities || ''}
                          onChange={(e) => setFormData({ ...formData, health_disabilities: e.target.value })}
                          disabled={isReadOnly}
                          className={`w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Supporting Documents</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {requiredDocumentsText
                      ? 'Read the required documents list below, then upload your files.'
                      : `Upload your documents below. Maximum ${MAX_DOCUMENT_UPLOADS} files, 1MB each.`}
                  </p>

                  {requiredDocumentsText && (
                    <div className="bg-[#F0F7E6] border border-[#8DC63F]/30 rounded-xl p-5 mb-6">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-[#8DC63F] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Documents Required for This Internship
                          </h4>
                          <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                            {requiredDocumentsText}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isReadOnly && (
                  <>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                      <li>Maximum {MAX_DOCUMENT_UPLOADS} files total</li>
                      <li>Each file must be under 1MB</li>
                      <li>Accepted format: PDF only</li>
                    </ul>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`bg-gray-50 rounded-2xl p-6 border-2 border-dashed transition-colors cursor-pointer ${
                      isDragging ? 'border-[#8DC63F] bg-green-50' : 'border-gray-300'
                    }`}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      accept=".pdf,application/pdf"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    <div className="text-center">
                      <CloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="font-medium text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">PDF only • Max 1MB per file • Max {MAX_DOCUMENT_UPLOADS} files</p>
                    </div>
                  </div>
                  </>
                  )}

                  {isReadOnly && existingFiles.length === 0 && (
                    <p className="text-sm text-gray-500">No documents uploaded</p>
                  )}

                  <p className={`text-sm text-center mt-3 ${
                    uploadedFiles.length + existingFiles.length >= MAX_DOCUMENT_UPLOADS ? 'text-red-500' : 'text-[#8DC63F]'
                  }`}>
                    {uploadedFiles.length + existingFiles.length} / {MAX_DOCUMENT_UPLOADS} files uploaded
                  </p>

                  {(existingFiles.length > 0 || uploadedFiles.length > 0) && (
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      {existingFiles.map((file, index) => (
                        <div key={`existing-${index}`} className="bg-white border border-[#EEEEEE] rounded-xl p-3 flex items-center gap-3">
                          {isPdfFile(file.fileType) ? (
                            <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{file.fileName}</p>
                            <p className="text-xs text-gray-400">Uploaded</p>
                          </div>
                        </div>
                      ))}

                      {uploadedFiles.map((file, index) => (
                        <div key={`new-${index}`} className="bg-white border border-[#EEEEEE] rounded-xl p-3 flex items-center gap-3">
                          {isPdfFile(file.file.type) ? (
                            <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{file.file.name}</p>
                            <p className="text-xs text-gray-400">{(file.file.size / 1024).toFixed(1)} KB</p>
                          </div>
                          {!isReadOnly && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile(index)
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 5 && (
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Review & Submit</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {isReadOnly ? 'Review your submitted application details below.' : 'Please review your information before submitting.'}
                  </p>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-[#8DC63F]" />
                        <h4 className="font-semibold text-gray-900">Personal Information</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">First Name</p>
                          <p className="font-medium text-gray-900">{profile.first_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Middle Name</p>
                          <p className="font-medium text-gray-900">{profile.middle_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Name</p>
                          <p className="font-medium text-gray-900">{profile.last_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Gender</p>
                          <p className="font-medium text-gray-900">{profile.gender || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Date of Birth</p>
                          <p className="font-medium text-gray-900">{profile.date_of_birth || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Nationality</p>
                          <p className="font-medium text-gray-900">{profile.nationality || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Marital Status</p>
                          <p className="font-medium text-gray-900">{profile.marital_status || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <GraduationCap className="w-5 h-5 text-[#8DC63F]" />
                        <h4 className="font-semibold text-gray-900">Academic Details</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">University</p>
                          <p className="font-medium text-gray-900">{profile.university_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">College</p>
                          <p className="font-medium text-gray-900">{profile.college_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Degree</p>
                          <p className="font-medium text-gray-900">{profile.degree_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Branch</p>
                          <p className="font-medium text-gray-900">{profile.branch_specialization || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <p className="font-medium text-gray-900">{formData.academic_current_status || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Graduation Year</p>
                          <p className="font-medium text-gray-900">{formData.academic_graduation_year || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Languages className="w-5 h-5 text-[#8DC63F]" />
                        <h4 className="font-semibold text-gray-900">Language Proficiency</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        {languages.filter(l => l.language).map((lang, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <span className="font-medium text-gray-900 min-w-[100px]">{lang.language}</span>
                            <span className="text-gray-500">Read: {lang.read}</span>
                            <span className="text-gray-500">Write: {lang.write}</span>
                            <span className="text-gray-500">Speak: {lang.speak}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Heart className="w-5 h-5 text-[#8DC63F]" />
                        <h4 className="font-semibold text-gray-900">Health Information</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-500">Medical Conditions</p>
                          <p className="font-medium text-gray-900">{formData.health_medical_conditions || 'None'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Allergies</p>
                          <p className="font-medium text-gray-900">{formData.health_allergies || 'None'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Disabilities</p>
                          <p className="font-medium text-gray-900">{formData.health_disabilities || 'None'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-[#8DC63F]" />
                        <h4 className="font-semibold text-gray-900">Documents</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        {[
                          ...existingFiles.map((file) => ({
                            key: `existing-${file.fieldKey}`,
                            name: file.fileName,
                            type: file.fileType,
                          })),
                          ...uploadedFiles.map((file, index) => ({
                            key: `uploaded-${index}`,
                            name: file.file.name,
                            type: file.file.type,
                          })),
                        ].map((file) => (
                          <div key={file.key} className="flex items-center gap-2">
                            {isPdfFile(file.type) ? (
                              <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            )}
                            <span className="text-gray-900">{file.name}</span>
                          </div>
                        ))}
                        {existingFiles.length === 0 && uploadedFiles.length === 0 && (
                          <p className="text-gray-500">No documents uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isReadOnly && (
                  <div className="mt-8 border-t pt-6 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={declarations.confirm}
                        onChange={(e) => setDeclarations({ ...declarations, confirm: e.target.checked })}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-[#8DC63F] focus:ring-[#8DC63F] accent-[#8DC63F]"
                      />
                      <span className="text-sm text-gray-700">
                        I confirm that all the information provided in this application is true, accurate and complete to the best of my knowledge. I understand that any false information may result in disqualification.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={declarations.terms}
                        onChange={(e) => setDeclarations({ ...declarations, terms: e.target.checked })}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-[#8DC63F] focus:ring-[#8DC63F] accent-[#8DC63F]"
                      />
                      <span className="text-sm text-gray-700">
                        I agree to the{' '}
                        <Link
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8DC63F] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Terms & Conditions
                        </Link>
                        {' '}and{' '}
                        <Link
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8DC63F] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Privacy Policy
                        </Link>
                        {' '}of GreenRoot. I understand that my information will be shared with the respective internship programme coordinators.
                      </span>
                    </label>

                    <button
                      onClick={handleSubmit}
                      disabled={!declarations.confirm || !declarations.terms || isSubmitting}
                      className="w-full bg-[#8DC63F] text-white rounded-xl py-4 font-semibold text-base mt-6 hover:bg-[#7DB62F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EEEEEE] px-8 py-4 flex justify-between items-center z-10">
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              disabled={isSaving}
              className="border border-gray-300 text-gray-600 rounded-lg px-6 py-2.5 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          )}
          
          {currentStep === 1 && <div />}

          <div className="flex gap-3">
            {!isReadOnly && currentStep >= 2 && currentStep <= 4 && (
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="border border-[#8DC63F] text-[#8DC63F] rounded-lg px-6 py-2.5 font-medium hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Draft'
                )}
              </button>
            )}

            {currentStep < 5 && (
              <button
                onClick={handleNext}
                disabled={isSaving}
                className="bg-[#8DC63F] text-white rounded-lg px-6 py-2.5 font-medium hover:bg-[#7DB62F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : isReadOnly ? (
                  <>
                    View Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {application && submittedAt && (
        <ApplicationSubmittedDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          applicationId={application.id}
          submittedAt={submittedAt}
        />
      )}
    </div>
  )
}
