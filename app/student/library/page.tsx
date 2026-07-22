"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import StudentSidebar from '@/components/StudentSidebar'
import StudentMobileLogo from '@/components/StudentMobileLogo'
import BottomNavigation from '@/components/BottomNavigation'
import UserAvatar from '@/components/UserAvatar'
import PlaylistCard, {
  getPlaylistLevel,
  type PlaylistCardData,
} from '@/components/PlaylistCard'
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { getAllPlaylists } from '@/lib/playlists'
import { getMyStudentProfile } from '@/lib/studentProfiles'
import { getMyProfile } from '@/lib/profiles'

const ITEMS_PER_PAGE = 6

type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced'

const fetcher = (fn: () => Promise<any>) => fn().then((res) => res.data)

export default function StudentLibrary() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredPlaylists, setFilteredPlaylists] = useState<PlaylistCardData[]>([])

  const { data: playlists, isLoading: playlistsLoading } = useSWR(
    'allPlaylists',
    () => fetcher(getAllPlaylists),
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

  useEffect(() => {
    if (!playlists) {
      setFilteredPlaylists([])
      return
    }

    let result = [...(playlists as PlaylistCardData[])]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((playlist) => playlist.name?.toLowerCase().includes(query))
    }

    if (levelFilter !== 'all') {
      result = result.filter(
        (playlist) => getPlaylistLevel(playlist.name).toLowerCase() === levelFilter
      )
    }

    setFilteredPlaylists(result)
    setCurrentPage(1)
  }, [searchQuery, levelFilter, playlists])

  const totalPages = Math.ceil(filteredPlaylists.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedPlaylists = filteredPlaylists.slice(startIndex, startIndex + ITEMS_PER_PAGE)

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
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
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

  const userName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : 'Student'

  const filterOptions: { value: LevelFilter; label: string }[] = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ]

  return (
    <div className="flex h-screen bg-[#F9F9F9]">
      <div className="hidden lg:block">
        <StudentSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-[#EEEEEE] px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <StudentMobileLogo />
            <div className="flex items-center gap-3 ml-auto">
              <div className="text-right">
                <div className="font-bold text-gray-900">{userName}</div>
                <div className="text-xs text-[#3B82F6] font-medium">
                  ID: {myProfile?.unique_id || 'N/A'}
                </div>
              </div>
              <Link
                href="/student/profile"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
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
            <div className="mb-6">
              <h1 className="font-bold text-2xl text-gray-900">Language Learning Library</h1>
              <p className="text-sm text-gray-500 mt-1">
                Prepare for your international internship with language and cultural lessons.
              </p>
            </div>

            <div className="flex gap-3 items-center mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search languages, countries etc"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#EEEEEE] rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="bg-[#8DC63F] text-white rounded-xl p-3 hover:bg-[#7DB62F] transition-colors"
                  aria-label="Filter playlists"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>

                {showFilterDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-[#EEEEEE] rounded-xl shadow-lg py-2 w-48 z-10">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setLevelFilter(option.value)
                          setShowFilterDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          levelFilter === option.value
                            ? 'bg-green-50 text-[#8DC63F] font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {playlistsLoading ? (
              <div className="text-center py-12 text-gray-500">Loading playlists...</div>
            ) : paginatedPlaylists.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No playlists found</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedPlaylists.map((playlist, index) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      index={startIndex + index}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border border-[#EEEEEE] rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
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
                          onClick={() => handlePageChange(page as number)}
                          className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-[#8DC63F] text-white'
                              : 'border border-[#EEEEEE] hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border border-[#EEEEEE] rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
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
