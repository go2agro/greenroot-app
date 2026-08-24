'use client'

import { Mail, Phone } from 'lucide-react'
import {
  getGmailComposeUrl,
  getPrimaryPhone,
  getPrimarySupportEmail,
} from '@/lib/config'

export default function SidebarHelpContact() {
  const supportEmail = getPrimarySupportEmail()
  const primaryPhone = getPrimaryPhone()
  const gmailComposeUrl = getGmailComposeUrl(supportEmail)

  return (
    <div className="p-3">
      <div className="bg-gray-50 rounded-xl p-4 mx-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Need help?</h3>
        <p className="text-xs text-gray-500 mb-3">
          Here&apos;s our contact number and email address
        </p>
        <div className="space-y-2">
          {primaryPhone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-[#8DC63F] flex-shrink-0" />
              <a
                href={`tel:${primaryPhone.tel}`}
                className="text-[#8DC63F] break-all hover:underline tabular-nums"
              >
                {primaryPhone.display}
              </a>
            </div>
          )}
          {supportEmail && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-[#8DC63F] flex-shrink-0" />
              <a
                href={gmailComposeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8DC63F] break-all text-xs hover:underline"
              >
                {supportEmail}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
