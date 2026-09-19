"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import InternshipListCard from '@/components/InternshipListCard'
import { getAllInternships } from '@/lib/internships'
import {
  INTERNSHIPS_PAGE_HEADING,
  INTERNSHIPS_PAGE_SUBHEADING,
  INTERNSHIPS_ITEMS_PER_PAGE,
  LABEL_LOADING,
  LABEL_SEARCH_PLACEHOLDER,
} from '@/lib/appConfig'
import { trackInternshipSearch } from '@/lib/analytics'
import MotionReveal from '@/components/motion/MotionReveal'
import { MotionStagger, MotionStaggerItem } from '@/components/motion/MotionStagger'

type Internship = {
  id: string
  badge: string
  title: string
  subtitle?: string
  city?: string
  country?: string
  short_description?: string
  duration_months: number
  stipend_monthly: number
  stipend_label?: string
  image_url?: string
  flag_emoji?: string
  created_at: string
}

type SortOption = 'most_recent' | 'oldest_first' | 'highest_stipend' | 'lowest_stipend' | 'shortest_duration' | 'longest_duration'

export default function PublicInternships() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('most_recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [internships, setInternships] = useState<Internship[]>([])
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchTrackingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function fetchInternships() {
      setIsLoading(true)
      const { data } = await getAllInternships()
      if (data) {
        setInternships(data)
      }
      setIsLoading(false)
    }
    
    fetchInternships()
  }, [])

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
      case 'most_recent':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest_first':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'highest_stipend':
        result.sort((a, b) => (b.stipend_monthly || 0) - (a.stipend_monthly || 0))
        break
      case 'lowest_stipend':
        result.sort((a, b) => (a.stipend_monthly || 0) - (b.stipend_monthly || 0))
        break
      case 'shortest_duration':
        result.sort((a, b) => (a.duration_months || 0) - (b.duration_months || 0))
        break
      case 'longest_duration':
        result.sort((a, b) => (b.duration_months || 0) - (a.duration_months || 0))
        break
    }

    setFilteredInternships(result)
    setCurrentPage(1)
  }, [searchQuery, sortBy, internships])

  useEffect(() => {
    if (isLoading) return

    if (searchTrackingTimeout.current) {
      clearTimeout(searchTrackingTimeout.current)
    }

    searchTrackingTimeout.current = setTimeout(() => {
      if (!searchQuery && sortBy === 'most_recent') return

      trackInternshipSearch({
        searchTerm: searchQuery,
        resultCount: filteredInternships.length,
        sortBy,
      })
    }, 800)

    return () => {
      if (searchTrackingTimeout.current) {
        clearTimeout(searchTrackingTimeout.current)
      }
    }
  }, [searchQuery, sortBy, filteredInternships.length, isLoading])

  const totalPages = Math.ceil(filteredInternships.length / INTERNSHIPS_ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * INTERNSHIPS_ITEMS_PER_PAGE
  const paginatedInternships = filteredInternships.slice(startIndex, startIndex + INTERNSHIPS_ITEMS_PER_PAGE)
  const visibleEnd = Math.min(startIndex + INTERNSHIPS_ITEMS_PER_PAGE, filteredInternships.length)

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar activeLink="internships" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={LABEL_SEARCH_PLACEHOLDER}
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

        <MotionReveal className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="font-bold text-2xl text-gray-900 mb-1">{INTERNSHIPS_PAGE_HEADING}</h1>
            <p className="text-sm text-gray-500">
              {INTERNSHIPS_PAGE_SUBHEADING}
              {filteredInternships.length === 0
                ? ''
                : totalPages > 1
                  ? ` · Showing ${startIndex + 1}–${visibleEnd} of ${filteredInternships.length} internships abroad`
                  : ` · Showing ${filteredInternships.length} internships abroad`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-gr-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gr-primary focus:border-transparent"
            >
              <option value="most_recent">Most Recent</option>
              <option value="oldest_first">Oldest First</option>
              <option value="highest_stipend">Highest Stipend</option>
              <option value="lowest_stipend">Lowest Stipend</option>
              <option value="shortest_duration">Shortest Duration</option>
              <option value="longest_duration">Longest Duration</option>
            </select>
          </div>
        </MotionReveal>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">{LABEL_LOADING}</div>
        ) : paginatedInternships.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No internships found</div>
        ) : (
          <>
            <MotionStagger className="mb-8 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedInternships.map((internship) => (
                <MotionStaggerItem key={internship.id} className="flex h-full">
                  <InternshipListCard
                    className="w-full"
                    internship={internship}
                    ctaLabel="View Details"
                    onCardClick={() => router.push(`/internships/${internship.id}`)}
                    onCtaClick={(e) => {
                      e.stopPropagation()
                      router.push(`/internships/${internship.id}`)
                    }}
                  />
                </MotionStaggerItem>
              ))}
            </MotionStagger>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-8">
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

      <Footer />
    </div>
  )
}
