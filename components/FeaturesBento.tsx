'use client'

import type { LucideIcon } from 'lucide-react'
import { MotionStagger, MotionStaggerItem } from '@/components/motion/MotionStagger'

type FeatureItem = {
  id: string
  title: string
  description: string
}

export default function FeaturesBento({
  items,
  icons,
}: {
  items: FeatureItem[]
  icons: Record<string, LucideIcon>
}) {
  return (
    <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item, index) => {
        const Icon = icons[item.id] ?? icons[Object.keys(icons)[0]]

        return (
          <MotionStaggerItem key={item.id}>
            <article className="flex items-start justify-between gap-3 rounded-2xl border border-gr-border bg-white p-4 h-full shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gr-primary">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mb-1 text-base font-bold text-gr-text-dark">
                  {item.title}
                </h3>
                <p className="text-sm leading-snug text-gr-text-muted">
                  {item.description}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gr-primary-light">
                <Icon className="h-5 w-5 text-gr-primary" />
              </div>
            </article>
          </MotionStaggerItem>
        )
      })}
    </MotionStagger>
  )
}
