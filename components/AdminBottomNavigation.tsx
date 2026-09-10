"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, User, Bell } from 'lucide-react'
import { analyticsNavAttrs } from '@/lib/analytics/attributes'

export default function AdminBottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { id: 'applications', icon: FileText, label: 'Applications', href: '/admin/applications' },
    { id: 'students', icon: Users, label: 'Students', href: '/admin/students' },
    { id: 'profile', icon: User, label: 'Profile', href: '/admin/profile' },
    { id: 'notifications', icon: Bell, label: 'Alerts', href: '/admin/notifications' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 safe-area-inset-bottom">
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              {...analyticsNavAttrs('admin', item.id, item.label)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive 
                  ? 'text-gr-primary' 
                  : 'text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-gr-primary' : ''}`} />
              <span className={`text-xs font-medium truncate max-w-full ${
                isActive ? 'text-gr-primary' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
