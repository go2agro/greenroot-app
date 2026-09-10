"use client"

import Link from 'next/link'
import Image from 'next/image'
import { appConfig } from '@/lib/appConfig'
import { footerConfig } from '@/lib/config'
import { analyticsAttrs } from '@/lib/analytics/attributes'

export default function Footer() {
  return (
    <footer className="w-full bg-gr-background border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-2"
              {...analyticsAttrs({
                id: 'footer_home',
                label: 'Home',
                section: 'footer',
                type: 'nav_link',
              })}
            >
              <Image
                src={appConfig.app_logo}
                alt={appConfig.app_name}
                width={32}
                height={32}
              />
              <span className="text-xl font-bold text-gray-900">{appConfig.app_name}</span>
            </Link>
            <p className="text-sm text-gray-600">{footerConfig.tagline}</p>
          </div>

          {footerConfig.columns
            .filter((column) => column.id !== 'brand')
            .map((column) => (
              <div key={column.id} className="flex flex-col gap-3">
                <h3 className="font-bold text-gray-900">{column.heading}</h3>
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    target={'external' in link && link.external ? '_blank' : undefined}
                    rel={'external' in link && link.external ? 'noopener noreferrer' : undefined}
                    className="text-sm text-gray-600 hover:text-gr-primary"
                    {...analyticsAttrs({
                      id: `footer_${column.id}_${link.label.toLowerCase().replace(/\s+/g, '_')}`,
                      label: link.label,
                      section: 'footer',
                      type: 'external' in link && link.external ? 'outbound_link' : 'nav_link',
                    })}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            {footerConfig.copyright}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4">
            {footerConfig.legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-gray-400 hover:text-gr-primary"
                {...analyticsAttrs({
                  id: `footer_legal_${link.label.toLowerCase().replace(/\s+/g, '_')}`,
                  label: link.label,
                  section: 'footer_legal',
                  type: 'nav_link',
                })}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
