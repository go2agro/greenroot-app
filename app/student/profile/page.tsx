"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { 
  Mail, 
  Phone, 
  Save, 
  Upload, 
  LogOut,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import StudentSidebar from '@/components/StudentSidebar'
import StudentMobileLogo from '@/components/StudentMobileLogo'
import BottomNavigation from '@/components/BottomNavigation'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { getMyProfile } from '@/lib/profiles'
import { signOut, deleteAccount } from '@/lib/auth'
import { 
  getMyStudentProfile, 
  updateStudentProfile,
  uploadStudentDocument,
  checkProfileCompletion
} from '@/lib/studentProfiles'

interface ProfileData {
  first_name?: string
  middle_name?: string
  last_name?: string
  email?: string
  mobile_number?: string
  gender?: 'male' | 'female' | 'other'
  date_of_birth?: string
  nationality?: string
  marital_status?: string
  alternate_email?: string
  alternate_phone?: string
  whatsapp_number?: string
  emergency_contact_number?: string
  short_bio?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  district?: string
  state?: string
  pincode?: string
  current_residential_address?: string
  country?: string
  college_name?: string
  university_name?: string
  degree_name?: string
  branch_specialization?: string
  passport_number?: string
  passport_expiry_date?: string
  passport_issue_date?: string
  passport_country_of_issue?: string
  passport_url?: string
  passport_photo_url?: string
  aadhar_number?: string
  aadhar_front_url?: string
  aadhar_back_url?: string
  pan_number?: string
  pan_url?: string
  driving_license_number?: string
  driving_license_url?: string
  digital_signature_url?: string
  profile_photo_url?: string
}

const fetcher = (fn: () => Promise<any>) => fn().then(res => res.data)

// Common countries
const countries = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 
  'Germany', 'France', 'Japan', 'Singapore', 'UAE', 'Other'
]

// Indian states
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

// Universities
const universities = [
  'Indian Agricultural Research Institute (IARI), Delhi',
  'Punjab Agricultural University, Ludhiana',
  'Tamil Nadu Agricultural University, Coimbatore',
  'University of Agricultural Sciences, Bangalore',
  'Acharya N.G. Ranga Agricultural University, Andhra Pradesh',
  'Other'
]

// Degrees
const degrees = [
  'B.Sc Agriculture',
  'B.Tech Agriculture',
  'M.Sc Agriculture',
  'MBA Agribusiness',
  'Ph.D Agriculture',
  'Other'
]

// Specializations
const specializations = [
  'Agronomy',
  'Horticulture',
  'Plant Breeding',
  'Soil Science',
  'Agricultural Engineering',
  'Agricultural Economics',
  'Animal Husbandry',
  'Other'
]

// Years
const years = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Final Year',
  'Graduated'
]

export default function StudentProfile() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [sameAsPermanent, setSameAsPermanent] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    personal: false,
    contact: false,
    address: false,
    identity: false,
    academic: false,
  })
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Form data
  const [formData, setFormData] = useState<ProfileData>({})

  // Fetch data
  const { data: profile } = useSWR('myProfile', () => fetcher(getMyProfile), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const { data: studentProfile, mutate: refreshProfile } = useSWR(
    'studentProfile', 
    () => fetcher(getMyStudentProfile),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const { data: profileCompletionData, mutate: refreshCompletion } = useSWR(
    'profileCompletion',
    () => fetcher(checkProfileCompletion),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // Initialize form data when profile loads
  useEffect(() => {
    if (studentProfile) {
      setFormData(studentProfile)
      if (studentProfile.address_line_1 === studentProfile.current_residential_address) {
        setSameAsPermanent(true)
      }
    }
  }, [studentProfile])

  // Check auth
  useEffect(() => {
    if (profile !== undefined && (!profile || profile.role !== 'student')) {
      router.push('/login')
    }
  }, [profile, router])

  const profileCompletion = profileCompletionData?.completionPercentage ?? 0

  // Handle form input change
  const handleChange = (field: keyof ProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle same as permanent address checkbox
  const handleSameAsPermanent = (checked: boolean) => {
    setSameAsPermanent(checked)
    if (checked) {
      handleChange('current_residential_address', formData.address_line_1 || '')
    }
  }

  // Handle document upload
  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    docType: 'passport' | 'passport_photo' | 'aadhar_front' | 'aadhar_back' | 'pan' | 'driving_license' | 'digital_signature'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are allowed')
      e.target.value = '' // Reset input
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      e.target.value = '' // Reset input
      return
    }

    setUploadingDoc(docType)
    try {
      const result = await uploadStudentDocument(file, docType)
      if (result.error) {
        toast.error('Failed to upload document')
        console.error('Upload error:', result.error)
      } else {
        toast.success('Document uploaded successfully')
        await refreshProfile()
        await refreshCompletion()
        e.target.value = '' // Reset input after successful upload
      }
    } catch (error) {
      toast.error('Failed to upload document')
      console.error('Upload exception:', error)
    } finally {
      setUploadingDoc(null)
    }
  }

  // Handle save for specific section
  const handleSave = async (section: string) => {
    setSavingSection(section)
    try {
      let dataToSave: Partial<ProfileData> = {}

      // Save based on section
      if (section === 'personal') {
        dataToSave = {
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          nationality: formData.nationality,
          marital_status: formData.marital_status,
        }
      } else if (section === 'contact') {
        dataToSave = {
          email: formData.email,
          mobile_number: formData.mobile_number,
          alternate_email: formData.alternate_email,
          alternate_phone: formData.alternate_phone,
          whatsapp_number: formData.whatsapp_number,
          emergency_contact_number: formData.emergency_contact_number,
        }
      } else if (section === 'address') {
        dataToSave = {
          country: formData.country,
          state: formData.state,
          city: formData.city,
          district: formData.district,
          address_line_1: formData.address_line_1,
          address_line_2: formData.address_line_2,
          pincode: formData.pincode,
          current_residential_address: formData.current_residential_address,
        }
      } else if (section === 'identity') {
        dataToSave = {
          passport_number: formData.passport_number,
          passport_expiry_date: formData.passport_expiry_date,
          passport_issue_date: formData.passport_issue_date,
          passport_country_of_issue: formData.passport_country_of_issue,
          aadhar_number: formData.aadhar_number,
          pan_number: formData.pan_number,
          driving_license_number: formData.driving_license_number,
        }
      } else if (section === 'academic') {
        dataToSave = {
          university_name: formData.university_name,
          college_name: formData.college_name,
          degree_name: formData.degree_name,
          branch_specialization: formData.branch_specialization,
        }
      }

      const result = await updateStudentProfile(dataToSave)
      if (result.error) {
        toast.error('Failed to save changes')
      } else {
        toast.success('Saved successfully')
        await refreshProfile()
        await refreshCompletion()
        // Collapse the section after save
        setCollapsedSections(prev => ({ ...prev, [section]: true }))
        // Scroll to progress bar smoothly
        progressBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } catch (error) {
      toast.error('Failed to save changes')
    } finally {
      setSavingSection(null)
    }
  }

  // Copy student ID to clipboard
  const copyStudentId = () => {
    if (profile?.unique_id) {
      navigator.clipboard.writeText(profile.unique_id)
      setCopiedId(true)
      toast.success('Student ID copied to clipboard')
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  // Toggle section collapse
  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Delete document
  const handleDeleteDocument = async (docType: string) => {
    try {
      const result = await updateStudentProfile({ [docType]: null })
      if (result.error) {
        toast.error('Failed to delete document')
      } else {
        toast.success('Document deleted successfully')
        await refreshProfile()
        await refreshCompletion()
      }
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      toast.error('Failed to logout')
      setIsLoggingOut(false)
    }
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    try {
      const result = await deleteAccount()
      if (result.error) {
        toast.error('Failed to delete account')
        setIsDeletingAccount(false)
        return
      }
      toast.success('Account deleted successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to delete account')
      setIsDeletingAccount(false)
    }
  }

  const displayName = formData.first_name || profile?.email || 'Student'
  
  // Get avatar initials - show first and last name initials if both available
  const getAvatarInitials = () => {
    const firstName = formData.first_name?.trim()
    const lastName = formData.last_name?.trim()
    
    if (firstName && lastName) {
      return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase()
    } else {
      return (profile?.email?.charAt(0).toUpperCase() || 'S')
    }
  }
  
  const avatarInitials = getAvatarInitials()
  
  // Get student ID from profiles table (unique user ID)
  const studentId = profile?.unique_id || null

  const isFirstLoad = !profile && !studentProfile

  if (isFirstLoad) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:block">
        <StudentSidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <StudentMobileLogo />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Profile Settings
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {formData.first_name} {formData.last_name}
                </p>
                  <p className="text-xs text-[#3B82F6] font-medium">ID: {studentId || 'N/A'}</p>
              </div>
              <Link
                href="/student/profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#8DC63F] flex items-center justify-center text-white font-bold text-sm sm:text-base cursor-pointer hover:opacity-80 transition-opacity"
              >
                {avatarInitials}
              </Link>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-auto pb-24 lg:pb-20">
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Profile Completion Card */}
            <div ref={progressBarRef} className="bg-white rounded-2xl border border-[#EEEEEE] p-6 mb-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="font-bold text-xl mb-1">
                    {profileCompletion === 100 ? 'Profile Complete' : 'Complete Your Profile'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {profileCompletion === 100
                      ? 'Your profile is fully complete! You\'re all set to apply for top agricultural internships.'
                      : `Finish your profile to increase your chances of getting matched with top agricultural internships! Just ${100 - profileCompletion}% more to go!`}
                  </p>
                  <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#8DC63F] rounded-full transition-all duration-300"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-500 font-bold text-3xl">{profileCompletion}%</p>
                  <p className="text-gray-500 text-xs">Profile Strength</p>
                </div>
              </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#8DC63F] flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {avatarInitials}
                  </span>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h2 className="font-bold text-xl mb-1">
                    {formData.first_name || 'Student'} {formData.last_name || ''}
                  </h2>
                  <p className="text-gray-500 text-sm mb-3">
                    {formData.degree_name && formData.branch_specialization
                      ? `${formData.degree_name} - ${formData.branch_specialization}`
                      : 'Student Profile'}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{formData.email || profile?.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{formData.mobile_number || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Student ID */}
                <button
                  onClick={copyStudentId}
                  className="border border-blue-400 text-blue-500 rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  Student ID - {profile?.unique_id || 'N/A'}
                  {copiedId ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Section A: Personal Information */}
            <div className="bg-white rounded-2xl border border-[#EEEEEE] mb-6 overflow-hidden">
              <button
                onClick={() => toggleSection('personal')}
                className="w-full flex items-center justify-between p-6 hover:bg-green-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900">Section A: <span className="text-[#3B82F6]">Personal Information</span></h2>
                {collapsedSections.personal ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  collapsedSections.personal ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
                } overflow-hidden`}
              >
              <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    First Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middle_name || ''}
                    onChange={(e) => handleChange('middle_name', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="William"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Last Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Gender<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => handleChange('gender', e.target.value as 'male' | 'female' | 'other')}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Date of Birth<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth || ''}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nationality<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nationality || ''}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="Indian"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Marital Status<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.marital_status || ''}
                    onChange={(e) => handleChange('marital_status', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => handleSave('personal')}
                  disabled={savingSection === 'personal'}
                  className="border border-[#8DC63F] text-[#8DC63F] rounded-lg px-16 py-2.5 flex items-center gap-2 hover:bg-[#8DC63F] hover:text-white transition-colors disabled:opacity-50 text-sm font-bold"
                >
                  <Save className="w-4 h-4" />
                  {savingSection === 'personal' ? 'Saving...' : 'Save'}
                </button>
              </div>
              </div>
              </div>
            </div>

            {/* Section B: Contact Information */}
            <div className="bg-white rounded-2xl border border-[#EEEEEE] mb-6 overflow-hidden">
              <button
                onClick={() => toggleSection('contact')}
                className="w-full flex items-center justify-between p-6 hover:bg-green-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900">Section B: <span className="text-[#3B82F6]">Contact Information</span></h2>
                {collapsedSections.contact ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  collapsedSections.contact ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
                } overflow-hidden`}
              >
              <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Mobile Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile_number || ''}
                    onChange={(e) => handleChange('mobile_number', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Alternate Email
                  </label>
                  <input
                    type="email"
                    value={formData.alternate_email || ''}
                    onChange={(e) => handleChange('alternate_email', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="alternate@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.alternate_phone || ''}
                    onChange={(e) => handleChange('alternate_phone', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="+91 9876543211"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp_number || ''}
                    onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Emergency Contact Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_number || ''}
                    onChange={(e) => handleChange('emergency_contact_number', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="+91 9876543212"
                  />
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => handleSave('contact')}
                  disabled={savingSection === 'contact'}
                  className="border border-[#8DC63F] text-[#8DC63F] rounded-lg px-16 py-2.5 flex items-center gap-2 hover:bg-[#8DC63F] hover:text-white transition-colors disabled:opacity-50 text-sm font-bold"
                >
                  <Save className="w-4 h-4" />
                  {savingSection === 'contact' ? 'Saving...' : 'Save'}
                </button>
              </div>
              </div>
              </div>
            </div>

            {/* Section C: Address Details */}
            <div className="bg-white rounded-2xl border border-[#EEEEEE] mb-6 overflow-hidden">
              <button
                onClick={() => toggleSection('address')}
                className="w-full flex items-center justify-between p-6 hover:bg-green-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900">Section C: <span className="text-[#3B82F6]">Address Details</span></h2>
                {collapsedSections.address ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  collapsedSections.address ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
                } overflow-hidden`}
              >
              <div className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Country<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.country || ''}
                      onChange={(e) => handleChange('country', e.target.value)}
                      className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      State<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.state || ''}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    >
                      <option value="">Select State</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      City<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      District
                    </label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => handleChange('district', e.target.value)}
                      className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                      placeholder="Mumbai Suburban"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Address Line 1<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address_line_1 || ''}
                    onChange={(e) => handleChange('address_line_1', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="123, Green Valley Road"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.address_line_2 || ''}
                    onChange={(e) => handleChange('address_line_2', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="Near City Center"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Pincode<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pincode || ''}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="400001"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Current Residential Address
                  </label>
                  <input
                    type="text"
                    value={formData.current_residential_address || ''}
                    onChange={(e) => handleChange('current_residential_address', e.target.value)}
                    disabled={sameAsPermanent}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm disabled:opacity-50"
                    placeholder="123, Green Valley Road"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    checked={sameAsPermanent}
                    onChange={(e) => handleSameAsPermanent(e.target.checked)}
                    className="w-4 h-4 accent-[#8DC63F]"
                  />
                  <label htmlFor="sameAddress" className="text-sm text-gray-600">
                    Same as Permanent Address
                  </label>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => handleSave('address')}
                  disabled={savingSection === 'address'}
                  className="border border-[#8DC63F] text-[#8DC63F] rounded-lg px-16 py-2.5 flex items-center gap-2 hover:bg-[#8DC63F] hover:text-white transition-colors disabled:opacity-50 text-sm font-bold"
                >
                  <Save className="w-4 h-4" />
                  {savingSection === 'address' ? 'Saving...' : 'Save'}
                </button>
              </div>
              </div>
              </div>
            </div>

            {/* Section D: Identity Documents */}
            <div className="bg-white rounded-2xl border border-[#EEEEEE] mb-6 overflow-hidden">
              <button
                onClick={() => toggleSection('identity')}
                className="w-full flex items-center justify-between p-6 hover:bg-green-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900">Section D: <span className="text-[#3B82F6]">Identity Documents</span></h2>
                {collapsedSections.identity ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  collapsedSections.identity ? 'max-h-0 opacity-0' : 'max-h-[3000px] opacity-100'
                } overflow-hidden`}
              >
              <div className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Passport Number<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.passport_number || ''}
                      onChange={(e) => handleChange('passport_number', e.target.value)}
                      className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                      placeholder="A12345678"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Passport Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.passport_expiry_date || ''}
                      onChange={(e) => handleChange('passport_expiry_date', e.target.value)}
                      className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Passport Issue Date
                    </label>
                    <input
                      type="date"
                      value={formData.passport_issue_date || ''}
                      onChange={(e) => handleChange('passport_issue_date', e.target.value)}
                      className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Country of Issue
                    </label>
                    <select
                      value={formData.passport_country_of_issue || ''}
                      onChange={(e) => handleChange('passport_country_of_issue', e.target.value)}
                      className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Aadhar Number<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.aadhar_number || ''}
                      onChange={(e) => handleChange('aadhar_number', e.target.value)}
                      className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                      placeholder="1234 5678 9012"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      PAN Number<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pan_number || ''}
                      onChange={(e) => handleChange('pan_number', e.target.value)}
                      className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                      placeholder="ABCDE1234F"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Driving License Number
                  </label>
                  <input
                    type="text"
                    value={formData.driving_license_number || ''}
                    onChange={(e) => handleChange('driving_license_number', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="DL1234567890"
                  />
                </div>

                {/* Document Uploads */}
                <div className="mt-6">
                  <h3 className="text-base font-semibold mb-4">Upload Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Passport Document */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Passport Document
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        studentProfile?.passport_url 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-[#F5F5F5] border-gray-300'
                      }`}>
                        {studentProfile?.passport_url ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">Document Uploaded</span>
                            </div>
                            <button
                              onClick={() => handleDeleteDocument('passport_url')}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleDocumentUpload(e, 'passport')}
                              className="hidden"
                              id="passport-upload"
                            />
                            <label
                              htmlFor="passport-upload"
                              className="cursor-pointer text-sm text-[#8DC63F] hover:underline"
                            >
                              {uploadingDoc === 'passport' ? 'Uploading...' : 'Upload Passport'}
                            </label>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Passport Photo */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Passport Photo
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        studentProfile?.passport_photo_url 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-[#F5F5F5] border-gray-300'
                      }`}>
                        {studentProfile?.passport_photo_url ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">Photo Uploaded</span>
                            </div>
                            <button
                              onClick={() => handleDeleteDocument('passport_photo_url')}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentUpload(e, 'passport_photo')}
                              className="hidden"
                              id="passport-photo-upload"
                            />
                            <label
                              htmlFor="passport-photo-upload"
                              className="cursor-pointer text-sm text-[#8DC63F] hover:underline"
                            >
                              {uploadingDoc === 'passport_photo' ? 'Uploading...' : 'Upload Photo'}
                            </label>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Aadhar Front */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Aadhar Front
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        studentProfile?.aadhar_front_url 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-[#F5F5F5] border-gray-300'
                      }`}>
                        {studentProfile?.aadhar_front_url ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">Aadhar Front Uploaded</span>
                            </div>
                            <button
                              onClick={() => handleDeleteDocument('aadhar_front_url')}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleDocumentUpload(e, 'aadhar_front')}
                              className="hidden"
                              id="aadhar-front-upload"
                            />
                            <label
                              htmlFor="aadhar-front-upload"
                              className="cursor-pointer text-sm text-[#8DC63F] hover:underline"
                            >
                              {uploadingDoc === 'aadhar_front' ? 'Uploading...' : 'Upload Aadhar Front'}
                            </label>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Aadhar Back */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Aadhar Back
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        studentProfile?.aadhar_back_url 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-[#F5F5F5] border-gray-300'
                      }`}>
                        {studentProfile?.aadhar_back_url ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">Aadhar Back Uploaded</span>
                            </div>
                            <button
                              onClick={() => handleDeleteDocument('aadhar_back_url')}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleDocumentUpload(e, 'aadhar_back')}
                              className="hidden"
                              id="aadhar-back-upload"
                            />
                            <label
                              htmlFor="aadhar-back-upload"
                              className="cursor-pointer text-sm text-[#8DC63F] hover:underline"
                            >
                              {uploadingDoc === 'aadhar_back' ? 'Uploading...' : 'Upload Aadhar Back'}
                            </label>
                          </>
                        )}
                      </div>
                    </div>

                    {/* PAN Card */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        PAN Card
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        studentProfile?.pan_url 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-[#F5F5F5] border-gray-300'
                      }`}>
                        {studentProfile?.pan_url ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">PAN Card Uploaded</span>
                            </div>
                            <button
                              onClick={() => handleDeleteDocument('pan_url')}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleDocumentUpload(e, 'pan')}
                              className="hidden"
                              id="pan-upload"
                            />
                            <label
                              htmlFor="pan-upload"
                              className="cursor-pointer text-sm text-[#8DC63F] hover:underline"
                            >
                              {uploadingDoc === 'pan' ? 'Uploading...' : 'Upload PAN Card'}
                            </label>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Digital Signature */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Digital Signature
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        studentProfile?.digital_signature_url 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-[#F5F5F5] border-gray-300'
                      }`}>
                        {studentProfile?.digital_signature_url ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">Signature Uploaded</span>
                            </div>
                            <button
                              onClick={() => handleDeleteDocument('digital_signature_url')}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentUpload(e, 'digital_signature')}
                              className="hidden"
                              id="signature-upload"
                            />
                            <label
                              htmlFor="signature-upload"
                              className="cursor-pointer text-sm text-[#8DC63F] hover:underline"
                            >
                              {uploadingDoc === 'digital_signature' ? 'Uploading...' : 'Upload Signature'}
                            </label>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Driving License */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Driving License
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        studentProfile?.driving_license_url 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-[#F5F5F5] border-gray-300'
                      }`}>
                        {studentProfile?.driving_license_url ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">License Uploaded</span>
                            </div>
                            <button
                              onClick={() => handleDeleteDocument('driving_license_url')}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleDocumentUpload(e, 'driving_license')}
                              className="hidden"
                              id="license-upload"
                            />
                            <label
                              htmlFor="license-upload"
                              className="cursor-pointer text-sm text-[#8DC63F] hover:underline"
                            >
                              {uploadingDoc === 'driving_license' ? 'Uploading...' : 'Upload License'}
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => handleSave('identity')}
                  disabled={savingSection === 'identity'}
                  className="border border-[#8DC63F] text-[#8DC63F] rounded-lg px-16 py-2.5 flex items-center gap-2 hover:bg-[#8DC63F] hover:text-white transition-colors disabled:opacity-50 text-sm font-bold"
                >
                  <Save className="w-4 h-4" />
                  {savingSection === 'identity' ? 'Saving...' : 'Save'}
                </button>
              </div>
              </div>
              </div>
            </div>

            {/* Section E: Academic Information */}
            <div className="bg-white rounded-2xl border border-[#EEEEEE] mb-6 overflow-hidden">
              <button
                onClick={() => toggleSection('academic')}
                className="w-full flex items-center justify-between p-6 hover:bg-green-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900">Section E: <span className="text-[#3B82F6]">Academic Information</span></h2>
                {collapsedSections.academic ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  collapsedSections.academic ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
                } overflow-hidden`}
              >
              <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    University Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.university_name || ''}
                    onChange={(e) => handleChange('university_name', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="Indian Agricultural Research Institute"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    College Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.college_name || ''}
                    onChange={(e) => handleChange('college_name', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="College of Agriculture"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Degree Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.degree_name || ''}
                    onChange={(e) => handleChange('degree_name', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="B.Sc Agriculture"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Branch / Specialization<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.branch_specialization || ''}
                    onChange={(e) => handleChange('branch_specialization', e.target.value)}
                    className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                    placeholder="Agronomy"
                  />
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => handleSave('academic')}
                  disabled={savingSection === 'academic'}
                  className="border border-[#8DC63F] text-[#8DC63F] rounded-lg px-16 py-2.5 flex items-center gap-2 hover:bg-[#8DC63F] hover:text-white transition-colors disabled:opacity-50 text-sm font-bold"
                >
                  <Save className="w-4 h-4" />
                  {savingSection === 'academic' ? 'Saving...' : 'Save'}
                </button>
              </div>
              </div>
              </div>
            </div>

            {/* Logout Section */}
            <div className="mt-8 bg-white rounded-2xl border border-[#EEEEEE] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base text-gray-900 mb-1">Logout</h3>
                  <p className="text-sm text-gray-500">Sign out of your account</p>
                </div>
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  disabled={isLoggingOut}
                  className="border border-red-500 text-red-500 rounded-lg px-6 py-2.5 flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="mt-4 bg-white rounded-2xl border border-[#EEEEEE] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base text-gray-900 mb-1">Delete Account</h3>
                  <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                </div>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeletingAccount}
                  className="border border-red-500 text-red-500 rounded-lg px-6 py-2.5 flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <BottomNavigation />

      <ConfirmationDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        icon={<LogOut strokeWidth={1.5} />}
        title="Logout Account?"
        description="Are you sure you want to log out from your account? You can always log back in."
        confirmText="Log out"
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
        loadingText="Logging out..."
      />

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        icon={<Trash2 strokeWidth={1.5} />}
        title="Delete Account?"
        description="Are you sure you want to delete your account? You can lose all your saved data."
        confirmText="Delete"
        onConfirm={handleDeleteAccount}
        isLoading={isDeletingAccount}
        loadingText="Deleting..."
      />
    </div>
  )
}
