"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import {
  Search,
  Handshake,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Globe,
  Clock,
} from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import AdminBottomNavigation from '@/components/AdminBottomNavigation'
import { getAllPartners } from '@/lib/adminPartners'
import { getMyAdminProfile } from '@/lib/adminProfiles'
import { getMyProfile } from '@/lib/profiles'
import { ITEMS_PER_PAGE } from '@/lib/appConfig'

const TABLE_GRID_CLASS =
  'md:grid md:grid-cols-5 md:gap-4 md:items-center md:px-6 md:py-4'

type PartnerProfile = {
  id: string
  first_name?: string
  middle_name?: string
  last_name?: string
  official_email?: string
  countries?: string[] | null
  profiles?: { unique_id?: string; created_at?: string; role?: string } | { unique_id?: string; created_at?: string; role?: string }[] | null
}

type AdminProfile = {
  first_name?: string
  last_name?: string
}

type Profile = {
  unique_id?: string
}

type FilterState = {
  countries: string[]
}

const EMPTY_FILTERS: FilterState = {
  countries: [],
}

const KPI_CARD_CLASS =
  'bg-white border border-[#EEEEEE] rounded-2xl p-5 transition-colors hover:border-[#8DC63F]'

const fetcher = async (fn: () => Promise<{ data: unknown; error: unknown }>) => {
  const res = await fn()
  if (res.error) {
    throw new Error(
      typeof res.error === 'object' && res.error && 'message' in res.error
        ? String((res.error as { message: string }).message)
        : 'Failed to load partners'
    )
  }
  return (res.data as PartnerProfile[]) ?? []
}

function getNestedProfile(partner: PartnerProfile) {
  const profile = partner.profiles
  return Array.isArray(profile) ? profile[0] : profile
}

function getPartnerSortTimestamp(partner: PartnerProfile) {
  const profile = getNestedProfile(partner)
  const dateString = profile?.created_at
  return dateString ? new Date(dateString).getTime() : 0
}

function sortPartnersLatestFirst(partners: PartnerProfile[]) {
  return [...partners].sort(
    (a, b) => getPartnerSortTimestamp(b) - getPartnerSortTimestamp(a)
  )
}

function displayValue(value?: string | null) {
  return value?.trim() ? value : '-'
}

function getPartnerName(partner: PartnerProfile) {
  const name = [partner.first_name, partner.middle_name, partner.last_name]
    .filter(Boolean)
    .join(' ')
  return name || '-'
}

function formatCountries(countries?: string[] | null) {
  if (!countries?.length) return '-'
  return countries.join(', ')
}

function formatRelativeDate(dateString?: string) {
  if (!dateString) return '-'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminPartners() {
  const filterPanelRef = useRef<HTMLDivElement>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [pendingFilters, setPendingFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: partners, isLoading, error: loadError } = useSWR(
    'adminAllPartners',
    () => fetcher(getAllPartners),
    {
      dedupingInterval: 300000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const { data: adminProfile } = useSWR('adminProfileHeader', () => fetcher(getMyAdminProfile), {
    dedupingInterval: 300000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const { data: myProfile } = useSWR('adminMyProfileHeader', () => fetcher(getMyProfile), {
    dedupingInterval: 300000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const partnerList = useMemo(
    () =>
      sortPartnersLatestFirst((partners as PartnerProfile[] | undefined) ?? []),
    [partners]
  )

  const uniqueCountries = useMemo(() => {
    const countrySet = new Set<string>()
    partnerList.forEach((partner) => {
      partner.countries?.forEach((country) => {
        if (country?.trim()) countrySet.add(country.trim())
      })
    })
    return [...countrySet].sort()
  }, [partnerList])

  const stats = useMemo(() => {
    const total = partnerList.length
    const countriesCovered = uniqueCountries.length
    return { total, countriesCovered }
  }, [partnerList, uniqueCountries])

  const filteredPartners = useMemo(() => {
    let result = [...partnerList]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((partner) => {
        const firstName = partner.first_name?.toLowerCase() ?? ''
        const lastName = partner.last_name?.toLowerCase() ?? ''
        const middleName = partner.middle_name?.toLowerCase() ?? ''
        const uniqueId = getNestedProfile(partner)?.unique_id?.toLowerCase() ?? ''
        const email = partner.official_email?.toLowerCase() ?? ''
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ')
        const countryMatch = (partner.countries ?? []).some((country) =>
          country.toLowerCase().includes(query)
        )

        return (
          firstName.includes(query) ||
          lastName.includes(query) ||
          middleName.includes(query) ||
          fullName.includes(query) ||
          uniqueId.includes(query) ||
          email.includes(query) ||
          countryMatch
        )
      })
    }

    if (appliedFilters.countries.length > 0) {
      result = result.filter((partner) =>
        (partner.countries ?? []).some((country) =>
          appliedFilters.countries.includes(country)
        )
      )
    }

    return sortPartnersLatestFirst(result)
  }, [partnerList, searchQuery, appliedFilters])

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

  const totalPages = Math.ceil(filteredPartners.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedPartners = filteredPartners.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const activeFilterCount = appliedFilters.countries.length

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

  const profile = adminProfile as AdminProfile | null
  const profileMeta = myProfile as Profile | null

  const adminName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Admin'

  const getAvatarInitials = () => {
    const first = profile?.first_name?.trim()
    const last = profile?.last_name?.trim()
    if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    if (first) return first.charAt(0).toUpperCase()
    return 'A'
  }

  return (
    <div className="flex h-screen bg-[#F9F9F9] overflow-hidden">
      <div className="hidden lg:block">
        <AdminSidebar
          activePage="partners"
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-[#EEEEEE] px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-bold text-xl sm:text-2xl text-gray-900">Partners</h1>
              <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">
                View all registered partner organizations
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-gray-900">{adminName}</p>
                <p className="text-sm text-[#8DC63F]">{profileMeta?.unique_id || 'N/A'}</p>
              </div>
              <Link
                href="/admin/profile"
                className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition-opacity"
              >
                {getAvatarInitials()}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={KPI_CARD_CLASS}>
                {isLoading ? (
                  <KpiCardSkeleton />
                ) : (
                  <>
                    <Handshake className="w-8 h-8 text-[#8DC63F] mb-3" />
                    <p className="text-sm text-gray-500">Total Partners</p>
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
                    <Globe className="w-8 h-8 text-[#8DC63F] mb-3" />
                    <p className="text-sm text-gray-500">Countries Covered</p>
                    <p className="text-3xl font-bold text-[#3B82F6] mt-1">
                      {stats.countriesCovered.toLocaleString()}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by partner ID, name, email, or country..."
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
                      <FilterCategory title="Country">
                        {uniqueCountries.length > 0 ? (
                          <div className="space-y-1 max-h-48 overflow-y-auto">
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
                  ? 'Loading partners...'
                  : `Showing ${filteredPartners.length} ${filteredPartners.length === 1 ? 'partner' : 'partners'}`}
              </p>
            </div>

            {isLoading ? (
              <ListSkeleton />
            ) : loadError ? (
              <div className="bg-white border border-[#EEEEEE] rounded-2xl flex flex-col items-center justify-center py-16">
                <Handshake className="w-12 h-12 text-gray-300 mb-3" />
                <p className="font-semibold text-gray-500">Failed to load partners</p>
                <p className="text-sm text-gray-400 mt-1">{loadError.message}</p>
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="bg-white border border-[#EEEEEE] rounded-2xl flex flex-col items-center justify-center py-16">
                <Handshake className="w-12 h-12 text-gray-300 mb-3" />
                <p className="font-semibold text-gray-500">No partners found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div
                  className={`hidden ${TABLE_GRID_CLASS} bg-[#F9F9F9] border border-[#EEEEEE] rounded-t-2xl text-xs font-semibold text-gray-500 uppercase tracking-wide md:py-3`}
                >
                  <span>Partner ID</span>
                  <span>Name</span>
                  <span>Email</span>
                  <span>Countries</span>
                  <span>Joined</span>
                </div>

                <div className="space-y-3 md:space-y-0 md:border md:border-t-0 md:border-[#EEEEEE] md:rounded-b-2xl md:overflow-hidden">
                  {paginatedPartners.map((partner) => {
                    const profileData = getNestedProfile(partner)

                    return (
                      <div
                        key={partner.id}
                        className={`bg-white border border-[#EEEEEE] md:border-0 md:border-b md:last:border-b-0 rounded-2xl md:rounded-none p-4 ${TABLE_GRID_CLASS}`}
                      >
                        <div className="mb-3 md:mb-0 min-w-0">
                          <p className="md:hidden text-xs text-gray-400 mb-0.5">Partner ID</p>
                          <p className="text-sm font-semibold text-[#8DC63F] truncate">
                            {displayValue(profileData?.unique_id)}
                          </p>
                        </div>

                        <div className="mb-3 md:mb-0 min-w-0">
                          <p className="md:hidden text-xs text-gray-400 mb-0.5">Name</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getPartnerName(partner)}
                          </p>
                        </div>

                        <div className="mb-3 md:mb-0 min-w-0">
                          <p className="md:hidden text-xs text-gray-400 mb-0.5">Email</p>
                          <p className="text-sm text-gray-600 truncate">
                            {displayValue(partner.official_email)}
                          </p>
                        </div>

                        <div className="mb-3 md:mb-0 min-w-0">
                          <p className="md:hidden text-xs text-gray-400 mb-0.5">Countries</p>
                          <p className="text-sm text-gray-600 truncate">
                            {formatCountries(partner.countries)}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="md:hidden text-xs text-gray-400 mb-0.5">Joined</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">
                              {formatRelativeDate(profileData?.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {filteredPartners.length > 0 && totalPages > 1 && (
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

      <AdminBottomNavigation />
    </div>
  )
}
