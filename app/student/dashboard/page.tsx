"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowRight, ChevronLeft, ChevronRight, Send, Search, RefreshCw, CheckCircle, FileText } from 'lucide-react'
import StudentSidebar from '@/components/StudentSidebar'
import StudentMobileLogo from '@/components/StudentMobileLogo'
import BottomNavigation from '@/components/BottomNavigation'
import InternshipCard from '@/components/InternshipCard'
import { getMyProfile } from '@/lib/profiles'
import { getMyStudentProfile, checkProfileCompletion } from '@/lib/studentProfiles'
import { getApplicationCounts, getActiveApplications, getDraftApplications } from '@/lib/studentApplications'
import { BTN_BROWSE_INTERNSHIPS, DEFAULT_INTERNSHIP_IMAGE } from '@/lib/appConfig'
import { pageCopyConfig } from '@/lib/config'
import { getRecentInternships } from '@/lib/internships'
import { getApplicationStatusTimestamp } from '@/lib/utils'

interface ProfileData {
  first_name: string
  last_name: string
  email: string
}

interface ApplicationCounts {
  drafts: number
  submitted: number
  approved: number
  active: number
}

interface Application {
  id: string
  status: string
  started_at?: string
  submitted_at?: string
  decided_at?: string
  accepted_at?: string
  updated_at?: string
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

const dashboardCopy = pageCopyConfig.student.dashboard

const fetcher = (fn: () => Promise<any>) => fn().then(res => res.data)

export default function StudentDashboard() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isRefreshingInternships, setIsRefreshingInternships] = useState(false)
  const [isRefreshingApplications, setIsRefreshingApplications] = useState(false)

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

  const { data: applicationCounts, mutate: refreshApplicationCounts } = useSWR('applicationCounts', () => fetcher(getApplicationCounts), {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
  })

  const { data: activeApplications, mutate: refreshActiveApplications } = useSWR('activeApplications', () => fetcher(getActiveApplications), {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
  })

  const { data: draftApplications, mutate: refreshDraftApplications } = useSWR('draftApplications', () => fetcher(getDraftApplications), {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
  })

  const { data: recentInternships, mutate: refreshInternships } = useSWR('recentInternships', () => fetcher(() => getRecentInternships(6)), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000, // 5 minutes
  })

  // Check auth and redirect if needed
  useEffect(() => {
    if (profile !== undefined && (!profile || profile.role !== 'student')) {
      router.push('/login')
    }
  }, [profile, router])

  // Profile completion — shared with profile page via checkProfileCompletion
  const profileCompletion = profileCompletionData?.completionPercentage ?? 0

  // Show loading only on first visit (when nothing is cached)
  const isFirstLoad = !profile && !studentProfile && !applicationCounts

  if (isFirstLoad) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gr-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If data is still loading but we have cached data, show the cached data
  const profileData = studentProfile || null
  const counts = applicationCounts || { drafts: 0, submitted: 0, approved: 0, active: 0 }
  const activeApps = activeApplications || []
  const drafts = draftApplications || []
  const activeCount = counts.active ?? (counts.submitted + counts.approved)
  
  // Use real data only - no fallback dummy data
  const internships = recentInternships || []

  // Get display name - show email if first name is empty
  const displayName = profileData?.first_name || profileData?.email || profile?.email || 'Student'
  
  // Get avatar initials - show first and last name initials if both available
  const getAvatarInitials = () => {
    if (profileData?.profile_photo_url) return null // If profile pic exists, return null
    
    const firstName = profileData?.first_name?.trim()
    const lastName = profileData?.last_name?.trim()
    
    if (firstName && lastName) {
      return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase()
    } else {
      return (profileData?.email?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'S')
    }
  }
  
  const avatarInitials = getAvatarInitials()
  
  // Get student ID from profiles table (unique user ID)
  const studentId = profile?.unique_id || null

  const handleRefreshApplications = async () => {
    setIsRefreshingApplications(true)
    await Promise.all([
      refreshApplicationCounts(),
      refreshActiveApplications(),
      refreshDraftApplications(),
    ])
    setTimeout(() => setIsRefreshingApplications(false), 500)
  }

  const handleRefreshInternships = async () => {
    setIsRefreshingInternships(true)
    await refreshInternships()
    setTimeout(() => setIsRefreshingInternships(false), 500)
  }

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
              <StudentMobileLogo />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {dashboardCopy.welcomePrefix} {displayName}{dashboardCopy.welcomeSuffix}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
                  {dashboardCopy.subheading}
                </p>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-2 sm:gap-4 ml-auto flex-shrink-0">
              {/* Profile Strength - Hidden on mobile */}
              {profileCompletion < 100 && (
              <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-lg px-3 lg:px-4 py-2">
                <div className="relative w-10 h-10 lg:w-12 lg:h-12">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="18"
                      stroke="var(--gr-border)"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="18"
                      stroke="var(--gr-primary)"
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
                    className="text-xs text-gr-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    Complete Profile
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              )}

              {/* User Avatar */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {profileData?.first_name} {profileData?.last_name}
                  </p>
                  <p className="text-xs text-gr-secondary font-medium">ID: {studentId || 'N/A'}</p>
                </div>
                <Link
                  href="/student/profile"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gr-primary flex items-center justify-center text-white font-bold text-sm sm:text-base cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {avatarInitials}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Application Stats */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">My Applications</h2>
              <button
                onClick={handleRefreshApplications}
                disabled={isRefreshingApplications}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Refresh applications"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshingApplications ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Drafts */}
              <div className="bg-white border border-gr-border rounded-2xl p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 font-medium">{dashboardCopy.cardApplications}</div>
                    <div className="text-4xl font-bold text-gr-secondary mt-2">
                      {counts.drafts.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <FileText className="w-6 h-6 text-gr-primary" />
                </div>
              </div>

              {/* Submitted */}
              <div className="bg-white border border-gr-border rounded-2xl p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 font-medium">{dashboardCopy.cardPending}</div>
                    <div className="text-4xl font-bold text-gr-secondary mt-2">
                      {counts.submitted.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <Send className="w-6 h-6 text-gr-primary" />
                </div>
              </div>

              {/* Approved */}
              <div className="bg-white border border-gr-border rounded-2xl p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 font-medium">{dashboardCopy.cardApproved}</div>
                    <div className="text-4xl font-bold text-gr-secondary mt-2">
                      {counts.approved.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-gr-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Applications & Saved Drafts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
            {/* Active Applications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{dashboardCopy.recentApplications}</h2>
                  <span className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-full bg-gr-primary/10 text-gr-primary text-sm font-bold">
                    {activeCount.toString().padStart(2, '0')}
                  </span>
                </div>
                <Link 
                  href="/student/applications"
                  className="text-sm text-gr-primary font-semibold hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {activeApps.length > 0 ? (
                  activeApps.slice(0, 3).map((app: Application) => (
                    <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={app.internships?.image_url || DEFAULT_INTERNSHIP_IMAGE}
                            alt={app.internships?.title || 'Internship'}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = DEFAULT_INTERNSHIP_IMAGE
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {app.internships?.title || 'Internship'}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {app.internships?.city || ''}{app.internships?.city && app.internships?.country ? ', ' : ''}{app.internships?.country || ''}
                            </p>
                            <span className="inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                              {getApplicationStatusTimestamp(app)}
                            </span>
                          </div>
                          <button
                            onClick={() => router.push(`/student/applications/${app.id}`)}
                            className="min-w-[6.5rem] px-4 py-2 text-sm text-white bg-gr-primary rounded-lg hover:bg-gr-primary-hover transition-colors font-semibold whitespace-nowrap flex-shrink-0 text-center"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <p className="text-gray-500">{dashboardCopy.emptyApplications}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Drafts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Saved drafts</h2>
                  <span className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-full bg-gr-secondary/10 text-gr-secondary text-sm font-bold">
                    {counts.drafts.toString().padStart(2, '0')}
                  </span>
                </div>
                <Link 
                  href="/student/applications"
                  className="text-sm text-gr-primary font-semibold hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {drafts.length > 0 ? (
                  drafts.slice(0, 3).map((app: Application) => (
                    <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={app.internships.image_url || DEFAULT_INTERNSHIP_IMAGE}
                            alt={app.internships.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = DEFAULT_INTERNSHIP_IMAGE
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {app.internships.title}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {app.internships.city || ''}, {app.internships.country || ''}
                            </p>
                            <span className="inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                              {getApplicationStatusTimestamp(app)}
                            </span>
                          </div>
                          <button 
                            onClick={() => router.push(`/student/applications/${app.id}`)}
                            className="min-w-[6.5rem] px-4 py-2 text-sm text-white bg-gr-primary rounded-lg hover:bg-gr-primary-hover transition-colors font-semibold whitespace-nowrap flex-shrink-0 text-center"
                          >
                            Resume
                          </button>
                        </div>
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

          {/* Recently Added Internships - Only show when data exists */}
          {internships.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recently added Internships</h2>
                <button
                  onClick={handleRefreshInternships}
                  disabled={isRefreshingInternships}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Refresh internships"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshingInternships ? 'animate-spin' : ''}`} />
                </button>
              </div>
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
          )}

          {/* Browse Internships CTA */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gr-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {dashboardCopy.browseSection}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {dashboardCopy.browseCta}
              </p>
              <Link
                href="/student/internships"
                className="inline-flex items-center gap-2 bg-gr-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-gr-primary-hover transition-colors text-sm sm:text-base"
              >
                {BTN_BROWSE_INTERNSHIPS}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Illustration */}
            <div className="absolute right-0 sm:right-8 bottom-0 w-60 h-60 sm:w-80 sm:h-80 opacity-30 sm:opacity-50">
              <div className="relative w-full h-full">
                <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-gr-primary/20 to-blue-400/20 rounded-full blur-3xl" />
                <Search className="absolute bottom-8 sm:bottom-12 right-8 sm:right-12 w-16 h-16 sm:w-24 sm:h-24 text-gr-primary/30" />
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
