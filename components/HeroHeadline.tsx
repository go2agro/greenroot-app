'use client'

import { useEffect, useState } from 'react'

type HeroHeadlineItem = {
  heading_prefix: string
  heading_highlight: string
}

export default function HeroHeadline({
  headlines,
  className = 'font-bold text-3xl md:text-4xl lg:text-5xl text-gr-text-dark leading-tight',
}: {
  headlines: HeroHeadlineItem[]
  className?: string
}) {
  const [headline, setHeadline] = useState(headlines[0])

  useEffect(() => {
    const index = Math.floor(Math.random() * headlines.length)
    setHeadline(headlines[index])
  }, [headlines])

  return (
    <h1 className={className} suppressHydrationWarning>
      {headline.heading_prefix}{' '}
      <span className="text-gr-primary">{headline.heading_highlight}</span>
    </h1>
  )
}
