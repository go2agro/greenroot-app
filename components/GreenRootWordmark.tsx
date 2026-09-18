import { cn } from '@/lib/utils'

interface GreenRootWordmarkProps {
  className?: string
}

export default function GreenRootWordmark({ className }: GreenRootWordmarkProps) {
  return (
    <span className={cn('font-bold', className)}>
      <span className="text-gr-primary">Green</span>
      <span className="text-gr-root">Root</span>
    </span>
  )
}
