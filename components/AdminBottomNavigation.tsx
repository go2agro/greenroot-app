"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  BarChart2,
  User,
  Bell,
} from 'lucide-react'

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { id: 'applications', icon: FileText, label: 'Applications', href: '/admin/applications' },
  { id: 'internships', icon: Briefcase, label: 'Internships', href: '/admin/internships' },
  { id: 'students', icon: Users, label: 'Students', href: '/admin/students' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics', href: '/admin/analytics' },
  { id: 'profile', icon: User, label: 'Profile', href: '/admin/profile' },
  { id: 'notifications', icon: Bell, label: 'Alerts', href: '/admin/notifications' },
]

function isNavItemActive(pathname: string, href: string) {
  if (href === '/admin/dashboard') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AdminBottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EEEEEE] lg:hidden z-50 safe-area-inset-bottom">
      <nav className="flex items-center justify-around px-1 py-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = isNavItemActive(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive ? 'text-[#8DC63F]' : 'text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#8DC63F]' : ''}`} />
              <span
                className={`text-[10px] font-medium truncate max-w-full ${
                  isActive ? 'text-[#8DC63F]' : 'text-gray-600'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
