'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, CheckCircle, FileText, type LucideIcon } from 'lucide-react'
import PartnerShell from '@/components/PartnerShell'
import { NotificationPressable } from '@/components/NotificationPressable'
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from '@/lib/notifications'

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  category?: string | null
}

type FilterKey = 'all' | 'unread' | 'application' | 'system'

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'application', label: 'Applications' },
  { key: 'system', label: 'System' },
]

function getNotificationIcon(type: string): {
  Icon: LucideIcon
  wrapperClass: string
  iconClass: string
} {
  switch (type) {
    case 'application_approved':
      return {
        Icon: CheckCircle,
        wrapperClass: 'bg-[#E8F5D6]',
        iconClass: 'text-[#8DC63F]',
      }
    default:
      return {
        Icon: FileText,
        wrapperClass: 'bg-[#E0EEFF]',
        iconClass: 'text-blue-400',
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

  if (diffMins < 60) return `${Math.max(1, diffMins)} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  return `${Math.max(1, diffDays)} day${diffDays === 1 ? '' : 's'} ago`
}

function filterNotifications(items: NotificationItem[], filter: FilterKey) {
  if (filter === 'all') return items
  if (filter === 'unread') return items.filter((item) => !item.is_read)
  if (filter === 'application') return items.filter((item) => item.category === 'application')
  return items.filter((item) => item.category === 'system')
}

export default function PartnerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [unreadRefreshKey, setUnreadRefreshKey] = useState(0)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

  useEffect(() => {
    async function loadNotifications() {
      const { data } = await getMyNotifications()
      setNotifications((data ?? []) as NotificationItem[])
      setIsLoading(false)
    }

    loadNotifications()
  }, [])

  const filteredNotifications = useMemo(
    () => filterNotifications(notifications, activeFilter),
    [notifications, activeFilter]
  )

  const hasUnread = useMemo(
    () => notifications.some((item) => !item.is_read),
    [notifications]
  )

  const filterCounts = useMemo(
    () => ({
      all: notifications.length,
      unread: notifications.filter((item) => !item.is_read).length,
      application: notifications.filter((item) => item.category === 'application').length,
      system: notifications.filter((item) => item.category === 'system').length,
    }),
    [notifications]
  )

  async function handleNotificationClick(notification: NotificationItem) {
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
        setUnreadRefreshKey((key) => key + 1)
      }
    }
  }

  function handleNotificationDeleted(notificationId: string) {
    setNotifications((prev) => prev.filter((item) => item.id !== notificationId))
    setUnreadRefreshKey((key) => key + 1)
  }

  async function handleMarkAllAsRead() {
    if (!hasUnread || isMarkingAllRead) return

    setIsMarkingAllRead(true)
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))

    const { error } = await markAllAsRead()
    if (error) {
      const result = await getMyNotifications()
      setNotifications((result.data ?? []) as NotificationItem[])
    } else {
      setUnreadRefreshKey((key) => key + 1)
    }

    setIsMarkingAllRead(false)
  }

  return (
    <PartnerShell
      activePage="notifications"
      pageTitle="Notifications"
      pageSubtitle="Stay updated on your assigned applications"
      unreadRefreshKey={unreadRefreshKey}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        {hasUnread && (
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllRead}
              className="rounded-lg border border-[#8DC63F] px-4 py-2 text-sm font-medium text-[#8DC63F] hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              {isMarkingAllRead ? 'Marking...' : 'Mark all as read'}
            </button>
          </div>
        )}

        <div className="flex gap-3 flex-nowrap sm:flex-wrap mb-6 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-[#8DC63F] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8DC63F] hover:text-[#8DC63F]'
                }`}
              >
                {tab.label} ({filterCounts[tab.key]})
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="border border-[#EEEEEE] rounded-2xl p-4 bg-white animate-pulse h-20"
              />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center bg-white border border-[#EEEEEE] rounded-2xl">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No notifications</p>
            <p className="text-sm text-gray-400">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const { Icon, wrapperClass, iconClass } = getNotificationIcon(notification.type)

              return (
                <NotificationPressable
                  key={notification.id}
                  notificationId={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  onDeleted={handleNotificationDeleted}
                  timestamp={formatRelativeTime(notification.created_at)}
                  className={`border border-[#EEEEEE] rounded-2xl p-4 transition-colors ${
                    !notification.is_read ? 'border-l-4 border-l-[#8DC63F] bg-white' : 'bg-white'
                  } hover:border-[#8DC63F]`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${wrapperClass}`}>
                    <Icon className={`w-5 h-5 ${iconClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                  </div>
                </NotificationPressable>
              )
            })}
          </div>
        )}
      </div>
    </PartnerShell>
  )
}
