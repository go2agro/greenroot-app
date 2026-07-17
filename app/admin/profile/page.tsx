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
} from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '@/components/AdminSidebar'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { getMyProfile } from '@/lib/profiles'
import { getMyAdminProfile } from '@/lib/adminProfiles'
import { signOut } from '@/lib/auth'

interface AdminProfileData {
  first_name?: string
  middle_name?: string
  last_name?: string
  personal_email?: string
  official_email?: string
  phone_number?: string
}

const fetcher = (fn: () => Promise<{ data: unknown }>) => fn().then((res) => res.data)

const PLACEHOLDER_SECTIONS = [
  { id: 'personal', title: 'Personal Information' },
  { id: 'contact', title: 'Contact Information' },
  { id: 'address', title: 'Address Details' },
  { id: 'identity', title: 'Identity & Documents' },
] as const

export default function AdminProfilePage() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    personal: false,
    contact: true,
    address: true,
    identity: true,
  })

  const { data: profile } = useSWR('adminMyProfile', () => fetcher(getMyProfile), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const { data: adminProfile } = useSWR('adminProfile', () => fetcher(getMyAdminProfile), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  useEffect(() => {
    if (profile !== undefined && (!profile || (profile as { role?: string }).role !== 'admin')) {
      router.push('/login')
    }
  }, [profile, router])

  const adminData = (adminProfile as AdminProfileData | null) ?? {}
  const profileData = (profile as { unique_id?: string; email?: string; role?: string } | null) ?? {}

  const displayName =
    [adminData.first_name, adminData.last_name].filter(Boolean).join(' ') ||
    profileData.email ||
    'Admin'

  const getAvatarInitials = () => {
    const first = adminData.first_name?.trim()
    const last = adminData.last_name?.trim()
    if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    if (first) return first.charAt(0).toUpperCase()
    return profileData.email?.charAt(0).toUpperCase() || 'A'
  }

  const copyAdminId = () => {
    if (profileData.unique_id) {
      navigator.clipboard.writeText(profileData.unique_id)
      setCopiedId(true)
      toast.success('Admin ID copied to clipboard')
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
      toast.error('Failed to logout')
      setIsLoggingOut(false)
    }
  }

  const isFirstLoad = profile === undefined && adminProfile === undefined

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
        <AdminSidebar
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
                Manage your admin account details
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
                href="/admin/profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#8DC63F] flex items-center justify-center text-white font-bold text-sm sm:text-base hover:opacity-80 transition-opacity"
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
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#8DC63F] flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-bold text-white">{getAvatarInitials()}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-xl mb-1">{displayName}</h2>
                  <p className="text-gray-500 text-sm mb-3">Admin Profile</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {adminData.official_email ||
                          adminData.personal_email ||
                          profileData.email ||
                          'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{adminData.phone_number || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyAdminId}
                  className="border border-[#3B82F6] text-[#3B82F6] rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  Admin ID - {profileData.unique_id || 'N/A'}
                  {copiedId ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {PLACEHOLDER_SECTIONS.map((section, index) => (
              <div
                key={section.id}
                className="bg-white rounded-2xl border border-[#EEEEEE] mb-6 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-green-50 transition-colors"
                >
                  <h2 className="text-lg font-bold text-gray-900">
                    Section {String.fromCharCode(65 + index)}:{' '}
                    <span className="text-[#3B82F6]">{section.title}</span>
                  </h2>
                  {collapsedSections[section.id] ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    collapsedSections[section.id]
                      ? 'max-h-0 opacity-0'
                      : 'max-h-[400px] opacity-100'
                  } overflow-hidden`}
                >
                  <div className="px-6 pb-6">
                    <div className="rounded-xl border border-dashed border-[#EEEEEE] bg-[#F9F9F9] p-6 text-center">
                      <p className="text-sm font-medium text-gray-700">
                        {section.title} fields coming soon
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        This section will be configured with admin-specific profile fields.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-base text-gray-900 mb-1">Logout</h3>
                  <p className="text-sm text-gray-500">Sign out of your admin account</p>
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
    </div>
  )
}
