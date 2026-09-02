'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, FileText, XCircle } from 'lucide-react'
import PartnerShell from '@/components/PartnerShell'
import { pageCopyConfig } from '@/lib/config'
import { getPartnerDashboardData } from '@/lib/partnerDashboard'

const partnerDashboardCopy = pageCopyConfig.partner.dashboard

const KPI_CARD_CLASS =
  'bg-white border border-gr-border rounded-2xl p-5 transition-colors hover:border-gr-primary'

function KpiCardSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="w-8 h-8 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="h-8 bg-gray-200 rounded w-16" />
    </div>
  )
}

export default function PartnerDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0 })

  useEffect(() => {
    async function loadDashboard() {
      const { data } = await getPartnerDashboardData()
      if (data?.stats) setStats(data.stats)
      setLoading(false)
    }

    loadDashboard()
  }, [])

  return (
    <PartnerShell activePage="dashboard">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">{partnerDashboardCopy.heading}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {partnerDashboardCopy.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/partner/applications" className={`${KPI_CARD_CLASS} block`}>
            {loading ? (
              <KpiCardSkeleton />
            ) : (
              <>
                <FileText className="w-8 h-8 text-gr-primary mb-3" />
                <p className="text-sm text-gray-500">{partnerDashboardCopy.statReceived}</p>
                <p className="text-3xl font-bold text-gr-secondary mt-1">
                  {stats.total.toLocaleString()}
                </p>
              </>
            )}
          </Link>

          <Link href="/partner/applications" className={`${KPI_CARD_CLASS} block`}>
            {loading ? (
              <KpiCardSkeleton />
            ) : (
              <>
                <CheckCircle className="w-8 h-8 text-gr-primary mb-3" />
                <p className="text-sm text-gray-500">{partnerDashboardCopy.statApproved}</p>
                <p className="text-3xl font-bold text-gr-secondary mt-1">
                  {stats.approved.toLocaleString()}
                </p>
              </>
            )}
          </Link>

          <Link href="/partner/applications" className={`${KPI_CARD_CLASS} block`}>
            {loading ? (
              <KpiCardSkeleton />
            ) : (
              <>
                <XCircle className="w-8 h-8 text-gr-primary mb-3" />
                <p className="text-sm text-gray-500">{partnerDashboardCopy.statRejected}</p>
                <p className="text-3xl font-bold text-gr-secondary mt-1">
                  {stats.rejected.toLocaleString()}
                </p>
              </>
            )}
          </Link>
        </div>
      </div>
    </PartnerShell>
  )
}
