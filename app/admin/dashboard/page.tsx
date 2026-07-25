"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { type DateRange } from 'react-day-picker'
import {
  Users,
  FileText,
  CheckCircle,
  Briefcase,
  CalendarDays,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  Tooltip,
} from 'recharts'
import AdminSidebar from '@/components/AdminSidebar'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  getAdminDashboardData,
  getDashboardKpisByDateRange,
} from '@/lib/adminDashboard'

type TimeFilter = 'this_week' | 'this_month' | 'last_3_months'
type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'accepted'
  | 'closed'

interface StatusCounts {
  draft?: number
  submitted?: number
  under_review?: number
  approved?: number
  accepted?: number
  [key: string]: number | undefined
}

interface AdminProfile {
  first_name?: string
  last_name?: string
}

interface Profile {
  unique_id?: string
}

interface TopInternship {
  internship: {
    title?: string
    country?: string
  }
  count: number
}

interface RecentApplication {
  id: string
  status: ApplicationStatus
  submitted_at?: string
  internships?: { title?: string; country?: string } | null
  student_profiles?: { first_name?: string; last_name?: string } | null
}

interface ProfileCompletionStats {
  totalStudents: number
  complete: number
  incomplete: number
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const BAR_COLORS = ['#1D4ED8', '#93C5FD']
const PROFILE_COMPLETION_COLORS = ['#8DC63F', '#93C5FD']
const CARD_CLASS = 'bg-white border border-[#EEEEEE] rounded-2xl p-6'

function getDayName(date: Date): string {
  const dayIndex = date.getDay()
  return dayIndex === 0 ? 'Sun' : DAY_NAMES[dayIndex - 1]
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('default', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('default', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatStatusText(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusBadgeClass(status: ApplicationStatus): string {
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
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

function getStartOfWeek(date: Date): Date {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function transformChartData(dates: string[], filter: TimeFilter): { name: string; value: number }[] {
  const now = new Date()

  if (filter === 'this_week') {
    const weekStart = getStartOfWeek(now)
    const counts = Object.fromEntries(DAY_NAMES.map((day) => [day, 0])) as Record<string, number>

    dates.forEach((dateStr) => {
      const date = new Date(dateStr)
      if (date >= weekStart && date <= now) {
        const dayName = getDayName(date)
        counts[dayName] = (counts[dayName] || 0) + 1
      }
    })

    return DAY_NAMES.map((name) => ({ name, value: counts[name] }))
  }

  if (filter === 'this_month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    monthStart.setHours(0, 0, 0, 0)
    const weeks: { name: string; value: number }[] = []

    let weekIndex = 1
    const weekStart = new Date(monthStart)

    while (weekStart <= now) {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      const effectiveEnd = weekEnd > now ? now : weekEnd

      const value = dates.filter((dateStr) => {
        const date = new Date(dateStr)
        return date >= weekStart && date <= effectiveEnd
      }).length

      weeks.push({ name: `Wk ${weekIndex}`, value })
      weekIndex += 1
      weekStart.setDate(weekStart.getDate() + 7)
    }

    return weeks.length > 0 ? weeks : [{ name: 'Wk 1', value: 0 }]
  }

  const threeMonthsAgo = new Date(now)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2)
  threeMonthsAgo.setDate(1)
  threeMonthsAgo.setHours(0, 0, 0, 0)

  const counts: Record<string, number> = {}
  dates.forEach((dateStr) => {
    const date = new Date(dateStr)
    if (date >= threeMonthsAgo) {
      const key = date.toLocaleString('default', { month: 'short' })
      counts[key] = (counts[key] || 0) + 1
    }
  })

  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now)
    d.setMonth(d.getMonth() - (2 - i))
    const name = d.toLocaleString('default', { month: 'short' })
    return { name, value: counts[name] || 0 }
  })
}

function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse bg-gray-200 rounded-lg" />
          <div className="h-4 w-72 animate-pulse bg-gray-200 rounded-lg" />
        </div>
        <div className="h-11 w-11 animate-pulse bg-gray-200 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#EEEEEE] rounded-2xl p-5">
            <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-lg mb-3" />
            <div className="h-4 w-24 animate-pulse bg-gray-200 rounded mb-2" />
            <div className="h-9 w-16 animate-pulse bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      <div className={`${CARD_CLASS} animate-pulse`}>
        <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
        <div className="h-16 bg-gray-200 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${CARD_CLASS} h-[360px] animate-pulse bg-gray-100`} />
        <div className={`${CARD_CLASS} h-[360px] animate-pulse bg-gray-100`} />
      </div>

      <div className={`${CARD_CLASS} h-64 animate-pulse bg-gray-100`} />

      <div className={CARD_CLASS}>
        <div className="h-5 w-40 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  )
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-sm text-gray-500 border border-dashed border-[#EEEEEE] rounded-xl">
      {message}
    </div>
  )
}

export default function AdminDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [kpiLoading, setKpiLoading] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this_week')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>()

  const [studentsCount, setStudentsCount] = useState(0)
  const [applicationsCount, setApplicationsCount] = useState(0)
  const [acceptanceRate, setAcceptanceRate] = useState<string | number>(0)
  const [internshipsCount, setInternshipsCount] = useState(0)
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({})
  const [growthDates, setGrowthDates] = useState<string[]>([])
  const [topInternships, setTopInternships] = useState<TopInternship[]>([])
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([])
  const [profileCompletionStats, setProfileCompletionStats] = useState<ProfileCompletionStats>({
    totalStudents: 0,
    complete: 0,
    incomplete: 0,
  })
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [myProfile, setMyProfile] = useState<Profile | null>(null)

  const loadKpis = useCallback(async (range?: DateRange) => {
    setKpiLoading(true)

    const startDate = range?.from?.toISOString() ?? null
    const endDate = range?.to?.toISOString() ?? null
    const result = await getDashboardKpisByDateRange(startDate, endDate)

    setStudentsCount(result.data?.studentsCount ?? 0)
    setApplicationsCount(result.data?.applicationsCount ?? 0)
    setAcceptanceRate(result.data?.acceptanceRate ?? 0)
    setInternshipsCount(result.data?.internshipsCount ?? 0)
    setKpiLoading(false)
  }, [])

  useEffect(() => {
    async function loadData() {
      const result = await getAdminDashboardData()
      const data = result.data

      if (data) {
        setStudentsCount(data.studentsCount)
        setApplicationsCount(data.applicationsCount)
        setAcceptanceRate(data.acceptanceRate)
        setInternshipsCount(data.internshipsCount)
        setStatusCounts(data.statusCounts)
        setGrowthDates(data.growthDates)
        setTopInternships(data.topInternships as TopInternship[])
        setRecentApplications(data.recentApplications as RecentApplication[])
        setProfileCompletionStats(data.profileCompletion)
        setAdminProfile(data.adminProfile as AdminProfile | null)
        setMyProfile(data.myProfile as Profile | null)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const handleApplyDateRange = async () => {
    if (!dateRange?.from || !dateRange?.to) return
    setAppliedDateRange(dateRange)
    await loadKpis(dateRange)
    setCalendarOpen(false)
  }

  const handleClearDateRange = async () => {
    setDateRange(undefined)
    setAppliedDateRange(undefined)
    await loadKpis()
    setCalendarOpen(false)
  }

  const chartData = useMemo(
    () => transformChartData(growthDates, timeFilter),
    [growthDates, timeFilter]
  )

  const profileCompletionChartData = useMemo(
    () => [
      { name: 'Complete', value: profileCompletionStats.complete },
      { name: 'Incomplete', value: profileCompletionStats.incomplete },
    ],
    [profileCompletionStats]
  )

  const totalProfiledStudents = profileCompletionStats.totalStudents
  const profileCompletionRate =
    totalProfiledStudents > 0
      ? Math.round((profileCompletionStats.complete / totalProfiledStudents) * 100)
      : 0

  const pipelineStages = [
    { label: 'Draft', count: statusCounts.draft ?? 0 },
    { label: 'Submitted', count: statusCounts.submitted ?? 0 },
    { label: 'Under Review', count: statusCounts.under_review ?? 0 },
    { label: 'Approved', count: statusCounts.approved ?? 0 },
    { label: 'Rejected', count: statusCounts.rejected ?? 0 },
    { label: 'Accepted', count: statusCounts.accepted ?? 0 },
  ]

  const adminName =
    [adminProfile?.first_name, adminProfile?.last_name].filter(Boolean).join(' ') || 'Admin'
  const uniqueId = myProfile?.unique_id || 'N/A'

  const getAvatarInitials = () => {
    const first = adminProfile?.first_name?.trim()
    const last = adminProfile?.last_name?.trim()
    if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    if (first) return first.charAt(0).toUpperCase()
    return 'A'
  }

  const dateRangeLabel =
    appliedDateRange?.from && appliedDateRange?.to
      ? `${formatDateLabel(appliedDateRange.from)} – ${formatDateLabel(appliedDateRange.to)}`
      : null

  const kpiCardClass =
    'bg-white border border-[#EEEEEE] rounded-2xl p-5 transition-colors hover:border-[#8DC63F]'

  return (
    <div className="flex h-screen bg-[#F9F9F9] overflow-hidden">
      <div className="hidden lg:block">
        <AdminSidebar
          activePage="dashboard"
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-[#EEEEEE] px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-end gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{adminName}</p>
              <p className="text-sm text-[#8DC63F]">{uniqueId}</p>
            </div>
            <Link
              href="/admin/profile"
              className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition-opacity"
            >
              {getAvatarInitials()}
            </Link>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="font-bold text-2xl text-gray-900">Business Overview</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {dateRangeLabel
                    ? `Showing metrics for ${dateRangeLabel}.`
                    : 'Performance metrics for the academic semester.'}
                </p>
                {!dateRangeLabel && (
                  <p className="text-xs text-gray-400 mt-0.5">Lifetime counts</p>
                )}
              </div>

              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="bg-[#8DC63F] text-white rounded-xl p-3 hover:opacity-90 transition-opacity flex-shrink-0"
                    aria-label="Select date range"
                  >
                    <CalendarDays className="w-5 h-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    disabled={{ after: new Date() }}
                  />
                  <div className="flex items-center justify-between gap-2 border-t border-[#EEEEEE] p-3">
                    <Button type="button" variant="outline" size="sm" onClick={handleClearDateRange}>
                      Clear
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-[#8DC63F] hover:bg-[#7DB62F] text-white"
                      onClick={handleApplyDateRange}
                      disabled={!dateRange?.from || !dateRange?.to}
                    >
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Row 1 — KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/students" className={`${kpiCardClass} block cursor-pointer`}>
                {kpiLoading ? (
                  <KpiCardSkeleton />
                ) : (
                  <>
                    <Users className="w-8 h-8 text-[#8DC63F] mb-3" />
                    <p className="text-sm text-gray-500">Total Students</p>
                    <p className="text-3xl font-bold text-[#3B82F6] mt-1">
                      {studentsCount.toLocaleString()}
                    </p>
                  </>
                )}
              </Link>

              <Link href="/admin/applications" className={`${kpiCardClass} block cursor-pointer`}>
                {kpiLoading ? (
                  <KpiCardSkeleton />
                ) : (
                  <>
                    <FileText className="w-8 h-8 text-[#8DC63F] mb-3" />
                    <p className="text-sm text-gray-500">Total Applications</p>
                    <p className="text-3xl font-bold text-[#3B82F6] mt-1">
                      {applicationsCount.toLocaleString()}
                    </p>
                  </>
                )}
              </Link>

              <div className={`${kpiCardClass} cursor-default`}>
                {kpiLoading ? (
                  <KpiCardSkeleton />
                ) : (
                  <>
                    <CheckCircle className="w-8 h-8 text-[#8DC63F] mb-3" />
                    <p className="text-sm text-gray-500">Acceptance Rate</p>
                    <p className="text-3xl font-bold text-[#3B82F6] mt-1">{acceptanceRate}%</p>
                  </>
                )}
              </div>

              <Link href="/admin/internships" className={`${kpiCardClass} block cursor-pointer`}>
                {kpiLoading ? (
                  <KpiCardSkeleton />
                ) : (
                  <>
                    <Briefcase className="w-8 h-8 text-[#8DC63F] mb-3" />
                    <p className="text-sm text-gray-500">Total Internships Listed</p>
                    <p className="text-3xl font-bold text-[#3B82F6] mt-1">
                      {internshipsCount.toLocaleString()}
                    </p>
                  </>
                )}
              </Link>
            </div>

            {/* Row 2 — Application Pipeline */}
            <div className={CARD_CLASS}>
              <h2 className="font-semibold text-base mb-6">Application pipeline</h2>
              <div className="overflow-x-auto pb-2">
                <div className="grid grid-cols-5 min-w-[640px]">
                  {pipelineStages.map((stage, index) => (
                    <div key={stage.label} className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center w-full h-12">
                        {index > 0 && (
                          <div className="absolute right-1/2 left-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#8DC63F]" />
                        )}
                        {index < pipelineStages.length - 1 && (
                          <div className="absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#8DC63F]" />
                        )}
                        <div className="relative z-10 w-12 h-12 rounded-full bg-[#8DC63F] text-white font-bold text-sm flex items-center justify-center">
                          {stage.count.toString().padStart(2, '0')}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 font-medium text-center leading-tight max-w-[72px] sm:max-w-none">
                        {stage.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3 — Chart + Top Internships */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={CARD_CLASS}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="font-semibold text-base">Applications submitted</h2>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                    className="border border-[#EEEEEE] rounded-lg px-3 py-2 text-sm bg-white w-full sm:w-auto"
                  >
                    <option value="this_week">This week</option>
                    <option value="this_month">This month</option>
                    <option value="last_3_months">Last 3 months</option>
                  </select>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % 2]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className={CARD_CLASS}>
                <h2 className="font-semibold text-base mb-6">Top internships</h2>
                {topInternships.length > 0 ? (
                  <div className="space-y-3">
                    {topInternships.map((item, index) => (
                      <div
                        key={`${item.internship?.title}-${index}`}
                        className="flex items-center justify-between gap-4 py-3 border-b border-[#EEEEEE] last:border-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.internship?.title || 'Untitled programme'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.internship?.country || 'Unknown country'}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-[#3B82F6] flex-shrink-0">
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No internship application data yet." />
                )}
              </div>
            </div>

            {/* Profile Completion */}
            <div className={CARD_CLASS}>
              <h2 className="font-semibold text-base mb-6">Student profile completion</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="min-h-[260px] w-full">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={profileCompletionChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={64}
                        outerRadius={96}
                        paddingAngle={profileCompletionStats.complete > 0 &&
                        profileCompletionStats.incomplete > 0
                          ? 2
                          : 0}
                      >
                        {profileCompletionChartData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={
                              entry.name === 'Complete'
                                ? PROFILE_COMPLETION_COLORS[0]
                                : PROFILE_COMPLETION_COLORS[1]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => Number(value ?? 0).toLocaleString()}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-[#F9F9F9] border border-[#EEEEEE] p-4">
                    <p className="text-sm text-gray-500">Total students</p>
                    <p className="text-3xl font-bold text-[#3B82F6] mt-1">
                      {totalProfiledStudents.toLocaleString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-[#F9F9F9] border border-[#EEEEEE] p-4">
                      <p className="text-sm text-gray-500">Complete</p>
                      <p className="text-2xl font-bold text-[#3B82F6] mt-1">
                        {profileCompletionStats.complete.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#F9F9F9] border border-[#EEEEEE] p-4">
                      <p className="text-sm text-gray-500">Incomplete</p>
                      <p className="text-2xl font-bold text-[#3B82F6] mt-1">
                        {profileCompletionStats.incomplete.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Overall completion rate:{' '}
                    <span className="font-semibold text-[#8DC63F]">
                      {profileCompletionRate}%
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-base mb-6">Recent applications</h2>
                {recentApplications.length > 0 ? (
                  <div className="space-y-3">
                    {recentApplications.map((application) => {
                      const studentName = [
                        application.student_profiles?.first_name,
                        application.student_profiles?.last_name,
                      ]
                        .filter(Boolean)
                        .join(' ')

                      return (
                        <Link
                          key={application.id}
                          href={`/admin/applications/${application.id}`}
                          className="block rounded-xl border border-[#EEEEEE] p-4 hover:border-[#8DC63F] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {studentName || 'Unknown student'}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {application.internships?.title || 'Internship'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatShortDate(application.submitted_at)}
                              </p>
                            </div>
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusBadgeClass(application.status)}`}
                            >
                              {formatStatusText(application.status)}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState message="No submitted applications yet." />
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
