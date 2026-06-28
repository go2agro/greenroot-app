"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, User, Bell, HelpCircle, Mail, Phone, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'

interface StudentSidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export default function StudentSidebar({ isCollapsed = false, onToggle }: StudentSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/student/dashboard' },
    { icon: Briefcase, label: 'Internships', href: '/student/internships' },
    { icon: FileText, label: 'Applications', href: '/student/applications' },
    { icon: User, label: 'Profile', href: '/student/profile' },
    { icon: Bell, label: 'Notifications', href: '/student/notifications' },
  ]

  return (
    <div 
      className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo and Toggle */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image 
              src="/greenroot-logo.svg" 
              alt="GreenRoot" 
              width={32} 
              height={32}
            />
            {!isCollapsed && (
              <span className="text-xl font-bold text-[#8DC63F]">GreenRoot</span>
            )}
          </div>
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#8DC63F] text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Help Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Need help?</h3>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Here's our contact number and email address
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <Phone className="w-4 h-4 text-[#8DC63F]" />
                <span>1234567890</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <Mail className="w-4 h-4 text-[#8DC63F]" />
                <span>greenroot@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Icon for Collapsed */}
      {isCollapsed && (
        <div className="p-4 border-t border-gray-200 flex justify-center">
          <button className="text-gray-600 hover:text-[#8DC63F] transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
