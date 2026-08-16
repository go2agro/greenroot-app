'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PartnerSidebar from '@/components/PartnerSidebar'
import PartnerBottomNavigation from '@/components/PartnerBottomNavigation'
import { getMyPartnerProfile } from '@/lib/partnerProfiles'
import { getMyProfile } from '@/lib/profiles'

interface PartnerShellProps {
  activePage: string
  pageTitle?: string
  pageSubtitle?: string
  unreadRefreshKey?: number
  children: React.ReactNode
}

interface PartnerProfileData {
  first_name?: string
  last_name?: string
}

interface ProfileData {
  unique_id?: string
  role?: string
}

export default function PartnerShell({
  activePage,
  pageTitle,
  pageSubtitle,
  unreadRefreshKey = 0,
  children,
}: PartnerShellProps) {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfileData | null>(null)
  const [myProfile, setMyProfile] = useState<ProfileData | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: profile } = await getMyProfile()

      if (!profile || profile.role !== 'partner') {
        router.replace('/login')
        return
      }

      setMyProfile(profile)

      const { data: partnerData } = await getMyPartnerProfile()
      setPartnerProfile(partnerData)
    }

    loadProfile()
  }, [router])

  const partnerName =
    [partnerProfile?.first_name, partnerProfile?.last_name].filter(Boolean).join(' ') ||
    'Partner'

  const getAvatarInitials = () => {
    const first = partnerProfile?.first_name?.trim()
    const last = partnerProfile?.last_name?.trim()
    if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    if (first) return first.charAt(0).toUpperCase()
    return 'P'
  }

  return (
    <div className="flex h-screen bg-[#F9F9F9] overflow-hidden">
      <div className="hidden lg:block">
        <PartnerSidebar
          activePage={activePage}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          unreadRefreshKey={unreadRefreshKey}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-[#EEEEEE] px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {pageTitle ? (
              <div className="min-w-0">
                <h1 className="font-bold text-xl sm:text-2xl text-gray-900">{pageTitle}</h1>
                {pageSubtitle && (
                  <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">{pageSubtitle}</p>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-gray-900">{partnerName}</p>
                <p className="text-sm text-[#8DC63F]">{myProfile?.unique_id || 'N/A'}</p>
              </div>
              <Link
                href="/partner/profile"
                className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition-opacity"
              >
                {getAvatarInitials()}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-16 lg:pb-0">{children}</div>
      </div>

      <PartnerBottomNavigation />
    </div>
  )
}
