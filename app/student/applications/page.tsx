"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import StudentSidebar from '@/components/StudentSidebar'
import StudentMobileLogo from '@/components/StudentMobileLogo'
import BottomNavigation from '@/components/BottomNavigation'
import UserAvatar from '@/components/UserAvatar'
import { 
  Search, 
  Clock, 
  Banknote, 
  ChevronRight, 
  Send, 
  CheckCircle, 
  SlidersHorizontal,
  FileText,
  ChevronLeft,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { getMyApplications, getApplicationCounts, deleteStudentApplication } from '@/lib/studentApplications'
import { getMyStudentProfile } from '@/lib/studentProfiles'
import { getMyProfile } from '@/lib/profiles'

const ITEMS_PER_PAGE = 8

type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'accepted' | 'closed'

type Application = {
  id: string
  status: ApplicationStatus
  started_at: string
  submitted_at?: string
  updated_at?: string
  decided_at?: string
  accepted_at?: string
  internships: {
    title: string
    subtitle?: string
    city?: string
    country?: string
    image_url?: string
    duration_months?: number
    stipend_monthly?: number
  }
}

const getStatusBadgeColor = (status: ApplicationStatus) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-700 border-gray-200'
    case 'submitted':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'under_review':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'accepted':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'closed':
      return 'bg-gray-50 text-gray-500 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const canDeleteApplication = (status: ApplicationStatus) => {
  return status === 'draft' || status === 'submitted'
}

const formatStatusText = (status: ApplicationStatus) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const getCountryFlag = (country: string) => {
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

const getStatusTimestamp = (application: Application) => {
  let timestamp: string | undefined
  
  switch (application.status) {
    case 'draft':
      timestamp = application.started_at
      break
    case 'submitted':
    case 'under_review':
      timestamp = application.submitted_at
      break
    case 'approved':
    case 'rejected':
      timestamp = application.decided_at
      break
    case 'accepted':
      timestamp = application.accepted_at
      break
    case 'closed':
      timestamp = application.updated_at
      break
    default:
      timestamp = application.updated_at
  }
  
  if (!timestamp) return 'N/A'
  
  const date = new Date(timestamp)
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

const fetcher = (fn: () => Promise<any>) => fn().then(res => res.data)

export default function StudentApplications() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: applications, isLoading: applicationsLoading, mutate: refreshApplications } = useSWR(
    'myApplications',
    () => fetcher(getMyApplications),
    {
      dedupingInterval: 300000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const { data: applicationCounts, mutate: refreshApplicationCounts } = useSWR(
    'applicationCounts',
    () => fetcher(getApplicationCounts),
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
    if (!applications) {
      setFilteredApplications([])
      return
    }

    let result = [...applications]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(app => 
        app.internships?.title?.toLowerCase().includes(query) ||
        app.internships?.country?.toLowerCase().includes(query)
      )
    }

    if (filterStatus !== 'all') {
      result = result.filter(app => app.status === filterStatus)
    }

    setFilteredApplications(result)
    setCurrentPage(1)
  }, [searchQuery, filterStatus, applications])

  const draftsCount = applicationCounts?.drafts ?? 0
  const submittedCount = applicationCounts?.submitted ?? 0
  const approvedCount = applicationCounts?.approved ?? 0

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDeleteApplication = async (applicationId: string, status: ApplicationStatus, event: React.MouseEvent) => {
    event.stopPropagation()

    const message = status === 'submitted'
      ? 'Are you sure you want to delete this submitted application? You can reapply to this internship afterwards.'
      : 'Are you sure you want to delete this draft application?'

    if (!window.confirm(message)) {
      return
    }

    setDeletingId(applicationId)

    try {
      const result = await deleteStudentApplication(applicationId)

      if (result.error) {
        toast.error(result.error.message || 'Failed to delete application')
        return
      }

      toast.success('Application deleted successfully')
      await Promise.all([
        refreshApplications(),
        refreshApplicationCounts(),
      ])
    } catch (error) {
      console.error('Error deleting application:', error)
      toast.error('Failed to delete application')
    } finally {
      setDeletingId(null)
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
  const isLoading = applicationsLoading

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
          <div className="flex items-center justify-between gap-3">
            <StudentMobileLogo />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-bold text-gray-900">{userName}</div>
                <div className="text-xs text-[#3B82F6] font-medium">ID: {myProfile?.unique_id || 'N/A'}</div>
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
            <div className="mb-6">
              <h1 className="font-bold text-2xl text-gray-900">My Applications</h1>
              <p className="text-sm text-gray-500 mt-1">Track all your internship applications</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-[#EEEEEE] rounded-2xl p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Drafts</div>
                    <div className="text-4xl font-bold text-[#3B82F6] mt-2">
                      {draftsCount.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <FileText className="w-6 h-6 text-[#8DC63F]" />
                </div>
              </div>

              <div className="bg-white border border-[#EEEEEE] rounded-2xl p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Submitted</div>
                    <div className="text-4xl font-bold text-[#3B82F6] mt-2">
                      {submittedCount.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <Send className="w-6 h-6 text-[#8DC63F]" />
                </div>
              </div>

              <div className="bg-white border border-[#EEEEEE] rounded-2xl p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Approved</div>
                    <div className="text-4xl font-bold text-[#3B82F6] mt-2">
                      {approvedCount.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-[#8DC63F]" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search internships (e.g. Soil Research)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#EEEEEE] rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="bg-[#8DC63F] text-white rounded-xl p-3 hover:bg-[#7DB62F] transition-colors"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>

                {showFilterDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-[#EEEEEE] rounded-xl shadow-lg py-2 w-48 z-10">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'draft', label: 'Draft' },
                      { value: 'submitted', label: 'Submitted' },
                      { value: 'under_review', label: 'Under Review' },
                      { value: 'approved', label: 'Approved' },
                      { value: 'rejected', label: 'Rejected' },
                      { value: 'accepted', label: 'Accepted' },
                      { value: 'closed', label: 'Closed' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterStatus(option.value)
                          setShowFilterDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          filterStatus === option.value ? 'bg-green-50 text-[#8DC63F] font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white border border-[#EEEEEE] rounded-2xl p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-20 bg-gray-200 rounded-xl" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                      <div className="h-6 w-24 bg-gray-200 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="font-semibold text-gray-500 mb-1">No applications yet</h3>
                <p className="text-sm text-gray-400 mb-4">Start browsing internships and apply!</p>
                <button
                  onClick={() => router.push('/student/internships')}
                  className="bg-[#8DC63F] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#7DB62F] transition-colors"
                >
                  Browse Internships
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedApplications.map((application, index) => (
                    <div
                      key={application.id}
                      className="bg-white border border-[#EEEEEE] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={application.internships?.image_url || `https://picsum.photos/100/80?random=${startIndex + index}`}
                            alt={application.internships?.title || 'Internship'}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                          <h3 className="font-bold text-gray-900 text-base truncate">
                            {application.internships?.title || 'Internship Program'}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(application.status)}`}>
                              {formatStatusText(application.status)}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                              {getStatusTimestamp(application)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base leading-none">
                                {getCountryFlag(application.internships?.country || '')}
                              </span>
                              <span className="truncate">
                                {application.internships?.country || 'Country not specified'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {application.internships?.duration_months
                                  ? `${application.internships.duration_months} Months`
                                  : 'Duration not specified'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Banknote className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {application.internships?.stipend_monthly
                                  ? `₹${application.internships.stipend_monthly.toLocaleString()} / Month`
                                  : 'Stipend not specified'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 sm:flex-col sm:items-stretch sm:min-w-[100px]">
                        <button
                          onClick={() => router.push(`/student/applications/${application.id}`)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium bg-green-50 text-[#5A9A2E] border border-green-200 hover:bg-green-100 transition-colors"
                        >
                          View
                        </button>
                        {canDeleteApplication(application.status) && (
                          <button
                            onClick={(event) => handleDeleteApplication(application.id, application.status, event)}
                            disabled={deletingId === application.id}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {deletingId === application.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              'Delete'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border border-[#EEEEEE] rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                              ? 'bg-[#8DC63F] text-white'
                              : 'border border-[#EEEEEE] hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border border-[#EEEEEE] rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
