'use client'

import { Mail, Phone } from 'lucide-react'
import { contactConfig } from '@/lib/config'

export default function SidebarHelpContact() {
  const help = contactConfig.sidebarHelp

  return (
    <div className="p-3">
      <div className="bg-gray-50 rounded-xl p-4 mx-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{help.heading}</h3>
        <p className="text-xs text-gray-500 mb-3">{help.body}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gr-primary flex-shrink-0" />
            <a
              href={`tel:${help.phone.replace(/\s/g, '')}`}
              className="text-gr-primary break-all hover:underline tabular-nums"
            >
              {help.phone}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gr-primary flex-shrink-0" />
            <a
              href={`mailto:${help.email}`}
              className="text-gr-primary break-all text-xs hover:underline"
            >
              {help.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
