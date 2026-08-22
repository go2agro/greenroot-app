"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone } from 'lucide-react'
import appConfig from '@/config/appConfig.json'

export default function Footer() {
  return (
    <footer className="w-full bg-[#F8F9FA] border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src={appConfig.app_logo}
                alt={appConfig.app_name}
                width={32} 
                height={32}
              />
              <span className="text-xl font-bold text-gray-900">{appConfig.app_name}</span>
            </Link>
            <p className="text-sm text-gray-600">
              {appConfig.footer_tagline}
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

          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-gray-900">Contact</h3>
            {appConfig.contact_email && (
              <a 
                href={`mailto:${appConfig.contact_email}`} 
                className="text-sm text-gray-600 hover:text-[#8DC63F] flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {appConfig.contact_email}
              </a>
            )}
            {appConfig.contact_phone && (
              <a 
                href={`tel:${appConfig.contact_phone.replace(/\s/g, '')}`} 
                className="text-sm text-gray-600 hover:text-[#8DC63F] flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                {appConfig.contact_phone}
              </a>
            )}
            {appConfig.contact_address && (
              <p className="text-sm text-gray-600">{appConfig.contact_address}</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            {appConfig.footer_text}
          </p>
        </div>
      </div>
    </footer>
  )
}
