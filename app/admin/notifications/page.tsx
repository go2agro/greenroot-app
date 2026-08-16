'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CheckCircle,
  FileText,
  Send,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '@/components/AdminSidebar'
import AdminBottomNavigation from '@/components/AdminBottomNavigation'
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '@/lib/notifications'
import { getMyAdminProfile } from '@/lib/adminProfiles'
import { getMyProfile } from '@/lib/profiles'

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  category?: string | null
  related_id?: string | null
  related_type?: string | null
}

type FilterKey = 'all' | 'unread' | 'application' | 'students' | 'system'
type DateGroup = 'Today' | 'Yesterday' | 'Earlier this week' | 'Earlier'

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'application', label: 'Applications' },
  { key: 'students', label: 'Students' },
  { key: 'system', label: 'System' },
]

const DATE_GROUP_ORDER: DateGroup[] = [
  'Today',
  'Yesterday',
  'Earlier this week',
  'Earlier',
]

function getNotificationIcon(type: string): {
  Icon: LucideIcon
  wrapperClass: string
  iconClass: string
} {
  switch (type) {
    case 'new_application_received':
      return {
        Icon: FileText,
        wrapperClass: 'bg-[#E8F5D6]',
        iconClass: 'text-[#8DC63F]',
      }
    case 'new_student_registered':
      return {
        Icon: UserPlus,
        wrapperClass: 'bg-[#E0EEFF]',
        iconClass: 'text-blue-500',
      }
    case 'application_submitted':
      return {
        Icon: Send,
        wrapperClass: 'bg-[#E8F5D6]',
        iconClass: 'text-[#8DC63F]',
      }
    case 'offer_accepted':
      return {
        Icon: CheckCircle,
        wrapperClass: 'bg-[#E8F5D6]',
        iconClass: 'text-[#8DC63F]',
      }
    case 'message_from_greenroot':
      return {
        Icon: FileText,
        wrapperClass: 'bg-[#E0EEFF]',
        iconClass: 'text-blue-400',
      }
    default:
      return {
        Icon: Bell,
        wrapperClass: 'bg-gray-100',
        iconClass: 'text-gray-400',
      }
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = Math.max(0, now.getTime() - date.getTime())
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `${Math.max(1, diffMins)} min ago`
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  if (date >= startOfYesterday && date < startOfToday) {
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    return `Yesterday, ${time}`
  }

  return `${Math.max(1, diffDays)} day${diffDays === 1 ? '' : 's'} ago`
}

function getDateGroup(dateString: string): DateGroup {
  const date = new Date(dateString)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

  if (date >= startOfToday) return 'Today'
  if (date >= startOfYesterday) return 'Yesterday'
  if (date >= startOfWeek) return 'Earlier this week'
  return 'Earlier'
}

function isStudentNotification(item: NotificationItem) {
  return item.category === 'system' && item.type === 'new_student_registered'
}

function filterNotifications(
  items: NotificationItem[],
  filter: FilterKey
): NotificationItem[] {
  if (filter === 'all') return items
  if (filter === 'unread') return items.filter((item) => !item.is_read)
  if (filter === 'application') {
    return items.filter((item) => item.category === 'application')
  }
  if (filter === 'students') {
    return items.filter(isStudentNotification)
  }
  return items.filter((item) => item.category === 'system')
}

export default function AdminNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [unreadRefreshKey, setUnreadRefreshKey] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [uniqueId, setUniqueId] = useState('')
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadPage() {
      setIsLoading(true)

      const [notifResult, profileResult, myProfileResult] = await Promise.all([
        getMyNotifications(),
        getMyAdminProfile(),
        getMyProfile(),
      ])

      if (!isActive) return

      const list = (notifResult.data ?? []) as NotificationItem[]
      setNotifications(list)
      setFilteredNotifications(filterNotifications(list, 'all'))

      const adminProfile = profileResult.data
      setFirstName(adminProfile?.first_name?.trim() || '')
      setLastName(adminProfile?.last_name?.trim() || '')
      setUniqueId(myProfileResult.data?.unique_id || '')
      setIsLoading(false)
    }

    loadPage()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    setFilteredNotifications(filterNotifications(notifications, activeFilter))
  }, [notifications, activeFilter])

  const hasUnread = useMemo(
    () => notifications.some((item) => !item.is_read),
    [notifications]
  )

  const filterCounts = useMemo(
    () => ({
      all: notifications.length,
      unread: notifications.filter((item) => !item.is_read).length,
      application: notifications.filter((item) => item.category === 'application').length,
      students: notifications.filter(isStudentNotification).length,
      system: notifications.filter((item) => item.category === 'system').length,
    }),
    [notifications]
  )

  const groupedNotifications = useMemo(() => {
    const groups: Record<DateGroup, NotificationItem[]> = {
      Today: [],
      Yesterday: [],
      'Earlier this week': [],
      Earlier: [],
    }

    for (const item of filteredNotifications) {
      groups[getDateGroup(item.created_at)].push(item)
    }

    return DATE_GROUP_ORDER.filter((group) => groups[group].length > 0).map((group) => ({
      label: group,
      items: groups[group],
    }))
  }, [filteredNotifications])

  const displayName =
    [firstName, lastName].filter(Boolean).join(' ') || 'Admin'
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'A'

  const handleFilterChange = (tabKey: FilterKey) => {
    setActiveFilter(tabKey)
  }

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.is_read) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item
        )
      )

      const { error } = await markAsRead(notification.id)
      if (error) {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, is_read: false } : item
          )
        )
      } else {
        await getUnreadCount()
        setUnreadRefreshKey((key) => key + 1)
      }
    }

    if (notification.related_id) {
      router.push(`/admin/applications/${notification.related_id}`)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!hasUnread || isMarkingAllRead) return

    setIsMarkingAllRead(true)
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))

    const { error } = await markAllAsRead()

    if (error) {
      const result = await getMyNotifications()
      setNotifications((result.data ?? []) as NotificationItem[])
      toast.error('Failed to mark all as read')
    } else {
      await getUnreadCount()
      setUnreadRefreshKey((key) => key + 1)
    }

    setIsMarkingAllRead(false)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:block">
        <AdminSidebar
          activePage="notifications"
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          unreadRefreshKey={unreadRefreshKey}
        />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 ml-auto flex-shrink-0">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {displayName}
                </p>
                <p className="text-[#8DC63F] text-sm">{uniqueId || 'N/A'}</p>
              </div>
              <div className="rounded-full w-10 h-10 bg-[#3B82F6] flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{initials}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="font-bold text-2xl text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage their account, security, and communication preferences.
              </p>
            </div>
            {hasUnread && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead}
                className="self-start rounded-lg border border-[#8DC63F] px-4 py-2 text-sm font-medium text-[#8DC63F] hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isMarkingAllRead ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
          </div>

          <div className="flex gap-3 flex-nowrap sm:flex-wrap mb-6 overflow-x-auto pb-1 -mx-1 px-1">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key
              const count = filterCounts[tab.key]

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleFilterChange(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'bg-[#8DC63F] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8DC63F] hover:text-[#8DC63F]'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              )
            })}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="border border-[#EEEEEE] rounded-2xl p-4 bg-white animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-gray-200 rounded" />
                      <div className="h-3 w-2/3 bg-gray-100 rounded" />
                    </div>
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">No notifications</p>
              <p className="text-sm text-gray-400">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div>
              {groupedNotifications.map((group, groupIndex) => (
                <div key={group.label}>
                  <h2
                    className={`font-semibold text-sm text-gray-500 mb-3 ${
                      groupIndex === 0 ? 'mt-0' : 'mt-6'
                    }`}
                  >
                    {group.label}
                  </h2>
                  <div>
                    {group.items.map((notification) => {
                      const { Icon, wrapperClass, iconClass } = getNotificationIcon(
                        notification.type
                      )
                      const isUnread = !notification.is_read

                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left border border-[#EEEEEE] rounded-2xl p-4 mb-3 flex items-start gap-4 cursor-pointer transition-colors ${
                            isUnread ? 'bg-white' : 'bg-[#FAFAFA]'
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${wrapperClass}`}
                          >
                            <Icon className={`w-5 h-5 ${iconClass}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm text-gray-900 ${
                                isUnread ? 'font-bold' : 'font-semibold'
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {formatRelativeTime(notification.created_at)}
                            </span>
                            {isUnread && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AdminBottomNavigation />
    </div>
  )
}
