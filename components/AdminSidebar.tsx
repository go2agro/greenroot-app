"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  User,
  Bell,
  HelpCircle,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import NotificationBadge from '@/components/NotificationBadge'
import { getUnreadCount } from '@/lib/notifications'

interface AdminSidebarProps {
  activePage?: string
  isCollapsed?: boolean
  onToggle?: () => void
  unreadRefreshKey?: number
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { id: 'applications', icon: FileText, label: 'Applications', href: '/admin/applications' },
  { id: 'internships', icon: Briefcase, label: 'Internships', href: '/admin/internships' },
  { id: 'students', icon: Users, label: 'Students', href: '/admin/students' },
  { id: 'profile', icon: User, label: 'Profile', href: '/admin/profile' },
  { id: 'notifications', icon: Bell, label: 'Notifications', href: '/admin/notifications' },
]

export default function AdminSidebar({
  activePage,
  isCollapsed = false,
  onToggle,
  unreadRefreshKey = 0,
}: AdminSidebarProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supportEmail = 'greenroot@gmail.com'
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodeURIComponent('GreenRoot Support')}`

  useEffect(() => {
    let isActive = true

    async function loadUnreadCount() {
      const { data } = await getUnreadCount()
      if (isActive) setUnreadCount(data?.count || 0)
    }

    loadUnreadCount()

    return () => {
      isActive = false
    }
  }, [unreadRefreshKey])

  return (
    <div
      className={`h-screen bg-white border-r border-[#EEEEEE] flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-[220px]'
      }`}
    >
      <div className="p-4 border-b border-[#EEEEEE]">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <Link href="/admin/dashboard" className="cursor-pointer hover:opacity-80 transition-opacity">
              <Image src="/greenroot-logo.svg" alt="GreenRoot" width={32} height={32} />
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Image src="/greenroot-logo.svg" alt="GreenRoot" width={32} height={32} />
              <span className="text-xl font-bold text-[#8DC63F]">GreenRoot</span>
            </Link>
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          const isNotifications = item.id === 'notifications'

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#8DC63F] text-white font-medium'
                  : 'text-[#555555] hover:bg-gray-100'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className="relative flex-shrink-0">
                <Icon className="w-5 h-5" />
                {isNotifications && <NotificationBadge count={unreadCount} />}
              </span>
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {!isCollapsed && (
        <div className="p-3">
          <div className="bg-gray-50 rounded-xl p-4 mx-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Need help?</h3>
            <p className="text-xs text-gray-500 mb-3">
              Here&apos;s our contact number and email address
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[#8DC63F] flex-shrink-0" />
                <span className="text-[#8DC63F] break-all">1234567890</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[#8DC63F] flex-shrink-0" />
                <a
                  href={gmailComposeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8DC63F] break-all text-xs hover:underline"
                >
                  {supportEmail}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="p-4 border-t border-[#EEEEEE] flex justify-center">
          <button className="text-gray-600 hover:text-[#8DC63F] transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
