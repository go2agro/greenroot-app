"use client"

import { useEffect, useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import AdminBottomNavigation from '@/components/AdminBottomNavigation'
import { pageCopyConfig } from '@/lib/config'
import { BTN_EXPORT_REPORT } from '@/lib/appConfig'
import { getBillingHistory, getMonthlyBillingReport } from '@/lib/adminDashboard'

const billingCopy = pageCopyConfig.admin.billing

type MonthlyReport = {
  billing_period?: string
  total_submitted?: number
  base_retainer?: number
  volume_fee?: number
  tier?: string
  total_payable?: number
}

type HistoryRow = {
  month: string
  year: number
  total_submitted: number
  tier: string
  base_retainer: number
  volume_fee: number
  total_payable: number
}

export default function AdminBilling() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentReport, setCurrentReport] = useState<MonthlyReport | null>(null)
  const [history, setHistory] = useState<HistoryRow[]>([])

  useEffect(() => {
    async function loadBilling() {
      setLoading(true)
      const [currentResult, historyResult] = await Promise.all([
        getMonthlyBillingReport(),
        getBillingHistory(6),
      ])

      setCurrentReport((currentResult.data as MonthlyReport | null) ?? null)
      setHistory((historyResult.data as HistoryRow[] | null) ?? [])
      setLoading(false)
    }

    loadBilling()
  }, [])

  const formatCurrency = (value?: number) =>
    value != null ? `₹${value.toLocaleString('en-IN')}` : '—'

  const handleExportReport = () => {
    if (!currentReport) return

    const rows = [
      [billingCopy.tableHeaders.month, billingCopy.tableHeaders.visaApplications, billingCopy.tableHeaders.tier, billingCopy.tableHeaders.baseRetainer, billingCopy.tableHeaders.volumeFee, billingCopy.tableHeaders.totalPayable],
      [
        currentReport.billing_period ?? '',
        String(currentReport.total_submitted ?? 0),
        currentReport.tier ?? '',
        formatCurrency(currentReport.base_retainer),
        formatCurrency(currentReport.volume_fee),
        formatCurrency(currentReport.total_payable),
      ],
      ...history.map((row) => [
        `${row.month} ${row.year}`,
        String(row.total_submitted),
        row.tier,
        formatCurrency(row.base_retainer),
        formatCurrency(row.volume_fee),
        formatCurrency(row.total_payable),
      ]),
    ]

    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'billing-report.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen bg-gr-background overflow-hidden">
      <div className="hidden lg:block">
        <AdminSidebar
          activePage="billing"
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-bold text-2xl text-gray-900">{billingCopy.heading}</h1>
              <p className="text-sm text-gray-500 mt-1">{billingCopy.subheading}</p>
            </div>
            <button
              type="button"
              onClick={handleExportReport}
              disabled={loading || !currentReport}
              className="bg-gr-primary text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-gr-primary-hover transition-colors disabled:opacity-50"
            >
              {BTN_EXPORT_REPORT}
            </button>
          </div>

          <div className="bg-white border border-gr-border rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-lg text-gray-900">{billingCopy.currentMonthHeading}</h2>
            <p className="text-sm text-gray-500 mt-1 mb-4">{billingCopy.billingBasisNote}</p>

            {loading ? (
              <div className="h-24 animate-pulse bg-gray-100 rounded-xl" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-gr-background border border-gr-border p-4">
                  <p className="text-xs text-gray-500">{billingCopy.tableHeaders.month}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{currentReport?.billing_period ?? '—'}</p>
                </div>
                <div className="rounded-xl bg-gr-background border border-gr-border p-4">
                  <p className="text-xs text-gray-500">{billingCopy.tableHeaders.visaApplications}</p>
                  <p className="text-lg font-bold text-gr-secondary mt-1">{currentReport?.total_submitted ?? 0}</p>
                </div>
                <div className="rounded-xl bg-gr-background border border-gr-border p-4">
                  <p className="text-xs text-gray-500">{billingCopy.tableHeaders.tier}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{currentReport?.tier ?? '—'}</p>
                </div>
                <div className="rounded-xl bg-gr-background border border-gr-border p-4">
                  <p className="text-xs text-gray-500">{billingCopy.tableHeaders.totalPayable}</p>
                  <p className="text-lg font-bold text-gr-primary mt-1">{formatCurrency(currentReport?.total_payable)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-gr-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gr-border">
              <h2 className="font-semibold text-lg text-gray-900">{billingCopy.historyHeading}</h2>
              <p className="text-sm text-gray-500 mt-1">{billingCopy.historySubheading}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gr-background text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left">{billingCopy.tableHeaders.month}</th>
                    <th className="px-6 py-3 text-left">{billingCopy.tableHeaders.visaApplications}</th>
                    <th className="px-6 py-3 text-left">{billingCopy.tableHeaders.tier}</th>
                    <th className="px-6 py-3 text-left">{billingCopy.tableHeaders.baseRetainer}</th>
                    <th className="px-6 py-3 text-left">{billingCopy.tableHeaders.volumeFee}</th>
                    <th className="px-6 py-3 text-left">{billingCopy.tableHeaders.totalPayable}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading...</td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No billing history available.</td>
                    </tr>
                  ) : (
                    history.map((row) => (
                      <tr key={`${row.month}-${row.year}`} className="border-t border-gr-border">
                        <td className="px-6 py-4 font-medium text-gray-900">{row.month} {row.year}</td>
                        <td className="px-6 py-4 text-gray-700">{row.total_submitted}</td>
                        <td className="px-6 py-4 text-gray-700">{row.tier}</td>
                        <td className="px-6 py-4 text-gray-700">{formatCurrency(row.base_retainer)}</td>
                        <td className="px-6 py-4 text-gray-700">{formatCurrency(row.volume_fee)}</td>
                        <td className="px-6 py-4 font-semibold text-gr-primary">{formatCurrency(row.total_payable)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AdminBottomNavigation />
    </div>
  )
}
