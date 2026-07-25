"use client"

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="w-full bg-[#F8F9FA] border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/greenroot-logo.svg" 
                alt="GreenRoot" 
                width={32} 
                height={32}
              />
              <span className="text-xl font-bold text-gray-900">GreenRoot</span>
            </Link>
            <p className="text-sm text-gray-600">
              Cultivating the next generation of agricultural leaders through 
              immersive learning and technology.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-gray-900">Explore</h3>
            <Link href="/internships" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              Opportunities
            </Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              About Us
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              Contact
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-gray-900">Account</h3>
            <Link href="/login" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              Login
            </Link>
            <Link href="/signup" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              Signup
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            © 2026 GreenRoot Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
