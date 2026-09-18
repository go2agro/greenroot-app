export default function SectionDivider() {
  return (
    <div className="w-full py-8 md:py-10" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gr-primary/25 to-gr-primary/60" />
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gr-primary/50" />
            <span className="h-2 w-2 rounded-full bg-gr-primary" />
            <span className="h-1.5 w-1.5 rounded-full bg-gr-primary/50" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gr-primary/25 to-gr-primary/60" />
        </div>
      </div>
    </div>
  )
}
