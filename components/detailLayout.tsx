export const CARD_CLASS = 'bg-white border border-[#EEEEEE] rounded-2xl p-6'
export const PAGE_CLASS = 'w-full max-w-5xl mx-auto'

export function DetailSkeleton() {
  return (
    <div className={`${PAGE_CLASS} p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse`}>
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className={`${CARD_CLASS} h-56`} />
      <div className={`${CARD_CLASS} h-56`} />
    </div>
  )
}
