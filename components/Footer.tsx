"use client"

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer id="contact" className="w-full bg-[#F8F9FA] border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
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
            <h3 className="font-bold text-gray-900">About Us</h3>
            <Link href="/#about" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              Our Mission
            </Link>
            <Link href="/#about" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              Team
            </Link>
            <Link href="/#about" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              Impact Reports
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-gray-900">Quick Links</h3>
            <Link href="/internships" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              Find Internships
            </Link>
            <Link href="/student/library" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              Learning Hub
            </Link>
            <Link href="/#contact" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              For Employers
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-gray-900">Resources</h3>
            <Link href="/#learning" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              Student Guide
            </Link>
            <Link href="/#learning" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              Career Blog
            </Link>
            <Link href="/#contact" className="text-sm text-gray-600 hover:text-[#8DC63F]">
              Support
            </Link>
            <div className="flex items-center gap-3 mt-2">
              <Link href="#" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-[#8DC63F] hover:text-white flex items-center justify-center text-xs font-bold text-gray-600 transition-colors">
                in
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-[#8DC63F] hover:text-white flex items-center justify-center text-xs font-bold text-gray-600 transition-colors">
                𝕏
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-[#8DC63F] hover:text-white flex items-center justify-center text-xs font-bold text-gray-600 transition-colors">
                IG
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            © 2026 GreenRoot Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-gray-400 hover:text-[#8DC63F]">
              Privacy Policy
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="#" className="text-xs text-gray-400 hover:text-[#8DC63F]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
