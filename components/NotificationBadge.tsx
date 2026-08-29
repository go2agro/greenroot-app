interface NotificationBadgeProps {
  count: number
}

export default function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count <= 0) return null

  return (
    <span
      aria-label={`${count} unread notifications`}
      className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
    >
      {count > 9 ? '9+' : count}
    </span>
  )
}
