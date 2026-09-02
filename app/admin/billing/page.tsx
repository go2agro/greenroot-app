"use client"

import { pageCopyConfig } from '@/lib/config'

const billingCopy = pageCopyConfig.admin.billing

export default function AdminBilling() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-bold text-2xl text-gray-900">{billingCopy.heading}</h1>
      <p className="text-sm text-gray-500 mt-1">{billingCopy.subheading}</p>
    </div>
  )
}
