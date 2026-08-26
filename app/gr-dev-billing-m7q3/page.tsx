'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { type DateRange } from 'react-day-picker'
import {
  KeyRound,
  Loader2,
  ShieldAlert,
  CalendarDays,
  FileText,
  IndianRupee,
  Receipt,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  verifyDevSecretKey,
  getVisaProcessedApplicationsByDateRange,
} from '@/lib/devBilling'
import {
  BASE_PLATFORM_RETAINER,
  COMMISSION_TIERS,
  calculateCommission,
  formatInr,
  getCurrentMonthRange,
} from '@/lib/devBilling.shared'

type ProcessedApplication = {
  id: string
  status: string
  visa_started_at: string
  internship_title: string
  internship_location: string
  student_name: string
  student_id: string
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('default', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function createDefaultDateRange(): DateRange {
  const { startDate, endDate } = getCurrentMonthRange()
  return { from: startDate, to: endDate }
}

export default function DevBillingPage() {
  const [secretKey, setSecretKey] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [keyError, setKeyError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [calendarOpen, setCalendarOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(createDefaultDateRange)
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>(
    createDefaultDateRange
  )
  const [applications, setApplications] = useState<ProcessedApplication[]>([])
  const [loadingApps, setLoadingApps] = useState(false)

  const commission = useMemo(
    () => calculateCommission(applications.length),
    [applications.length]
  )

  const appliedRangeLabel =
    appliedDateRange?.from && appliedDateRange?.to
      ? `${formatDateLabel(appliedDateRange.from)} – ${formatDateLabel(appliedDateRange.to)}`
      : 'Select date range'

  async function loadApplications(range: DateRange) {
    if (!range.from || !range.to) return

    setLoadingApps(true)
    const { data, error } = await getVisaProcessedApplicationsByDateRange(
      range.from.toISOString(),
      range.to.toISOString()
    )
    if (error) {
      console.error('Failed to load applications:', error)
      setApplications([])
    } else {
      setApplications(data ?? [])
    }
    setLoadingApps(false)
  }

  async function handleVerifyAccess() {
    setKeyError('')
    setIsLoading(true)

    const isValid = await verifyDevSecretKey(secretKey)

    if (isValid) {
      setIsVerified(true)
      if (appliedDateRange?.from && appliedDateRange?.to) {
        await loadApplications(appliedDateRange)
      }
    } else {
      setKeyError('Invalid secret key. Access denied.')
    }

    setIsLoading(false)
  }

  useEffect(() => {
    if (isVerified && appliedDateRange?.from && appliedDateRange?.to) {
      loadApplications(appliedDateRange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedDateRange, isVerified])

  function handleApplyDateRange() {
    if (!dateRange?.from || !dateRange?.to) return
    setAppliedDateRange(dateRange)
    setCalendarOpen(false)
  }

  function handleClearDateRange() {
    const defaultRange = createDefaultDateRange()
    setDateRange(defaultRange)
    setAppliedDateRange(defaultRange)
    setCalendarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {!isVerified ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md bg-white shadow-lg border-0">
              <CardHeader className="items-center text-center pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Image
                    src="/greenroot-logo.svg"
                    alt="GreenRoot"
                    width={36}
                    height={36}
                  />
                  <span className="text-2xl font-bold text-gray-900">GreenRoot</span>
                </div>
                <CardTitle className="text-xl font-bold text-gr-text-dark flex items-center gap-2 justify-center">
                  <ShieldAlert className="w-5 h-5 text-gr-primary" />
                  Dev Billing Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="secretKey"
                      type="password"
                      value={secretKey}
                      onChange={(e) => {
                        setSecretKey(e.target.value)
                        if (keyError) setKeyError('')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && secretKey) {
                          handleVerifyAccess()
                        }
                      }}
                      placeholder="Enter secret key"
                      disabled={isLoading}
                      className="bg-gr-input-bg border-0 h-11 pl-10"
                    />
                  </div>
                  {keyError && (
                    <p className="text-sm text-gr-error">{keyError}</p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={handleVerifyAccess}
                  disabled={isLoading || !secretKey}
                  className="w-full h-11 bg-gr-primary text-white hover:bg-gr-primary-hover font-semibold"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Verify Access'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Image
                src="/greenroot-logo.svg"
                alt="GreenRoot"
                width={32}
                height={32}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dev Billing</h1>
                <p className="text-sm text-gray-500">
                  Complete processed applications — Visa Application Started
                </p>
              </div>
            </div>

            <Card className="bg-white shadow-sm border-0">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex-1">
                    <Label className="mb-2 block text-sm font-medium text-gray-700">
                      Select Date Range
                    </Label>
                    <div className="flex flex-wrap items-center gap-3">
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 bg-gr-input-bg border-0 hover:bg-gr-border font-medium text-gray-900"
                          >
                            <CalendarDays className="w-4 h-4 mr-2 text-gr-primary" />
                            {appliedRangeLabel}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="px-4 pt-4 pb-2 border-b border-gr-border">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">From Date</p>
                                <p className="font-medium text-gray-900">
                                  {dateRange?.from
                                    ? formatDateLabel(dateRange.from)
                                    : '—'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">To Date</p>
                                <p className="font-medium text-gray-900">
                                  {dateRange?.to
                                    ? formatDateLabel(dateRange.to)
                                    : '—'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Calendar
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={1}
                            disabled={{ after: new Date() }}
                          />
                          <div className="flex items-center justify-between gap-2 border-t border-gr-border p-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleClearDateRange}
                            >
                              Clear
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="bg-gr-primary hover:bg-gr-primary-hover text-white"
                              onClick={handleApplyDateRange}
                              disabled={!dateRange?.from || !dateRange?.to}
                            >
                              Apply Range
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <p className="text-sm text-gray-500">
                        Applications that entered Visa Application Started within this range
                      </p>
                    </div>
                  </div>

                  <div className="bg-gr-primary/10 px-4 py-2 rounded-lg shrink-0">
                    <span className="text-sm text-gray-600">Complete Processed: </span>
                    <span className="text-lg font-bold text-gr-primary">
                      {loadingApps ? '—' : applications.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  Complete Processed Applications
                  <span className="text-sm font-normal text-gray-500">
                    — {appliedRangeLabel}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingApps ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gr-primary" />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No complete processed applications for this date range.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-2 font-medium text-gray-500">#</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">Student ID</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">Student Name</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">Internship</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">Location</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">Visa Started On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app, index) => (
                          <tr
                            key={app.id}
                            className="border-b border-gray-50 hover:bg-gray-50/50"
                          >
                            <td className="py-3 px-2 text-gray-400">{index + 1}</td>
                            <td className="py-3 px-2 font-mono text-xs text-gray-600">
                              {app.student_id}
                            </td>
                            <td className="py-3 px-2 text-gray-900">{app.student_name}</td>
                            <td className="py-3 px-2 text-gray-900">{app.internship_title}</td>
                            <td className="py-3 px-2 text-gray-600">
                              {app.internship_location || '—'}
                            </td>
                            <td className="py-3 px-2 text-gray-600">
                              {new Date(app.visa_started_at).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 overflow-hidden">
              <div className="h-1 bg-gr-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-gr-primary" />
                  Commission Summary — {appliedRangeLabel}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-[#F9FAF7] border border-[#E8F5D6] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                      Complete Processed Count
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {loadingApps ? '—' : commission.processedCount}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Visa Application Started within selected date range
                    </p>
                  </div>

                  <div className="rounded-xl bg-gr-primary/10 border border-gr-primary/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                      Total Commission
                    </p>
                    <p className="text-3xl font-bold text-[#6BA82E] flex items-center gap-1">
                      <IndianRupee className="w-7 h-7" />
                      {loadingApps ? '—' : commission.totalCommission.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Base retainer + volume usage fee
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-gr-border overflow-hidden">
                  <div className="bg-gr-background px-4 py-3 border-b border-gr-border">
                    <p className="text-sm font-semibold text-gray-900">Commission Contract Reference</p>
                  </div>
                  <div className="divide-y divide-gr-border">
                    <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div>
                        <p className="text-sm font-medium text-gray-900">C1. Base Platform Retainer</p>
                        <p className="text-xs text-gray-500">
                          Availability, maintenance, support (payable irrespective of volume)
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 shrink-0">
                        {formatInr(BASE_PLATFORM_RETAINER)} / month
                      </p>
                    </div>

                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 mb-3">
                        C2. Application Volume-Based Usage Fee
                      </p>
                      <div className="space-y-2">
                        {COMMISSION_TIERS.map((tier) => {
                          const isActive =
                            commission.processedCount >= tier.min &&
                            commission.processedCount <= tier.max

                          return (
                            <div
                              key={tier.label}
                              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                                isActive
                                  ? 'bg-gr-primary/15 border border-gr-primary/40 font-semibold text-gray-900'
                                  : 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              <span>{tier.label}</span>
                              <span>+ {formatInr(tier.fee)}</span>
                            </div>
                          )
                        })}
                        {commission.processedCount === 0 && (
                          <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600">
                            <span>No applications processed</span>
                            <span>+ {formatInr(0)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-900 text-white p-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Base Platform Retainer</span>
                    <span>{formatInr(commission.baseRetainer)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">
                      Volume Usage Fee
                      {commission.volumeFee > 0 && (
                        <span className="text-gray-400 ml-1">({commission.tierLabel})</span>
                      )}
                    </span>
                    <span>{formatInr(commission.volumeFee)}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 flex items-center justify-between">
                    <span className="font-semibold">Total Commission Payable</span>
                    <span className="text-xl font-bold text-gr-primary">
                      {formatInr(commission.totalCommission)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
