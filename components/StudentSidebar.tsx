"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, User, Bell, HelpCircle, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import NotificationBadge from '@/components/NotificationBadge'
import SidebarHelpContact from '@/components/SidebarHelpContact'
import { getUnreadCount } from '@/lib/notifications'

interface StudentSidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  activePage?: string
  unreadRefreshKey?: number
}

export default function StudentSidebar({
  isCollapsed = false,
  onToggle,
  activePage,
  unreadRefreshKey = 0,
}: StudentSidebarProps) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/student/dashboard' },
    { id: 'internships', icon: Briefcase, label: 'Internships', href: '/student/internships' },
    { id: 'applications', icon: FileText, label: 'Applications', href: '/student/applications' },
    { id: 'profile', icon: User, label: 'Profile', href: '/student/profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications', href: '/student/notifications' },
  ]

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
      className={`h-screen bg-white border-r border-gr-border flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-[220px]'
      }`}
    >
      {/* Logo and Toggle */}
      <div className="p-4 border-b border-gr-border">
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
            <Link href="/student/dashboard" className="cursor-pointer hover:opacity-80 transition-opacity">
              <Image 
                src="/greenroot-logo.svg" 
                alt="GreenRoot" 
                width={32} 
                height={32}
              />
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Link href="/student/dashboard" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Image 
                src="/greenroot-logo.svg" 
                alt="GreenRoot" 
                width={32} 
                height={32}
              />
              <span className="text-xl font-bold text-gr-primary">GreenRoot</span>
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage ? activePage === item.id : pathname === item.href
          const isNotifications = item.id === 'notifications'

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-gr-primary text-white font-medium' 
                  : 'text-[#555555] hover:bg-gray-100'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className="relative flex-shrink-0">
                <Icon className="w-5 h-5" />
                {isNotifications && <NotificationBadge count={unreadCount} />}
              </span>
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Help Section */}
      {!isCollapsed && <SidebarHelpContact />}

      {/* Help Icon for Collapsed */}
      {isCollapsed && (
        <div className="p-4 border-t border-gr-border flex justify-center">
          <button className="text-gray-600 hover:text-gr-primary transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
