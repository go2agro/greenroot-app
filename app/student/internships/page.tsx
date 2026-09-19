"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InternshipListCard from '@/components/InternshipListCard'
import useSWR from 'swr'
import StudentSidebar from '@/components/StudentSidebar'
import StudentMobileLogo from '@/components/StudentMobileLogo'
import BottomNavigation from '@/components/BottomNavigation'
import UserAvatar from '@/components/UserAvatar'
import { Search, ChevronLeft, ChevronRight, X, RefreshCw } from 'lucide-react'
import { getAllInternships } from '@/lib/internships'
import { getMyStudentProfile } from '@/lib/studentProfiles'
import { getMyProfile } from '@/lib/profiles'
import { pageCopyConfig } from '@/lib/config'
import {
  BTN_VIEW_DETAILS,
  INTERNSHIPS_ITEMS_PER_PAGE,
  LABEL_LOADING,
} from '@/lib/appConfig'
import { MotionStagger, MotionStaggerItem } from '@/components/motion/MotionStagger'

const internshipsCopy = pageCopyConfig.student.internships

type Internship = {
  id: string
  badge: string
  title: string
  subtitle?: string
  city?: string
  country?: string
  short_description?: string
  long_description?: string
  duration_months: number
  stipend_monthly: number
  stipend_yearly?: number
  image_url?: string
  flag_emoji?: string
  created_at: string
}

type SortOption = (typeof internshipsCopy.sortOptions)[number]['value']

const fetcher = (fn: () => Promise<any>) => fn().then(res => res.data)

export default function StudentInternships() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: internships, mutate: refreshInternships } = useSWR(
    'allInternships',
    () => fetcher(getAllInternships),
    {
      dedupingInterval: 300000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const { data: profile } = useSWR(
    'studentProfile',
    () => fetcher(getMyStudentProfile),
    {
      dedupingInterval: 300000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const { data: myProfile } = useSWR(
    'myProfile',
    () => fetcher(getMyProfile),
    {
      dedupingInterval: 300000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshInternships()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  useEffect(() => {
    if (!internships) {
      setFilteredInternships([])
      return
    }

    let result = [...internships]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(internship => 
        internship.title?.toLowerCase().includes(query) ||
        internship.country?.toLowerCase().includes(query) ||
        internship.city?.toLowerCase().includes(query)
      )
    }

    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'stipend_high':
        result.sort((a, b) => (b.stipend_monthly || 0) - (a.stipend_monthly || 0))
        break
      case 'stipend_low':
        result.sort((a, b) => (a.stipend_monthly || 0) - (b.stipend_monthly || 0))
        break
      case 'duration_short':
        result.sort((a, b) => (a.duration_months || 0) - (b.duration_months || 0))
        break
      case 'duration_long':
        result.sort((a, b) => (b.duration_months || 0) - (a.duration_months || 0))
        break
    }

    setFilteredInternships(result)
    setCurrentPage(1)
  }, [searchQuery, sortBy, internships])

  const totalPages = Math.ceil(filteredInternships.length / INTERNSHIPS_ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * INTERNSHIPS_ITEMS_PER_PAGE
  const paginatedInternships = filteredInternships.slice(startIndex, startIndex + INTERNSHIPS_ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const renderPaginationNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Student'
  const isLoading = !internships

  return (
    <div className="flex h-screen bg-gr-background">
      <div className="hidden lg:block">
        <StudentSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gr-border px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <StudentMobileLogo />
            <div className="flex items-center gap-3 ml-auto">
              <div className="text-right">
                <div className="font-bold text-gray-900">{userName}</div>
                <div className="text-xs text-gr-secondary font-medium">ID: {myProfile?.unique_id || 'N/A'}</div>
              </div>
              <Link href="/student/profile" className="cursor-pointer hover:opacity-80 transition-opacity">
                <UserAvatar
                  imageUrl={profile?.profile_image_url || profile?.avatar_url}
                  firstName={profile?.first_name}
                  lastName={profile?.last_name}
                  fallbackLetter="S"
                  size={40}
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={internshipsCopy.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gr-border rounded-xl py-3 px-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-gr-primary focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h1 className="font-bold text-xl text-gray-900">{internshipsCopy.heading}</h1>
                <p className="text-sm text-gray-500">
                  {internshipsCopy.resultsCount.replace('{count}', String(filteredInternships.length))}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg border border-gr-border hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Refresh internships"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{internshipsCopy.sortLabel}</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="border border-gr-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gr-primary focus:border-transparent"
                  >
                    {internshipsCopy.sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-gray-500">{LABEL_LOADING}</div>
            ) : paginatedInternships.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="font-semibold">{internshipsCopy.emptyHeading}</p>
                <p className="text-sm mt-1">{internshipsCopy.emptyBody}</p>
              </div>
            ) : (
              <>
                <MotionStagger className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedInternships.map((internship) => (
                    <MotionStaggerItem key={internship.id} className="flex h-full">
                      <InternshipListCard
                        className="w-full"
                        internship={internship}
                        ctaLabel={BTN_VIEW_DETAILS}
                        onCardClick={() => router.push(`/student/internships/${internship.id}`)}
                        onCtaClick={(e) => {
                          e.stopPropagation()
                          router.push(`/student/internships/${internship.id}`)
                        }}
                      />
                    </MotionStaggerItem>
                  ))}
                </MotionStagger>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border border-gr-border rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {renderPaginationNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page as number)}
                          className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-gr-primary text-white'
                              : 'border border-gr-border hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border border-gr-border rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}
