"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Send,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import PartnerSidebar from '@/components/PartnerSidebar'
import { getMyAssignedApplications } from '@/lib/partnerApplications'
import { getMyPartnerProfile } from '@/lib/partnerProfiles'
import { getMyProfile } from '@/lib/profiles'
import { getCountryFlag as getCountryFlagEmoji } from '@/lib/countries'
import {
  formatApplicationReferenceId,
  getApplicationStatusTimestamp,
} from '@/lib/utils'

const ITEMS_PER_PAGE = 5

const TABLE_GRID_CLASS =
  'md:grid md:grid-cols-[130px_minmax(0,1fr)_minmax(0,1.4fr)_100px_110px_40px] md:gap-4 md:items-center md:px-6 md:py-4'

type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'accepted'
  | 'closed'

type Application = {
  id: string
  status: ApplicationStatus
  started_at?: string
  submitted_at?: string
  updated_at?: string
  decided_at?: string
  accepted_at?: string
  internships?: {
    title?: string
    country?: string
    flag_emoji?: string
  } | null
  student_profiles?: {
    first_name?: string
    last_name?: string
    email?: string
    profiles?: { unique_id?: string } | { unique_id?: string }[] | null
  } | null
}

type PartnerProfile = {
  first_name?: string
  last_name?: string
}

type Profile = {
  unique_id?: string
}

type FilterState = {
  statuses: ApplicationStatus[]
  countries: string[]
  internships: string[]
}

const EMPTY_FILTERS: FilterState = {
  statuses: [],
  countries: [],
  internships: [],
}

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'closed', label: 'Closed' },
]

const KPI_CARD_CLASS =
  'bg-white border border-[#EEEEEE] rounded-2xl p-5 transition-colors hover:border-[#8DC63F]'

const fetcher = async (fn: () => Promise<{ data: unknown; error: unknown }>) => {
  const res = await fn()
  if (res.error) {
    throw new Error(
      typeof res.error === 'object' && res.error && 'message' in res.error
        ? String((res.error as { message: string }).message)
        : 'Failed to load applications'
    )
  }
  return (res.data as Application[]) ?? []
}

function formatStatusText(status: ApplicationStatus) {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusBadgeClass(status: ApplicationStatus) {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-600'
    case 'submitted':
      return 'bg-blue-100 text-blue-600'
    case 'under_review':
      return 'bg-amber-100 text-amber-600'
    case 'approved':
      return 'bg-green-100 text-green-600'
    case 'rejected':
      return 'bg-red-100 text-red-600'
    case 'accepted':
      return 'bg-purple-100 text-purple-600'
    case 'closed':
      return 'bg-gray-100 text-gray-500'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function getStudentName(application: Application) {
  const firstName = application.student_profiles?.first_name
  const lastName = application.student_profiles?.last_name
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown student'
}

function getCountryFlag(country?: string, emoji?: string) {
  return getCountryFlagEmoji(country, emoji)
}

function toggleArrayItem<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((value) => value !== item) : [...items, item]
}

function KpiCardSkeleton() {
  return (
    <>
      <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-lg mb-3" />
      <div className="h-4 w-24 animate-pulse bg-gray-200 rounded mb-2" />
      <div className="h-9 w-16 animate-pulse bg-gray-200 rounded" />
    </>
  )
}

function FilterCategory({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-[#EEEEEE] rounded-xl overflow-hidden">
      <div className="px-3 py-2.5 bg-[#F9F9F9] border-b border-[#EEEEEE]">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

function FilterCheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-[#8DC63F] focus:ring-[#8DC63F]"
      />
      <span className="line-clamp-2">{label}</span>
    </label>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#EEEEEE] rounded-2xl p-4 animate-pulse flex items-center gap-4"
        >
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
            <div className="h-6 bg-gray-200 rounded-full w-24" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

export default function PartnerApplications() {
  const router = useRouter()
  const filterPanelRef = useRef<HTMLDivElement>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [pendingFilters, setPendingFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: applications, isLoading, error: loadError } = useSWR(
    'partnerAssignedApplications',
    () => fetcher(getMyAssignedApplications),
    {
      dedupingInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const { data: partnerProfile } = useSWR('partnerProfileHeader', () => fetcher(getMyPartnerProfile), {
    dedupingInterval: 300000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const { data: myProfile } = useSWR('partnerMyProfileHeader', () => fetcher(getMyProfile), {
    dedupingInterval: 300000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const applicationList = useMemo(
    () => (applications as Application[] | undefined) ?? [],
    [applications]
  )

  const uniqueCountries = useMemo(() => {
    const fromApplications = applicationList
      .map((app) => app.internships?.country?.trim())
      .filter(Boolean) as string[]
    return [...new Set(fromApplications)].sort()
  }, [applicationList])

  const uniqueInternships = useMemo(() => {
    const fromApplications = applicationList
      .map((app) => app.internships?.title?.trim())
      .filter(Boolean) as string[]
    return [...new Set(fromApplications)].sort()
  }, [applicationList])

  const stats = useMemo(() => {
    const total = applicationList.length
    const pending = applicationList.filter(
      (app) => app.status === 'submitted' || app.status === 'under_review'
    ).length
    const approved = applicationList.filter(
      (app) => app.status === 'approved' || app.status === 'accepted'
    ).length
    const rejected = applicationList.filter((app) => app.status === 'rejected').length
    return { total, pending, approved, rejected }
  }, [applicationList])

  const filteredApplications = useMemo(() => {
    let result = [...applicationList]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((app) => {
        const firstName = app.student_profiles?.first_name?.toLowerCase() ?? ''
        const lastName = app.student_profiles?.last_name?.toLowerCase() ?? ''
        const email = app.student_profiles?.email?.toLowerCase() ?? ''
        const title = app.internships?.title?.toLowerCase() ?? ''
        const refId = formatApplicationReferenceId(app.id, app.submitted_at).toLowerCase()
        return (
          firstName.includes(query) ||
          lastName.includes(query) ||
          email.includes(query) ||
          title.includes(query) ||
          refId.includes(query)
        )
      })
    }

    if (appliedFilters.statuses.length > 0) {
      result = result.filter((app) => appliedFilters.statuses.includes(app.status))
    }

    if (appliedFilters.countries.length > 0) {
      result = result.filter(
        (app) => app.internships?.country && appliedFilters.countries.includes(app.internships.country)
      )
    }

    if (appliedFilters.internships.length > 0) {
      result = result.filter(
        (app) => app.internships?.title && appliedFilters.internships.includes(app.internships.title)
      )
    }

    return result
  }, [applicationList, searchQuery, appliedFilters])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, appliedFilters])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node)
      ) {
        setShowFilterPanel(false)
      }
    }

    if (showFilterPanel) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showFilterPanel])

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedApplications = filteredApplications.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  const activeFilterCount =
    appliedFilters.statuses.length +
    appliedFilters.countries.length +
    appliedFilters.internships.length

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters)
    setShowFilterPanel(false)
  }

  const handleClearFilters = () => {
    setPendingFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setShowFilterPanel(false)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const renderPaginationNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (currentPage <= 3) {
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

    return pages
  }

  const profile = partnerProfile as PartnerProfile | null
  const profileMeta = myProfile as Profile | null

  const partnerName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Partner'

  const getAvatarInitials = () => {
    const first = profile?.first_name?.trim()
    const last = profile?.last_name?.trim()
    if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    if (first) return first.charAt(0).toUpperCase()
    return 'P'
  }

  return (
    <div className="flex h-screen bg-[#F9F9F9] overflow-hidden">
      <div className="hidden lg:block">
        <PartnerSidebar
          activePage="applications"
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-[#EEEEEE] px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-bold text-xl sm:text-2xl text-gray-900">Applications</h1>
              <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">
                View applications assigned to you
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-gray-900">{partnerName}</p>
                <p className="text-sm text-[#8DC63F]">{profileMeta?.unique_id || 'N/A'}</p>
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

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={KPI_CARD_CLASS}>
                {isLoading ? (
                  <KpiCardSkeleton />
                ) : (
                  <>
                    <FileText className="w-8 h-8 text-[#8DC63F] mb-3" />
                    <p className="text-sm text-gray-500">Total Applications</p>
                    <p className="text-3xl font-bold text-[#3B82F6] mt-1">
                      {stats.total.toLocaleString()}
                    </p>
                  </>
                )}
              </div>

              <div className={KPI_CARD_CLASS}>
                {isLoading ? (
                  <KpiCardSkeleton />
                ) : (
                  <>
                    <Send className="w-8 h-8 text-[#8DC63F] mb-3" />
                    <p className="text-sm text-gray-500">Pending Review</p>
                    <p className="text-3xl font-bold text-[#3B82F6] mt-1">
                      {stats.pending.toLocaleString()}
                    </p>
                  </>
                )}
              </div>

              <div className={KPI_CARD_CLASS}>
                {isLoading ? (
                  <KpiCardSkeleton />
                ) : (
                  <>
                    <CheckCircle className="w-8 h-8 text-[#8DC63F] mb-3" />
                    <p className="text-sm text-gray-500">Approved</p>
                    <p className="text-3xl font-bold text-[#3B82F6] mt-1">
                      {stats.approved.toLocaleString()}
                    </p>
                  </>
                )}
              </div>

              <div className={KPI_CARD_CLASS}>
                {isLoading ? (
                  <KpiCardSkeleton />
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-[#8DC63F] mb-3" />
                    <p className="text-sm text-gray-500">Rejected</p>
                    <p className="text-3xl font-bold text-[#3B82F6] mt-1">
                      {stats.rejected.toLocaleString()}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Search + filter */}
            <div className="flex gap-3 items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by application ID, student name, email or internship..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#EEEEEE] rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                />
              </div>

              <div className="relative" ref={filterPanelRef}>
                <button
                  type="button"
                  onClick={() => {
                    setPendingFilters(appliedFilters)
                    setShowFilterPanel(!showFilterPanel)
                  }}
                  className="relative bg-[#8DC63F] text-white rounded-xl p-3 hover:bg-[#7DB62F] transition-colors"
                  aria-label="Open filters"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#3B82F6] text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {showFilterPanel && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-[#EEEEEE] rounded-2xl shadow-lg w-[320px] sm:w-[360px] z-20 max-h-[70vh] overflow-y-auto">
                    <div className="p-4 border-b border-[#EEEEEE]">
                      <p className="font-semibold text-gray-900 text-sm">Filters</p>
                      <p className="text-xs text-gray-500 mt-0.5">Select multiple options</p>
                    </div>

                    <div className="p-4 space-y-3">
                      <FilterCategory title="Status">
                        <div className="space-y-1">
                          {STATUS_OPTIONS.map((option) => (
                            <FilterCheckboxItem
                              key={option.value}
                              label={option.label}
                              checked={pendingFilters.statuses.includes(option.value)}
                              onChange={() =>
                                setPendingFilters((prev) => ({
                                  ...prev,
                                  statuses: toggleArrayItem(prev.statuses, option.value),
                                }))
                              }
                            />
                          ))}
                        </div>
                      </FilterCategory>

                      <FilterCategory title="Country">
                        {uniqueCountries.length > 0 ? (
                          <div className="space-y-1 max-h-36 overflow-y-auto">
                            {uniqueCountries.map((country) => (
                              <FilterCheckboxItem
                                key={country}
                                label={country}
                                checked={pendingFilters.countries.includes(country)}
                                onChange={() =>
                                  setPendingFilters((prev) => ({
                                    ...prev,
                                    countries: toggleArrayItem(prev.countries, country),
                                  }))
                                }
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400">No countries available</p>
                        )}
                      </FilterCategory>

                      <FilterCategory title="Internship">
                        {uniqueInternships.length > 0 ? (
                          <div className="space-y-1 max-h-36 overflow-y-auto">
                            {uniqueInternships.map((title) => (
                              <FilterCheckboxItem
                                key={title}
                                label={title}
                                checked={pendingFilters.internships.includes(title)}
                                onChange={() =>
                                  setPendingFilters((prev) => ({
                                    ...prev,
                                    internships: toggleArrayItem(prev.internships, title),
                                  }))
                                }
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400">No internships available</p>
                        )}
                      </FilterCategory>
                    </div>

                    <div className="p-4 border-t border-[#EEEEEE] flex gap-2">
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-[#EEEEEE] hover:bg-gray-50 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyFilters}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#8DC63F] hover:bg-[#7DB62F] transition-colors"
                      >
                        Filter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {isLoading
                  ? 'Loading applications...'
                  : `Showing ${filteredApplications.length} ${filteredApplications.length === 1 ? 'application' : 'applications'}`}
              </p>
            </div>

            {/* Applications list */}
            {isLoading ? (
              <ListSkeleton />
            ) : loadError ? (
              <div className="bg-white border border-[#EEEEEE] rounded-2xl flex flex-col items-center justify-center py-16">
                <FileText className="w-12 h-12 text-gray-300 mb-3" />
                <p className="font-semibold text-gray-500">Failed to load applications</p>
                <p className="text-sm text-gray-400 mt-1">{loadError.message}</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="bg-white border border-[#EEEEEE] rounded-2xl flex flex-col items-center justify-center py-16">
                <FileText className="w-12 h-12 text-gray-300 mb-3" />
                <p className="font-semibold text-gray-500">No applications found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div
                  className={`hidden ${TABLE_GRID_CLASS} bg-[#F9F9F9] border border-[#EEEEEE] rounded-t-2xl text-xs font-semibold text-gray-500 uppercase tracking-wide md:py-3`}
                >
                  <span>Application ID</span>
                  <span>Student</span>
                  <span>Internship</span>
                  <span>Status</span>
                  <span>Time</span>
                  <span />
                </div>

                <div className="space-y-3 md:space-y-0 md:border md:border-t-0 md:border-[#EEEEEE] md:rounded-b-2xl md:overflow-hidden">
                  {paginatedApplications.map((application) => {
                    const country = application.internships?.country

                    return (
                      <div
                        key={application.id}
                        onClick={() => router.push(`/partner/applications/${application.id}`)}
                        className={`group bg-white border border-[#EEEEEE] md:border-0 md:border-b md:last:border-b-0 rounded-2xl md:rounded-none hover:bg-green-50 cursor-pointer transition-colors p-4 ${TABLE_GRID_CLASS}`}
                      >
                        <div className="mb-3 md:mb-0 min-w-0">
                          <p className="md:hidden text-xs text-gray-400 mb-0.5">Application ID</p>
                          <p className="text-sm font-semibold text-[#8DC63F] truncate">
                            {formatApplicationReferenceId(application.id, application.submitted_at)}
                          </p>
                        </div>

                        <div className="mb-3 md:mb-0 min-w-0">
                          <p className="md:hidden text-xs text-gray-400 mb-0.5">Student</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getStudentName(application)}
                          </p>
                        </div>

                        <div className="mb-3 md:mb-0 min-w-0">
                          <p className="md:hidden text-xs text-gray-400 mb-0.5">Internship</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {application.internships?.title || 'Unknown internship'}
                          </p>
                          {country && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                              <span className="text-sm leading-none">
                                {getCountryFlag(country, application.internships?.flag_emoji)}
                              </span>
                              <span className="truncate">{country}</span>
                            </div>
                          )}
                        </div>

                        <div className="mb-3 md:mb-0">
                          <p className="md:hidden text-xs text-gray-400 mb-0.5">Status</p>
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}
                          >
                            {formatStatusText(application.status)}
                          </span>
                        </div>

                        <div className="mb-3 md:mb-0 min-w-0">
                          <p className="md:hidden text-xs text-gray-400 mb-0.5">Time</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{getApplicationStatusTimestamp(application)}</span>
                          </div>
                        </div>

                        <div className="flex md:justify-end">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F5F5F5] text-gray-500 transition-colors group-hover:bg-[#8DC63F] group-hover:text-white">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {filteredApplications.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border border-[#EEEEEE] rounded-lg px-3 py-2 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {renderPaginationNumbers().map((page, index) =>
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          type="button"
                          onClick={() => handlePageChange(page as number)}
                          className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-[#8DC63F] text-white'
                              : 'border border-[#EEEEEE] bg-white hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border border-[#EEEEEE] rounded-lg px-3 py-2 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  )
}
