"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

interface NavbarProps {
  activeLink?: 'about' | 'opportunities'
}

export default function Navbar({ activeLink }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const linkStyle = (link: string) =>
    `text-gray-700 hover:text-[#8DC63F] transition-colors ${
      activeLink === link ? 'border-b-2 border-[#8DC63F] pb-1' : ''
    }`

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/greenroot-logo.svg" 
              alt="GreenRoot" 
              width={32} 
              height={32}
              priority
            />
            <span className="text-xl font-bold text-gray-900">GreenRoot</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/internships" className={linkStyle('opportunities')}>
              Opportunities
            </Link>
            <Link href="/about" className={linkStyle('about')}>
              About Us
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/login" 
              className="bg-[#8DC63F] text-white rounded-lg px-4 py-2 hover:bg-[#7AB62F] transition-colors font-semibold"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:border-[#8DC63F] transition-colors"
            >
              Signup
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-[#8DC63F]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <Link 
                href="/internships" 
                className="text-gray-700 hover:text-[#8DC63F] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Opportunities
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-[#8DC63F] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <div className="flex flex-col gap-2 pt-4">
                <Link 
                  href="/login" 
                  className="bg-[#8DC63F] text-white rounded-lg px-4 py-2 text-center font-semibold"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 text-center"
                >
                  Signup
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
