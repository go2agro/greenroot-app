'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type FeaturedCountry = {
  flag: string
  name: string
  internshipCount: number
}

export default function FeaturedCountriesMarquee({
  countries,
}: {
  countries: FeaturedCountry[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({ isDragging: false, startX: 0, scrollLeft: 0 })
  const [isInteracting, setIsInteracting] = useState(false)
  const doubled = [...countries, ...countries]

  const scrollStep = useCallback(() => {
    const el = scrollRef.current
    if (!el || isInteracting) return

    el.scrollLeft += 0.6
    const loopPoint = el.scrollWidth / 2
    if (el.scrollLeft >= loopPoint) {
      el.scrollLeft -= loopPoint
    }
  }, [isInteracting])

  useEffect(() => {
    let frame = 0

    const tick = () => {
      scrollStep()
      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [scrollStep])

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-24 bg-gradient-to-r from-gr-primary/5 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-24 bg-gradient-to-l from-gr-primary/5 to-transparent" />

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto py-3 scrollbar-hide cursor-grab active:cursor-grabbing select-none touch-pan-x"
        onPointerDown={(event) => {
          const el = scrollRef.current
          if (!el) return
          setIsInteracting(true)
          dragState.current = {
            isDragging: true,
            startX: event.pageX,
            scrollLeft: el.scrollLeft,
          }
        }}
        onPointerMove={(event) => {
          const el = scrollRef.current
          if (!el || !dragState.current.isDragging) return
          event.preventDefault()
          const walk = event.pageX - dragState.current.startX
          el.scrollLeft = dragState.current.scrollLeft - walk
        }}
        onPointerUp={() => {
          dragState.current.isDragging = false
          setIsInteracting(false)
        }}
        onPointerLeave={() => {
          dragState.current.isDragging = false
          setIsInteracting(false)
        }}
      >
        {doubled.map((country, index) => (
          <div
            key={`${country.name}-${index}`}
            className="flex shrink-0 items-center gap-5 rounded-2xl border border-gr-primary/25 bg-white px-6 py-5 shadow-md"
          >
            <div className="relative shrink-0">
              <div
                className="rounded-full bg-gradient-to-br from-gr-primary via-gr-primary-light to-gr-secondary p-[2.5px]"
                aria-hidden="true"
              >
                <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-gr-primary-light">
                  <span className="text-[2.75rem] leading-none">{country.flag}</span>
                </div>
              </div>
            </div>

            <div className="flex min-w-[9.5rem] flex-col gap-1">
              <span className="text-lg font-bold text-gr-text-dark">{country.name}</span>
              <span className="text-base font-semibold text-gr-primary">
                {country.internshipCount}+ Internships
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
