"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import useSWR from 'swr'
import { 
  Mail, 
  Phone, 
  Pencil, 
  Save, 
  ArrowRight, 
  Upload, 
  FileText,
  Calendar,
  X,
  LogOut
} from 'lucide-react'
import { toast } from 'sonner'
import StudentSidebar from '@/components/StudentSidebar'
import BottomNavigation from '@/components/BottomNavigation'
import { getMyProfile } from '@/lib/profiles'
import { signOut } from '@/lib/auth'
import { 
  getMyStudentProfile, 
  updateStudentProfile,
  uploadStudentDocument
} from '@/lib/studentProfiles'

interface ProfileData {
  first_name?: string
  middle_name?: string
  last_name?: string
  email?: string
  phone_number?: string
  gender?: 'male' | 'female' | 'other'
  date_of_birth?: string
  short_bio?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  pincode?: string
  current_residential_address?: string
  country?: string
  university_name?: string
  degree?: string
  branch_major?: string
  course_status?: string
  cgpa?: number
  graduation_date?: string
  university_roll_number?: string
  passport_number?: string
  passport_expiry_date?: string
  passport_issue_date?: string
  passport_country_of_issue?: string
  aadhar_number?: string
  pan_number?: string
  profile_photo_url?: string
  passport_scan_url?: string
  passport_photo_url?: string
  student_id_card_url?: string
  bonafide_certificate_url?: string
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
  const [activeTab, setActiveTab] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [sameAsPermanent, setSameAsPermanent] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

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

  // Calculate profile completion
  const calculateCompletion = () => {
    if (!studentProfile) return 0
    const requiredFields = [
      'first_name', 'last_name', 'date_of_birth', 'gender', 'email',
      'phone_number', 'short_bio', 'address_line_1', 'country',
      'state', 'city', 'pincode', 'current_residential_address',
      'university_name', 'degree', 'branch_major', 'course_status',
      'cgpa', 'graduation_date', 'university_roll_number',
      'passport_number', 'passport_expiry_date', 
      'passport_issue_date', 'passport_country_of_issue',
      'aadhar_number'
    ]
    const filledFields = requiredFields.filter(field => 
      studentProfile[field as keyof ProfileData]
    ).length
    return Math.round((filledFields / requiredFields.length) * 100)
  }

  const profileCompletion = calculateCompletion()

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

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    setUploadingFile(true)
    try {
      const result = await uploadStudentDocument(file, 'passport_photo')
      if (result.error) {
        toast.error('Failed to upload photo')
      } else {
        toast.success('Photo uploaded successfully')
        await refreshProfile()
      }
    } catch (error) {
      toast.error('Failed to upload photo')
    } finally {
      setUploadingFile(false)
    }
  }

  // Handle document upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are allowed')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    setUploadingFile(true)
    try {
      // Default to passport_scan for now
      const result = await uploadStudentDocument(file, 'passport_scan')
      if (result.error) {
        toast.error('Failed to upload document')
      } else {
        toast.success('Document uploaded successfully')
        await refreshProfile()
      }
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setUploadingFile(false)
    }
  }

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)
    try {
      let dataToSave: Partial<ProfileData> = {}

      // Save based on active tab
      if (activeTab === 0) {
        dataToSave = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          short_bio: formData.short_bio,
        }
      } else if (activeTab === 1) {
        dataToSave = {
          address_line_1: formData.address_line_1,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          pincode: formData.pincode,
          current_residential_address: formData.current_residential_address,
        }
      } else if (activeTab === 2) {
        dataToSave = {
          university_name: formData.university_name,
          degree: formData.degree,
          branch_major: formData.branch_major,
          course_status: formData.course_status,
          cgpa: formData.cgpa,
          graduation_date: formData.graduation_date,
          university_roll_number: formData.university_roll_number,
        }
      } else if (activeTab === 3) {
        dataToSave = {
          passport_number: formData.passport_number,
          passport_expiry_date: formData.passport_expiry_date,
          passport_issue_date: formData.passport_issue_date,
          passport_country_of_issue: formData.passport_country_of_issue,
          aadhar_number: formData.aadhar_number,
          pan_number: formData.pan_number,
        }
      }

      const result = await updateStudentProfile(dataToSave)
      if (result.error) {
        toast.error('Failed to save changes')
      } else {
        toast.success('Changes saved successfully')
        await refreshProfile()
      }
    } catch (error) {
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle next tab
  const handleNext = () => {
    if (activeTab < 3) {
      setActiveTab(activeTab + 1)
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

  const tabs = ['Personal Details', 'Address', 'Academic Info', 'Identification']

  const displayName = formData.first_name || profile?.email || 'Student'
  const avatarInitial = formData.first_name 
    ? formData.first_name.charAt(0).toUpperCase()
    : profile?.email?.charAt(0).toUpperCase() || 'S'

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
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Profile Settings
              </h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formData.first_name} {formData.last_name}
                </p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#8DC63F] flex items-center justify-center text-white font-bold text-sm sm:text-base">
                {avatarInitial}
              </div>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-auto pb-24 lg:pb-20">
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Profile Completion Card */}
            <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6 mb-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="font-bold text-xl mb-1">Complete Your Profile</h2>
                  <p className="text-sm text-gray-500">
                    Finish your profile to increase your chances of getting matched with top agricultural internships! Just {100 - profileCompletion}% more to go!
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
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                    {formData.profile_photo_url ? (
                      <Image
                        src={formData.profile_photo_url}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                        {avatarInitial}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[#8DC63F] rounded-full flex items-center justify-center hover:bg-[#7DB62F] transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-white" />
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h2 className="font-bold text-xl mb-1">
                    {formData.first_name || 'Student'} {formData.last_name || ''}
                  </h2>
                  <p className="text-gray-500 text-sm mb-3">
                    {formData.course_status && formData.degree && formData.branch_major
                      ? `${formData.course_status}, ${formData.degree} ${formData.branch_major}`
                      : 'Student Profile'}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{formData.email || profile?.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{formData.phone_number || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Student ID */}
                <div className="border border-blue-400 text-blue-500 rounded-lg px-4 py-2 text-sm font-medium">
                  Student ID - {profile?.unique_id || 'N/A'}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
              {/* Tab Headers */}
              <div className="border-b border-[#EEEEEE] overflow-x-auto">
                <div className="flex min-w-max">
                  {tabs.map((tab, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === index
                          ? 'text-[#8DC63F] border-b-2 border-[#8DC63F]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Personal Details Tab */}
                {activeTab === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.first_name || ''}
                        onChange={(e) => handleChange('first_name', e.target.value)}
                        className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                        placeholder="Elena"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.last_name || ''}
                        onChange={(e) => handleChange('last_name', e.target.value)}
                        className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                        placeholder="Rodriguez"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Date of Birth
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
                        Gender
                      </label>
                      <select
                        value={formData.gender || ''}
                        onChange={(e) => handleChange('gender', e.target.value as 'male' | 'female' | 'other')}
                        className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Short Bio
                      </label>
                      <textarea
                        value={formData.short_bio || ''}
                        onChange={(e) => handleChange('short_bio', e.target.value)}
                        rows={4}
                        className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm resize-none"
                        placeholder="Passionate about sustainable crop management and precision agriculture..."
                      />
                    </div>
                  </div>
                )}

                {/* Address Tab */}
                {activeTab === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Permanent Address*
                      </label>
                      <input
                        type="text"
                        value={formData.address_line_1 || ''}
                        onChange={(e) => handleChange('address_line_1', e.target.value)}
                        className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                        placeholder="123, Green Valley Road"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Country*
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
                          State*
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
                          City*
                        </label>
                        <input
                          type="text"
                          value={formData.city || ''}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                          placeholder="Enter City"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          ZIP Code*
                        </label>
                        <input
                          type="text"
                          value={formData.pincode || ''}
                          onChange={(e) => handleChange('pincode', e.target.value)}
                          className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                          placeholder="Enter Code"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Current Residential Address*
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
                )}

                {/* Academic Info Tab */}
                {activeTab === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          University/College*
                        </label>
                        <select
                          value={formData.university_name || ''}
                          onChange={(e) => handleChange('university_name', e.target.value)}
                          className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                        >
                          <option value="">Select University/College</option>
                          {universities.map(uni => (
                            <option key={uni} value={uni}>{uni}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Degree Program*
                        </label>
                        <select
                          value={formData.degree || ''}
                          onChange={(e) => handleChange('degree', e.target.value)}
                          className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                        >
                          <option value="">Select Degree</option>
                          {degrees.map(deg => (
                            <option key={deg} value={deg}>{deg}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Specialization*
                        </label>
                        <select
                          value={formData.branch_major || ''}
                          onChange={(e) => handleChange('branch_major', e.target.value)}
                          className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                        >
                          <option value="">Select Specialization</option>
                          {specializations.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Current Year*
                        </label>
                        <select
                          value={formData.course_status || ''}
                          onChange={(e) => handleChange('course_status', e.target.value)}
                          className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                        >
                          <option value="">Select Year</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          CGPA/Percentage*
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.cgpa || ''}
                          onChange={(e) => handleChange('cgpa', parseFloat(e.target.value))}
                          className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                          placeholder="Enter CGPA"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Graduation Date*
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={formData.graduation_date || ''}
                            onChange={(e) => handleChange('graduation_date', e.target.value)}
                            className="bg-[#F5F5F5] rounded-lg py-3 px-4 pr-10 w-full outline-none text-sm"
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        University Roll Number*
                      </label>
                      <input
                        type="text"
                        value={formData.university_roll_number || ''}
                        onChange={(e) => handleChange('university_roll_number', e.target.value)}
                        className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                        placeholder="Enter Roll Number"
                      />
                    </div>
                  </div>
                )}

                {/* Identification Tab */}
                {activeTab === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Passport Number*
                        </label>
                        <input
                          type="text"
                          value={formData.passport_number || ''}
                          onChange={(e) => handleChange('passport_number', e.target.value)}
                          className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                          placeholder="Enter Number"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Passport Expiry Date*
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={formData.passport_expiry_date || ''}
                            onChange={(e) => handleChange('passport_expiry_date', e.target.value)}
                            className="bg-[#F5F5F5] rounded-lg py-3 px-4 pr-10 w-full outline-none text-sm"
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Passport Issue Date*
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={formData.passport_issue_date || ''}
                            onChange={(e) => handleChange('passport_issue_date', e.target.value)}
                            className="bg-[#F5F5F5] rounded-lg py-3 px-4 pr-10 w-full outline-none text-sm"
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Country of Issue*
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
                          Aadhaar Number*
                        </label>
                        <input
                          type="text"
                          value={formData.aadhar_number || ''}
                          onChange={(e) => handleChange('aadhar_number', e.target.value)}
                          className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                          placeholder="Enter Number"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          PAN Number
                        </label>
                        <input
                          type="text"
                          value={formData.pan_number || ''}
                          onChange={(e) => handleChange('pan_number', e.target.value)}
                          className="bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm"
                          placeholder="Select Date"
                        />
                      </div>
                    </div>

                    {/* Upload Documents */}
                    <div className="mt-8">
                      <h3 className="text-base font-semibold mb-2">Upload Documents</h3>
                      <ul className="text-sm text-gray-500 mb-4 space-y-1">
                        <li>• Passport Scan (Required)</li>
                        <li>• Passport Size Photograph (Required)</li>
                        <li>• Student ID Card (Required)</li>
                        <li>• University Bonafide Certificate (Required)</li>
                      </ul>

                      <div className="bg-gray-100 rounded-2xl p-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="font-medium text-gray-600 text-sm mb-1">
                            Choose a file or Drag and drop here
                          </p>
                          <p className="text-xs text-gray-400 mb-4">
                            JPEG, PNG, PDF, Upto 50 mb
                          </p>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingFile}
                            className="border border-[#8DC63F] text-[#8DC63F] rounded-lg px-6 py-2 text-sm hover:bg-[#8DC63F] hover:text-white transition-colors disabled:opacity-50"
                          >
                            {uploadingFile ? 'Uploading...' : 'Browse File'}
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleDocumentUpload}
                            className="hidden"
                          />
                        </div>

                        {/* Uploaded Files */}
                        {(studentProfile?.passport_scan_url || studentProfile?.passport_photo_url || studentProfile?.student_id_card_url) && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                            {studentProfile?.passport_scan_url && (
                              <div className="bg-white rounded-xl p-3 border border-[#EEEEEE] flex items-center gap-3">
                                <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">Resume.pdf</p>
                                  <p className="text-xs text-gray-400">2.4 MB</p>
                                </div>
                              </div>
                            )}
                            {studentProfile?.passport_photo_url && (
                              <div className="bg-white rounded-xl p-3 border border-[#EEEEEE] flex items-center gap-3">
                                <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">Transcript.pdf</p>
                                  <p className="text-xs text-gray-400">1.1 MB</p>
                                </div>
                              </div>
                            )}
                            {studentProfile?.student_id_card_url && (
                              <div className="bg-white rounded-xl p-3 border border-[#EEEEEE] flex items-center gap-3">
                                <FileText className="w-8 h-8 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">CoverLetter.docx</p>
                                  <p className="text-xs text-gray-400">850 KB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="border border-red-500 text-red-500 rounded-lg px-6 py-2.5 flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-white border-t border-[#EEEEEE] px-4 sm:px-8 py-4 flex justify-between items-center flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="border border-[#8DC63F] text-[#8DC63F] rounded-lg px-6 py-2.5 flex items-center gap-2 hover:bg-[#8DC63F] hover:text-white transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          {activeTab < 3 && (
            <button
              onClick={handleNext}
              className="bg-[#8DC63F] text-white rounded-lg px-6 py-2.5 flex items-center gap-2 hover:bg-[#7DB62F] transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}
