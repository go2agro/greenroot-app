'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { KeyRound, Loader2, ShieldAlert, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  verifyDevSecretKey,
  getApprovedApplicationsByMonth,
  getBillingMonthsSummary,
} from '@/lib/devBilling'

type MonthSummary = {
  year: number
  month: number
  count: number
  key: string
}

type ApprovedApplication = {
  id: string
  status: string
  decided_at: string
  submitted_at: string
  internship_title: string
  internship_location: string
  student_name: string
  student_id: string
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function DevBillingPage() {
  const [secretKey, setSecretKey] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [keyError, setKeyError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [months, setMonths] = useState<MonthSummary[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [applications, setApplications] = useState<ApprovedApplication[]>([])
  const [loadingApps, setLoadingApps] = useState(false)

  async function handleVerifyAccess() {
    setKeyError('')
    setIsLoading(true)

    const isValid = await verifyDevSecretKey(secretKey)

    if (isValid) {
      setIsVerified(true)
      loadMonthsSummary()
    } else {
      setKeyError('Invalid secret key. Access denied.')
    }

    setIsLoading(false)
  }

  async function loadMonthsSummary() {
    const { data, error } = await getBillingMonthsSummary()
    if (error) {
      console.error('Failed to load months summary:', error)
      return
    }
    setMonths(data ?? [])
    if (data?.length) {
      setSelectedMonth(data[0].key)
    }
  }

  async function loadApplications(year: number, month: number) {
    setLoadingApps(true)
    const { data, error } = await getApprovedApplicationsByMonth(year, month)
    if (error) {
      console.error('Failed to load applications:', error)
      setApplications([])
    } else {
      setApplications(data ?? [])
    }
    setLoadingApps(false)
  }

  useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number)
      loadApplications(year, month)
    }
  }, [selectedMonth])

  const selectedMonthData = months.find((m) => m.key === selectedMonth)

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
                <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2 justify-center">
                  <ShieldAlert className="w-5 h-5 text-[#8DC63F]" />
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
                      className="bg-[#F5F5F5] border-0 h-11 pl-10"
                    />
                  </div>
                  {keyError && (
                    <p className="text-sm text-[#DC2626]">{keyError}</p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={handleVerifyAccess}
                  disabled={isLoading || !secretKey}
                  className="w-full h-11 bg-[#8DC63F] text-white hover:bg-[#7DB62F] font-semibold"
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
                  Approved Applications by Month
                </p>
              </div>
            </div>

            <Card className="bg-white shadow-sm border-0">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex-1 max-w-xs">
                    <Label htmlFor="month-select" className="mb-2 block">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Select Month
                    </Label>
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger
                        id="month-select"
                        className="bg-[#F5F5F5] border-0 h-11"
                      >
                        <SelectValue placeholder="Select a month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No data available
                          </SelectItem>
                        ) : (
                          months.map((m) => (
                            <SelectItem key={m.key} value={m.key}>
                              {MONTH_NAMES[m.month - 1]} {m.year} ({m.count} approved)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMonthData && (
                    <div className="bg-[#8DC63F]/10 px-4 py-2 rounded-lg">
                      <span className="text-sm text-gray-600">Total Approved: </span>
                      <span className="text-lg font-bold text-[#8DC63F]">
                        {selectedMonthData.count}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  Approved Applications
                  {selectedMonthData && (
                    <span className="text-sm font-normal text-gray-500">
                      — {MONTH_NAMES[selectedMonthData.month - 1]} {selectedMonthData.year}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingApps ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#8DC63F]" />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No approved applications for this month.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-2 font-medium text-gray-500">
                            #
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">
                            Student ID
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">
                            Student Name
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">
                            Internship
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">
                            Location
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-gray-500">
                            Approved On
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app, index) => (
                          <tr
                            key={app.id}
                            className="border-b border-gray-50 hover:bg-gray-50/50"
                          >
                            <td className="py-3 px-2 text-gray-400">
                              {index + 1}
                            </td>
                            <td className="py-3 px-2 font-mono text-xs text-gray-600">
                              {app.student_id}
                            </td>
                            <td className="py-3 px-2 text-gray-900">
                              {app.student_name}
                            </td>
                            <td className="py-3 px-2 text-gray-900">
                              {app.internship_title}
                            </td>
                            <td className="py-3 px-2 text-gray-600">
                              {app.internship_location || '—'}
                            </td>
                            <td className="py-3 px-2 text-gray-600">
                              {new Date(app.decided_at).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
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
          </div>
        )}
      </div>
    </div>
  )
}
