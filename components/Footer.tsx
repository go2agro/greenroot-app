"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone } from 'lucide-react'
import appConfig from '@/config/appConfig.json'
import {
  contactConfig,
  getFormattedAddress,
  getPrimaryPhone,
  getPrimarySupportEmail,
} from '@/lib/config'

export default function Footer() {
  const supportEmail = getPrimarySupportEmail()
  const primaryPhone = getPrimaryPhone()
  const address = getFormattedAddress()

  return (
    <footer className="w-full bg-gr-background border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
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
            <Link href="/internships" className="text-sm text-gray-600 hover:text-gr-primary">
              Opportunities
            </Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gr-primary">
              About Us
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-gr-primary">
              Contact
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-gray-900">Account</h3>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gr-primary">
              Login
            </Link>
            <Link href="/signup" className="text-sm text-gray-600 hover:text-gr-primary">
              Signup
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-gray-900">Legal</h3>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-gr-primary">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-gr-primary">
              Privacy Policy
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-gray-900">Contact</h3>
            {supportEmail && (
              <a 
                href={`mailto:${supportEmail}`} 
                className="text-sm text-gray-600 hover:text-gr-primary flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {supportEmail}
              </a>
            )}
            {primaryPhone && (
              <a 
                href={`tel:${primaryPhone.tel}`} 
                className="text-sm text-gray-600 hover:text-gr-primary flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                {primaryPhone.display}
              </a>
            )}
            {address && (
              <p className="text-sm text-gray-600">{address}</p>
            )}
            {contactConfig.socials.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-1">
                {contactConfig.socials.map((social) => (
                  <Link
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-gr-primary"
                  >
                    {social.label}
                  </Link>
                ))}
              </div>
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
