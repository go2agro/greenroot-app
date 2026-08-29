"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, MapPin, Clock, Banknote, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getAllInternships } from '@/lib/internships'
import {
  BTN_APPLY_NOW,
  DEFAULT_INTERNSHIP_IMAGE,
  INTERNSHIPS_PAGE_HEADING,
  INTERNSHIPS_PAGE_SUBHEADING,
  ITEMS_PER_PAGE,
  LABEL_LOADING,
  LABEL_SEARCH_PLACEHOLDER,
} from '@/lib/appConfig'

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

const getBadgeColor = (badge: string) => {
  const badgeUpper = badge?.toUpperCase() || ''
  if (badgeUpper.includes('RESEARCH')) return 'bg-blue-500'
  if (badgeUpper.includes('TECHNOLOGY')) return 'bg-purple-500'
  if (badgeUpper.includes('FIELD')) return 'bg-teal-500'
  if (badgeUpper.includes('HORTICULTURE')) return 'bg-green-600'
  if (badgeUpper.includes('GENETICS')) return 'bg-indigo-500'
  if (badgeUpper.includes('AUTOMATION')) return 'bg-orange-500'
  return 'bg-gr-primary'
}

const getCountryFlag = (country: string, emoji?: string) => {
  if (emoji) return emoji
  
  const countryToCode: { [key: string]: string } = {
    'USA': 'US',
    'United States': 'US',
    'UK': 'GB',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'India': 'IN',
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Switzerland': 'CH',
    'Austria': 'AT',
    'Japan': 'JP',
    'China': 'CN',
    'South Korea': 'KR',
    'Brazil': 'BR',
    'Mexico': 'MX',
    'Argentina': 'AR',
    'New Zealand': 'NZ',
    'Singapore': 'SG',
    'Ireland': 'IE',
    'Denmark': 'DK',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Finland': 'FI',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Greece': 'GR',
    'Israel': 'IL',
    'UAE': 'AE',
    'South Africa': 'ZA',
    'Kenya': 'KE',
    'Nigeria': 'NG',
    'Egypt': 'EG',
    'Thailand': 'TH',
    'Vietnam': 'VN',
    'Indonesia': 'ID',
    'Philippines': 'PH',
    'Malaysia': 'MY',
  }
  
  const code = countryToCode[country] || countryToCode[country?.split(',')[0]?.trim()]
  if (!code) return '🌍'
  
  return String.fromCodePoint(...[...code].map(c => c.charCodeAt(0) + 127397))
}

export default function PublicInternships() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('most_recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [internships, setInternships] = useState<Internship[]>([])
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const totalPages = Math.ceil(filteredInternships.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedInternships = filteredInternships.slice(startIndex, startIndex + ITEMS_PER_PAGE)

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
      <Navbar activeLink="opportunities" />

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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="font-bold text-2xl text-gray-900 mb-1">{INTERNSHIPS_PAGE_HEADING}</h1>
            <p className="text-sm text-gray-500">
              {INTERNSHIPS_PAGE_SUBHEADING} · Showing {filteredInternships.length} opportunities worldwide
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
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">{LABEL_LOADING}</div>
        ) : paginatedInternships.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No internships found</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedInternships.map((internship, index) => (
                <div
                  key={internship.id}
                  className="bg-white rounded-2xl border border-gr-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/internships/${internship.id}`)}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={internship.image_url || `https://picsum.photos/400/250?random=${startIndex + index}`}
                      alt={internship.title}
                      fill
                      className="object-cover"
                    />
                    <div className={`absolute top-3 left-3 ${getBadgeColor(internship.badge)} text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}>
                      {internship.badge}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">
                      {internship.title}
                    </h3>
                    
                    {internship.short_description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {internship.short_description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      {internship.country && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span className="flex items-center gap-1.5">
                            <span className="text-base">{getCountryFlag(internship.country, internship.flag_emoji)}</span>
                            {internship.country}
                          </span>
                        </div>
                      )}
                      
                      {internship.duration_months && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{internship.duration_months} Months</span>
                        </div>
                      )}
                      
                      {(internship.stipend_label || internship.stipend_monthly) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Banknote className="w-4 h-4 text-gray-500" />
                          <span className="font-bold text-gr-primary">
                            {internship.stipend_label || `$ ${internship.stipend_monthly?.toLocaleString()} / Month`}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/internships/${internship.id}`)
                      }}
                      className="w-full bg-gr-primary text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-gr-primary-hover transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

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
