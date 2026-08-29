"use client"

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  target: number
  suffix?: string
  padStart?: number
  durationMs?: number
  className?: string
}

export default function AnimatedCounter({
  target,
  suffix = '',
  padStart,
  durationMs = 1200,
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const animate = () => {
      if (started.current) return
      started.current = true
      const start = performance.now()

      const tick = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) animate()
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, durationMs])

  const display =
    padStart !== undefined
      ? String(count).padStart(padStart, '0')
      : String(count)

  return (
    <div ref={ref} className={className}>
      {display}
      {suffix}
    </div>
  )
}
