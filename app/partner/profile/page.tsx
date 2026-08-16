"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import {
  Mail,
  Phone,
  LogOut,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Save,
} from 'lucide-react'
import PartnerSidebar from '@/components/PartnerSidebar'
import PartnerBottomNavigation from '@/components/PartnerBottomNavigation'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { getMyProfile } from '@/lib/profiles'
import { getMyPartnerProfile, updatePartnerProfile } from '@/lib/partnerProfiles'
import { signOut } from '@/lib/auth'
import { PARTNER_COUNTRY_OPTIONS, getCountryFlag } from '@/lib/countries'

interface PartnerProfileData {
  first_name?: string
  middle_name?: string
  last_name?: string
  personal_email?: string
  official_email?: string
  phone_number?: string
  alternate_phone_number?: string
  gender?: 'male' | 'female' | 'other'
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  pincode?: string
  aadhar_number?: string
  pan_number?: string
  countries?: string[]
}

const fetcher = (fn: () => Promise<{ data: unknown; error?: unknown }>) =>
  fn().then((res) => res.data)

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const inputClass = 'bg-[#F5F5F5] rounded-lg py-3 px-4 w-full outline-none text-sm'
const labelClass = 'text-sm font-medium text-gray-700 mb-2 block'

export default function PartnerProfilePage() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [formData, setFormData] = useState<PartnerProfileData>({})
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    personal: false,
    countries: false,
    contact: true,
    address: true,
    identity: true,
  })
  const [selectedCountry, setSelectedCountry] = useState('')

  const { data: profile } = useSWR('partnerMyProfile', () => fetcher(getMyProfile), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const { data: partnerProfile, mutate: refreshPartnerProfile } = useSWR(
    'partnerProfile',
    () => fetcher(getMyPartnerProfile),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  useEffect(() => {
    if (partnerProfile) {
      setFormData(partnerProfile as PartnerProfileData)
    }
  }, [partnerProfile])

  useEffect(() => {
    if (profile !== undefined && (!profile || (profile as { role?: string }).role !== 'partner')) {
      router.push('/login')
    }
  }, [profile, router])

  const profileData = (profile as { unique_id?: string; email?: string; role?: string } | null) ?? {}

  const displayName =
    [formData.first_name, formData.last_name].filter(Boolean).join(' ') ||
    profileData.email ||
    'Partner'

  const getAvatarInitials = () => {
    const first = formData.first_name?.trim()
    const last = formData.last_name?.trim()
    if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    if (first) return first.charAt(0).toUpperCase()
    return profileData.email?.charAt(0).toUpperCase() || 'P'
  }

  const handleChange = (field: keyof PartnerProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (section: string) => {
    setSavingSection(section)
    try {
      let dataToSave: Partial<PartnerProfileData> = {}

      if (section === 'personal') {
        dataToSave = {
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
        }
      } else if (section === 'countries') {
        if (!formData.countries?.length) {
          setSavingSection(null)
          return
        }
        dataToSave = {
          countries: formData.countries,
        }
      } else if (section === 'contact') {
        dataToSave = {
          personal_email: formData.personal_email,
          phone_number: formData.phone_number,
          alternate_phone_number: formData.alternate_phone_number,
        }
      } else if (section === 'address') {
        dataToSave = {
          address_line_1: formData.address_line_1,
          address_line_2: formData.address_line_2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        }
      } else if (section === 'identity') {
        dataToSave = {
          aadhar_number: formData.aadhar_number,
          pan_number: formData.pan_number,
        }
      }

      const result = await updatePartnerProfile(dataToSave)
      if (result.error) {
        // Error handling without toast
      } else {
        await refreshPartnerProfile()
        setCollapsedSections((prev) => ({ ...prev, [section]: true }))
      }
    } catch {
      // Error handling without toast
    } finally {
      setSavingSection(null)
    }
  }

  const copyPartnerId = () => {
    if (profileData.unique_id) {
      navigator.clipboard.writeText(profileData.unique_id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push('/login')
    } catch {
      setIsLoggingOut(false)
    }
  }

  const partnerCountries = formData.countries ?? []

  const handleAddCountry = () => {
    if (!selectedCountry) {
      return
    }
    if (partnerCountries.includes(selectedCountry)) {
      return
    }
    setFormData((prev) => ({
      ...prev,
      countries: [...(prev.countries ?? []), selectedCountry],
    }))
    setSelectedCountry('')
  }

  const handleRemoveCountry = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      countries: (prev.countries ?? []).filter((item) => item !== country),
    }))
  }

  const isFirstLoad = profile === undefined && partnerProfile === undefined

  const SaveButton = ({ section }: { section: string }) => (
    <div className="flex justify-center mt-6">
      <button
        type="button"
        onClick={() => handleSave(section)}
        disabled={savingSection === section}
        className="border border-[#8DC63F] text-[#8DC63F] rounded-lg px-16 py-2.5 flex items-center gap-2 hover:bg-[#8DC63F] hover:text-white transition-colors disabled:opacity-50 text-sm font-bold"
      >
        <Save className="w-4 h-4" />
        {savingSection === section ? 'Saving...' : 'Save'}
      </button>
    </div>
  )

  if (isFirstLoad) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9F9F9]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F9F9F9] overflow-hidden">
      <div className="hidden lg:block">
        <PartnerSidebar
          activePage="profile"
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-[#EEEEEE] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1 hidden sm:block">
                Manage your partner account details
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {displayName}
                </p>
                <p className="text-xs text-[#8DC63F] font-medium">
                  {profileData.unique_id || 'N/A'}
                </p>
              </div>
              <Link
                href="/partner/profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-sm sm:text-base hover:opacity-80 transition-opacity"
              >
                {getAvatarInitials()}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#3B82F6] flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-bold text-white">{getAvatarInitials()}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-xl mb-1">{displayName}</h2>
                  <p className="text-gray-500 text-sm mb-3">Partner Profile</p>
                  {partnerCountries.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {partnerCountries.map((country) => (
                        <span
                          key={country}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F5] px-3 py-1 text-xs font-medium text-gray-700"
                        >
                          <span>{getCountryFlag(country)}</span>
                          {country}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {formData.official_email ||
                          formData.personal_email ||
                          profileData.email ||
                          'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{formData.phone_number || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyPartnerId}
                  className="border border-[#3B82F6] text-[#3B82F6] rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  Partner ID - {profileData.unique_id || 'N/A'}
                  {copiedId ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EEEEEE] mb-6 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('personal')}
                className="w-full flex items-center justify-between p-6 hover:bg-green-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900">
                  Section A: <span className="text-[#3B82F6]">Personal Information</span>
                </h2>
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
                      <label className={labelClass}>First Name</label>
                      <input
                        type="text"
                        value={formData.first_name || ''}
                        onChange={(e) => handleChange('first_name', e.target.value)}
                        className={inputClass}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Middle Name</label>
                      <input
                        type="text"
                        value={formData.middle_name || ''}
                        onChange={(e) => handleChange('middle_name', e.target.value)}
                        className={inputClass}
                        placeholder="William"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input
                        type="text"
                        value={formData.last_name || ''}
                        onChange={(e) => handleChange('last_name', e.target.value)}
                        className={inputClass}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Gender</label>
                      <select
                        value={formData.gender || ''}
                        onChange={(e) =>
                          handleChange('gender', e.target.value as 'male' | 'female' | 'other')
                        }
                        className={inputClass}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Date of Birth</label>
                      <input
                        type="date"
                        value={formData.date_of_birth || ''}
                        onChange={(e) => handleChange('date_of_birth', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <SaveButton section="personal" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EEEEEE] mb-6 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('countries')}
                className="w-full flex items-center justify-between p-6 hover:bg-green-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900">
                  Section B: <span className="text-[#3B82F6]">Operating Countries</span>
                  <span className="text-red-500 text-sm font-medium ml-2">*</span>
                </h2>
                {collapsedSections.countries ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  collapsedSections.countries ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
                } overflow-hidden`}
              >
                <div className="px-6 pb-6">
                  <p className="text-sm text-gray-500 mb-4">
                    Select the countries you operate in. At least one country is required.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select Country</option>
                      {PARTNER_COUNTRY_OPTIONS.filter(
                        (country) => !partnerCountries.includes(country)
                      ).map((country) => (
                        <option key={country} value={country}>
                          {getCountryFlag(country)} {country}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddCountry}
                      className="border border-[#8DC63F] text-[#8DC63F] rounded-lg px-6 py-3 text-sm font-semibold hover:bg-[#8DC63F] hover:text-white transition-colors"
                    >
                      Add Country
                    </button>
                  </div>

                  {partnerCountries.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {partnerCountries.map((country) => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => handleRemoveCountry(country)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F5] px-3 py-1.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <span>{getCountryFlag(country)}</span>
                          {country}
                          <span className="text-xs">×</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No countries selected yet.</p>
                  )}

                  <SaveButton section="countries" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EEEEEE] mb-6 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('contact')}
                className="w-full flex items-center justify-between p-6 hover:bg-green-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900">
                  Section C: <span className="text-[#3B82F6]">Contact Information</span>
                </h2>
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
                      <label className={labelClass}>Office Email</label>
                      <input
                        type="email"
                        value={formData.official_email || profileData.email || ''}
                        readOnly
                        className={`${inputClass} opacity-60 cursor-not-allowed`}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Personal Email</label>
                      <input
                        type="email"
                        value={formData.personal_email || ''}
                        onChange={(e) => handleChange('personal_email', e.target.value)}
                        className={inputClass}
                        placeholder="personal@example.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone_number || ''}
                        onChange={(e) => handleChange('phone_number', e.target.value)}
                        className={inputClass}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Alternate Number</label>
                      <input
                        type="tel"
                        value={formData.alternate_phone_number || ''}
                        onChange={(e) => handleChange('alternate_phone_number', e.target.value)}
                        className={inputClass}
                        placeholder="+91 9876543211"
                      />
                    </div>
                  </div>
                  <SaveButton section="contact" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EEEEEE] mb-6 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('address')}
                className="w-full flex items-center justify-between p-6 hover:bg-green-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900">
                  Section D: <span className="text-[#3B82F6]">Address Details</span>
                </h2>
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
                        <label className={labelClass}>State</label>
                        <select
                          value={formData.state || ''}
                          onChange={(e) => handleChange('state', e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select State</option>
                          {indianStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>City</label>
                        <input
                          type="text"
                          value={formData.city || ''}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className={inputClass}
                          placeholder="Mumbai"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Address Line 1</label>
                      <input
                        type="text"
                        value={formData.address_line_1 || ''}
                        onChange={(e) => handleChange('address_line_1', e.target.value)}
                        className={inputClass}
                        placeholder="123, Green Valley Road"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Address Line 2</label>
                      <input
                        type="text"
                        value={formData.address_line_2 || ''}
                        onChange={(e) => handleChange('address_line_2', e.target.value)}
                        className={inputClass}
                        placeholder="Near City Center"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Pincode</label>
                      <input
                        type="text"
                        value={formData.pincode || ''}
                        onChange={(e) => handleChange('pincode', e.target.value)}
                        className={inputClass}
                        placeholder="400001"
                      />
                    </div>
                  </div>
                  <SaveButton section="address" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EEEEEE] mb-6 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('identity')}
                className="w-full flex items-center justify-between p-6 hover:bg-green-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900">
                  Section E: <span className="text-[#3B82F6]">Identity & Documents</span>
                </h2>
                {collapsedSections.identity ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  collapsedSections.identity ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
                } overflow-hidden`}
              >
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Aadhar Number</label>
                      <input
                        type="text"
                        value={formData.aadhar_number || ''}
                        onChange={(e) => handleChange('aadhar_number', e.target.value)}
                        className={inputClass}
                        placeholder="1234 5678 9012"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>PAN Number</label>
                      <input
                        type="text"
                        value={formData.pan_number || ''}
                        onChange={(e) => handleChange('pan_number', e.target.value)}
                        className={inputClass}
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>
                  <SaveButton section="identity" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-base text-gray-900 mb-1">Logout</h3>
                  <p className="text-sm text-gray-500">Sign out of your partner account</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogoutDialog(true)}
                  disabled={isLoggingOut}
                  className="border border-red-500 text-red-500 rounded-lg px-6 py-2.5 flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      <PartnerBottomNavigation />
    </div>
  )
}
