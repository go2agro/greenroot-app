"use client"

import Image from 'next/image'
import { MapPin, Clock, Banknote } from 'lucide-react'
import { DEFAULT_INTERNSHIP_IMAGE } from '@/lib/appConfig'
import { getCountryFlag } from '@/lib/countries'
import { formatStipendMonthlyCard } from '@/lib/formatStipend'
import { getBadgeColor, resolveInternshipBadge } from '@/lib/internshipBadge'
import { cn } from '@/lib/utils'

export type InternshipListCardData = {
  id: string
  badge?: string
  title: string
  subtitle?: string
  city?: string
  country?: string
  short_description?: string
  duration_months?: number
  stipend_monthly?: number | null
  image_url?: string
  flag_emoji?: string
}

type InternshipListCardProps = {
  internship: InternshipListCardData
  ctaLabel: string
  className?: string
  onCardClick?: () => void
  onCtaClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  showSubtitle?: boolean
}

export default function InternshipListCard({
  internship,
  ctaLabel,
  className,
  onCardClick,
  onCtaClick,
  showSubtitle = false,
}: InternshipListCardProps) {
  const badge = resolveInternshipBadge(internship.badge, internship.title)
  const stipendLabel = formatStipendMonthlyCard(
    internship.stipend_monthly,
    internship.country
  )
  const locationLabel =
    [internship.city, internship.country]
      .filter((part) => part && part !== 'Various')
      .join(', ') || internship.country

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-2xl border border-gr-border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        onCardClick && 'cursor-pointer',
        className
      )}
      onClick={onCardClick}
    >
      <div className="relative h-48 w-full shrink-0">
        <Image
          src={internship.image_url || DEFAULT_INTERNSHIP_IMAGE}
          alt={internship.title}
          fill
          className="object-cover"
        />
        <div
          className={`absolute top-3 left-3 ${getBadgeColor(badge)} max-w-[calc(100%-1.5rem)] truncate rounded-full px-3 py-1 text-xs font-bold text-white`}
        >
          {badge}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-2 min-h-10 text-base font-bold text-gray-900">
          {internship.title}
        </h3>

        {showSubtitle && internship.subtitle && (
          <p className="mb-2 line-clamp-1 text-xs text-gray-400">{internship.subtitle}</p>
        )}

        <p className="mb-3 line-clamp-3 min-h-[3.75rem] text-sm text-gray-600">
          {internship.short_description || '\u00A0'}
        </p>

        <div className="mb-4 min-h-[5.5rem] space-y-2">
          {internship.country && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-2xl leading-none shrink-0">
                  {getCountryFlag(internship.country, internship.flag_emoji)}
                </span>
                <span className="truncate">{locationLabel}</span>
              </span>
            </div>
          )}

          {internship.duration_months ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{internship.duration_months} Months</span>
            </div>
          ) : (
            <div className="h-5" aria-hidden="true" />
          )}

          {stipendLabel ? (
            <div className="flex items-center gap-2 text-sm">
              <Banknote className="h-4 w-4 shrink-0 text-gray-500" />
              <span className="font-bold text-gr-primary">{stipendLabel}</span>
            </div>
          ) : (
            <div className="h-5" aria-hidden="true" />
          )}
        </div>

        <button
          type="button"
          onClick={onCtaClick}
          className="mt-auto w-full rounded-lg bg-gr-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gr-primary-hover"
        >
          {ctaLabel}
        </button>
      </div>
    </article>
  )
}
