"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import GreenRootWordmark from '@/components/GreenRootWordmark'
import { APP_LOGO, APP_NAME, BTN_LOGIN, BTN_SIGNUP, appConfig } from '@/lib/appConfig'
import { analyticsAttrs, analyticsNavAttrs } from '@/lib/analytics/attributes'

interface NavbarProps {
  activeLink?: 'about' | 'gallery' | 'internships' | 'contact'
}

function resolveActiveLink(
  pathname: string,
  activeLink?: NavbarProps['activeLink']
): NavbarProps['activeLink'] {
  if (activeLink) return activeLink
  if (pathname.startsWith('/internships')) return 'internships'
  if (pathname.startsWith('/gallery')) return 'gallery'
  if (pathname.startsWith('/about')) return 'about'
  if (pathname.startsWith('/contact')) return 'contact'
  return undefined
}

export default function Navbar({ activeLink }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const currentActiveLink = resolveActiveLink(pathname, activeLink)

  const getNavLinkClass = (link: string) =>
    currentActiveLink === link
      ? 'relative inline-flex items-center px-1 py-2 font-semibold text-gr-primary transition-colors'
      : 'relative inline-flex items-center px-1 py-2 text-gray-700 hover:text-gr-primary transition-colors'

  const getMobileNavLinkClass = (link: string) =>
    currentActiveLink === link
      ? 'py-2 font-semibold text-gr-primary'
      : 'py-2 text-gray-700 hover:text-gr-primary'

  const navLinks = appConfig.nav_links

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2" {...analyticsNavAttrs('public', 'home', 'Home')}>
            <Image 
              src={APP_LOGO} 
              alt={APP_NAME} 
              width={44} 
              height={44}
              priority
            />
            <GreenRootWordmark className="text-2xl" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={getNavLinkClass(link.key)}
                {...analyticsNavAttrs('public', link.key, link.label)}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-colors ${
                    currentActiveLink === link.key ? 'bg-gr-primary' : 'bg-transparent'
                  }`}
                />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/login" 
              className="bg-gr-primary text-white rounded-lg px-4 py-2 hover:bg-gr-primary-hover transition-colors font-semibold"
              {...analyticsAttrs({ id: 'public_nav_login', label: BTN_LOGIN, section: 'public_navigation', type: 'cta' })}
            >
              {BTN_LOGIN}
            </Link>
            <Link 
              href="/signup" 
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:border-gr-primary transition-colors"
              {...analyticsAttrs({ id: 'public_nav_signup', label: BTN_SIGNUP, section: 'public_navigation', type: 'cta' })}
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
                  className={getMobileNavLinkClass(link.key)}
                  onClick={() => setMobileMenuOpen(false)}
                  {...analyticsNavAttrs('public', link.key, link.label)}
                >
                  {link.label}
                </Link>
              ))}
              <Link 
                href="/login" 
                className="bg-gr-primary text-white rounded-lg px-4 py-2 text-center font-semibold"
                onClick={() => setMobileMenuOpen(false)}
                {...analyticsAttrs({ id: 'public_nav_login_mobile', label: BTN_LOGIN, section: 'public_navigation', type: 'cta' })}
              >
                {BTN_LOGIN}
              </Link>
              <Link 
                href="/signup" 
                className="border border-gray-300 rounded-lg px-4 py-2 text-center text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
                {...analyticsAttrs({ id: 'public_nav_signup_mobile', label: BTN_SIGNUP, section: 'public_navigation', type: 'cta' })}
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
