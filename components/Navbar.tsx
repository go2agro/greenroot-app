"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { APP_LOGO, APP_NAME, BTN_LOGIN, BTN_SIGNUP, appConfig } from '@/lib/appConfig'

interface NavbarProps {
  activeLink?: 'about' | 'opportunities' | 'contact' | 'learning'
}

export default function Navbar({ activeLink }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const linkStyle = (link: string) =>
    `text-gray-700 hover:text-gr-primary transition-colors ${
      activeLink === link ? 'border-b-2 border-gr-primary pb-1' : ''
    }`

  const navLinks = appConfig.nav_links

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src={APP_LOGO} 
              alt={APP_NAME} 
              width={32} 
              height={32}
              priority
            />
            <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={linkStyle(link.key)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/login" 
              className="bg-gr-primary text-white rounded-lg px-4 py-2 hover:bg-gr-primary-hover transition-colors font-semibold"
            >
              {BTN_LOGIN}
            </Link>
            <Link 
              href="/signup" 
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:border-gr-primary transition-colors"
            >
              {BTN_SIGNUP}
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gr-primary"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="text-gray-700 hover:text-gr-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link 
                href="/login" 
                className="bg-gr-primary text-white rounded-lg px-4 py-2 text-center font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {BTN_LOGIN}
              </Link>
              <Link 
                href="/signup" 
                className="border border-gray-300 rounded-lg px-4 py-2 text-center text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {BTN_SIGNUP}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
