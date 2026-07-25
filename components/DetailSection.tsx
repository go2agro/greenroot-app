import { CARD_CLASS } from '@/components/detailLayout'

export function DetailSection({
  title,
  description,
  icon: Icon,
  children,
  action,
}: {
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className={CARD_CLASS}>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#F0F9E8] flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-[#8DC63F]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-lg text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
