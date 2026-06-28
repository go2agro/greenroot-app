"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowRight, ChevronLeft, ChevronRight, Send, Search } from 'lucide-react'
import StudentSidebar from '@/components/StudentSidebar'
import BottomNavigation from '@/components/BottomNavigation'
import ApplicationCard from '@/components/ApplicationCard'
import InternshipCard from '@/components/InternshipCard'
import { getMyProfile } from '@/lib/profiles'
import { getMyStudentProfile, checkProfileCompletion } from '@/lib/studentProfiles'
import { getApplicationCounts, getActiveApplications, getDraftApplications } from '@/lib/studentApplications'
import { getRecentInternships } from '@/lib/internships'
import recentInternshipsData from '@/config/recentInternships.json'

interface ProfileData {
  first_name: string
  last_name: string
  email: string
}

interface ApplicationCounts {
  submitted: number
  approved: number
  pending: number
}

interface Application {
  id: string
  status: string
  internships: {
    title: string
    subtitle?: string
    city?: string
    country?: string
    image_url?: string
    badge?: string
  }
}

interface Internship {
  id: string
  title: string
  city?: string
  country?: string
  image_url?: string
  badge?: string
  flag?: string
}

// SWR fetcher functions
const fetcher = (fn: () => Promise<any>) => fn().then(res => res.data)

export default function StudentDashboard() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Use SWR for data fetching with smart caching (NO auto-refresh)
  // Data only refreshes on:
  // 1. First mount
  // 2. Manual mutation after user actions
  // 3. Tab focus (for some data types)
  
  const { data: profile } = useSWR('myProfile', () => fetcher(getMyProfile), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour
  })

  const { data: studentProfile } = useSWR('studentProfile', () => fetcher(getMyStudentProfile), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour - manually invalidate after profile updates
  })

  const { data: profileCompletionData } = useSWR('profileCompletion', () => fetcher(checkProfileCompletion), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour - manually invalidate after profile updates
  })

  const { data: applicationCounts } = useSWR('applicationCounts', () => fetcher(getApplicationCounts), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour - manually invalidate after application actions
  })

  const { data: activeApplications } = useSWR('activeApplications', () => fetcher(getActiveApplications), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour - manually invalidate after application actions
  })

  const { data: draftApplications } = useSWR('draftApplications', () => fetcher(getDraftApplications), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour - manually invalidate after draft actions
  })

  const { data: recentInternships } = useSWR('recentInternships', () => fetcher(() => getRecentInternships(6)), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 86400000, // 24 hours - internships rarely change
  })

  // Check auth and redirect if needed
  useEffect(() => {
    if (profile !== undefined && (!profile || profile.role !== 'student')) {
      router.push('/login')
    }
  }, [profile, router])

  // Calculate profile completion
  const profileCompletion = profileCompletionData 
    ? Math.round(((16 - profileCompletionData.missingFields.length) / 16) * 100)
    : 0

  // Show loading only on first visit (when nothing is cached)
  const isFirstLoad = !profile && !studentProfile && !applicationCounts

  if (isFirstLoad) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If data is still loading but we have cached data, show the cached data
  const profileData = studentProfile || null
  const counts = applicationCounts || { submitted: 0, approved: 0, pending: 0 }
  const activeApps = activeApplications || []
  const drafts = draftApplications || []
  
  // Use real data if available, otherwise use dummy data from config file
  const internships = recentInternships?.length > 0 ? recentInternships : (recentInternshipsData as Internship[])

  // Get display name - show email if first name is empty
  const displayName = profileData?.first_name || profileData?.email || profile?.email || 'Student'
  
  // Get avatar initial - MUST be from email if name is not present
  const avatarInitial = profileData?.first_name 
    ? profileData.first_name.charAt(0).toUpperCase()
    : (profileData?.email?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'S')

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop only */}
      <div className="hidden lg:block">
        <StudentSidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  Welcome back, {displayName}!
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
                  Your journey to internships start here, let's get you placed!
                </p>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Profile Strength - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-lg px-3 lg:px-4 py-2">
                <div className="relative w-10 h-10 lg:w-12 lg:h-12">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="18"
                      stroke="#E5E7EB"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="18"
                      stroke="#8DC63F"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - profileCompletion / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">
                    {profileCompletion}%
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Profile Strength</p>
                  <Link 
                    href="/student/profile"
                    className="text-xs text-[#8DC63F] font-semibold hover:underline flex items-center gap-1"
                  >
                    Complete Profile
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* User Avatar */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                    {profileData?.first_name} {profileData?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#8DC63F] flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {avatarInitial}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Application Stats */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">My Applications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Submitted */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Submitted</p>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Send className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {counts.submitted.toString().padStart(2, '0')}
                </p>
              </div>

              {/* Approved */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Approved</p>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {counts.approved.toString().padStart(2, '0')}
                </p>
              </div>

              {/* Pending */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Pending</p>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {counts.pending.toString().padStart(2, '0')}
                </p>
                {counts.pending > 0 && (
                  <p className="text-xs text-red-500 mt-1">Action required for {counts.pending}</p>
                )}
              </div>
            </div>
          </div>

          {/* Active Applications & Saved Drafts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
            {/* Active Applications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Active Applications</h2>
                <Link 
                  href="/student/applications"
                  className="text-sm text-[#8DC63F] font-semibold hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {activeApps.length > 0 ? (
                  activeApps.slice(0, 2).map((app: Application) => (
                    <ApplicationCard
                      key={app.id}
                      id={app.id}
                      title={app.internships.title}
                      location={`${app.internships.city || ''}, ${app.internships.country || ''}`}
                      imageUrl={app.internships.image_url || ''}
                      status={app.status}
                      onClick={() => {}}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <p className="text-gray-500">No active applications yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Drafts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Saved drafts</h2>
                <Link 
                  href="/student/applications"
                  className="text-sm text-[#8DC63F] font-semibold hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {drafts.length > 0 ? (
                  drafts.slice(0, 2).map((app: Application) => (
                    <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={app.internships.image_url || '/images/placeholder.jpg'}
                            alt={app.internships.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/images/placeholder.jpg'
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {app.internships.title}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {app.internships.city || ''}, {app.internships.country || ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="flex-1 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors opacity-50 cursor-not-allowed"
                          disabled
                        >
                          Discard
                        </button>
                        <button 
                          onClick={() => router.push(`/student/applications/${app.id}`)}
                          className="flex-1 px-4 py-2 text-sm text-white bg-[#8DC63F] rounded-lg hover:bg-[#7DB62F] transition-colors font-semibold"
                        >
                          Resume
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <p className="text-gray-500">No saved drafts</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recently Added Internships */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Recently added Internships</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {internships.slice(0, 4).map((internship: Internship) => (
                <InternshipCard
                  key={internship.id}
                  id={internship.id}
                  title={internship.title}
                  location={`${internship.city || ''}${internship.city && internship.country ? ', ' : ''}${internship.country || ''}`}
                  imageUrl={internship.image_url || ''}
                  badge={internship.badge}
                  flag={internship.flag}
                />
              ))}
            </div>
          </div>

          {/* Browse Internships CTA */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#8DC63F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Browse Internships,<br />
                <span className="text-[#8DC63F]">Grow Your Future</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Explore global agricultural internships<br className="hidden sm:block" />
                and gain real-world experience.
              </p>
              <Link
                href="/student/internships"
                className="inline-flex items-center gap-2 bg-[#8DC63F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#7DB62F] transition-colors text-sm sm:text-base"
              >
                Browse Internships
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Illustration */}
            <div className="absolute right-0 sm:right-8 bottom-0 w-60 h-60 sm:w-80 sm:h-80 opacity-30 sm:opacity-50">
              <div className="relative w-full h-full">
                <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-[#8DC63F]/20 to-blue-400/20 rounded-full blur-3xl" />
                <Search className="absolute bottom-8 sm:bottom-12 right-8 sm:right-12 w-16 h-16 sm:w-24 sm:h-24 text-[#8DC63F]/30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile/Tablet only */}
      <BottomNavigation />
    </div>
  )
}
