'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, UserRound } from 'lucide-react'
import { getCountryFlag } from '@/lib/countries'
import {
  assignApplicationToPartner,
  getApplicationAssignment,
  searchPartnersForAssignment,
} from '@/lib/adminPartners'
import { LABEL_SEARCH_PLACEHOLDER } from '@/lib/appConfig'

type PartnerOption = {
  id: string
  first_name?: string
  middle_name?: string
  last_name?: string
  official_email?: string
  countries?: string[]
  unique_id?: string | null
}

interface PartnerAssignBarProps {
  applicationId: string
  onAssigned?: () => void
}

function getPartnerName(partner: PartnerOption) {
  return [partner.first_name, partner.middle_name, partner.last_name]
    .filter(Boolean)
    .join(' ')
}

export default function PartnerAssignBar({ applicationId, onAssigned }: PartnerAssignBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [partners, setPartners] = useState<PartnerOption[]>([])
  const [assignedPartner, setAssignedPartner] = useState<PartnerOption | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    async function loadAssignment() {
      const { data, error } = await getApplicationAssignment(applicationId)
      if (error) return
      setAssignedPartner(data?.partner ?? null)
    }

    loadAssignment()
  }, [applicationId])

  useEffect(() => {
    const term = searchQuery.trim()
    if (!term) {
      setPartners([])
      setSearchError('')
      setIsSearching(false)
      return
    }

    let isActive = true

    async function loadPartners() {
      setIsSearching(true)
      setSearchError('')

      const { data, error } = await searchPartnersForAssignment(term)

      if (!isActive) return

      if (error) {
        const message =
          typeof error === 'object' && error && 'message' in error
            ? String((error as { message: string }).message)
            : 'Failed to search partners'
        setSearchError(message)
        setPartners([])
      } else {
        setPartners((data as PartnerOption[]) ?? [])
      }

      setIsSearching(false)
    }

    const timer = setTimeout(loadPartners, 300)
    return () => {
      isActive = false
      clearTimeout(timer)
    }
  }, [searchQuery])

  const resultLabel = useMemo(() => {
    if (!searchQuery.trim()) return 'Search by partner name, last name, partner ID, or country'
    if (isSearching) return 'Searching partners...'
    if (searchError) return searchError
    if (!partners.length) return 'No matching partners found'
    return `${partners.length} partner${partners.length === 1 ? '' : 's'} found`
  }, [isSearching, searchQuery, partners.length, searchError])

  async function handleAssign(partner: PartnerOption) {
    setIsAssigning(true)
    const { data, error } = await assignApplicationToPartner(applicationId, partner.id)
    setIsAssigning(false)

    if (error) {
      return
    }

    if (data) {
      setAssignedPartner(partner)
      setShowResults(false)
      setSearchQuery('')
      setPartners([])
      onAssigned?.()
    }
  }

  return (
    <div className="bg-white border border-gr-border rounded-2xl p-4 sm:p-5 space-y-4">

      {assignedPartner && (
        <div className="rounded-xl border border-gr-primary/40 bg-[#F4FBE8] p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Forwarded To</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900">{getPartnerName(assignedPartner)}</p>
              <p className="text-sm text-gray-500">{assignedPartner.official_email}</p>
              {assignedPartner.unique_id && (
                <p className="text-xs text-gray-400 mt-1">Ref: {assignedPartner.unique_id}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(assignedPartner.countries ?? []).map((country) => (
                <span
                  key={country}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gr-border px-3 py-1 text-xs font-medium text-gray-700"
                >
                  <span>{getCountryFlag(country)}</span>
                  {country}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => setShowResults(true)}
          placeholder={LABEL_SEARCH_PLACEHOLDER}
          className="w-full bg-gr-input-bg border border-gr-border rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-gr-primary focus:border-transparent"
        />
      </div>

      <p className={`text-xs ${searchError ? 'text-red-500' : 'text-gray-500'}`}>{resultLabel}</p>

      {showResults && searchQuery.trim() && !isSearching && partners.length > 0 && (
        <div className="border border-gr-border rounded-xl overflow-hidden divide-y divide-gr-border">
          {partners.map((partner) => (
            <button
              key={partner.id}
              type="button"
              disabled={isAssigning}
              onClick={() => handleAssign(partner)}
              className="w-full text-left p-4 hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gr-secondary text-white flex items-center justify-center flex-shrink-0">
                    <UserRound className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{getPartnerName(partner)}</p>
                    <p className="text-sm text-gray-500 truncate">{partner.official_email}</p>
                    {partner.unique_id && (
                      <p className="text-xs text-gray-400 mt-0.5">Ref: {partner.unique_id}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[45%]">
                  {(partner.countries ?? []).length > 0 ? (
                    (partner.countries ?? []).map((country) => (
                      <span
                        key={country}
                        title={country}
                        className="inline-flex items-center gap-1 rounded-full bg-gr-input-bg px-2 py-1 text-xs text-gray-700"
                      >
                        <span>{getCountryFlag(country)}</span>
                        <span className="hidden sm:inline">{country}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No countries set</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
