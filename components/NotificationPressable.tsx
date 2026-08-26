'use client'

import { useState, type ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { deleteNotification } from '@/lib/notifications'
import { cn } from '@/lib/utils'

interface NotificationPressableProps {
  notificationId: string
  onClick: () => void
  onDeleted: (notificationId: string) => void
  onUnreadCountChange?: () => void
  timestamp: string
  isUnread?: boolean
  showUnreadDot?: boolean
  className?: string
  children: ReactNode
}

export function NotificationPressable({
  notificationId,
  onClick,
  onDeleted,
  onUnreadCountChange,
  timestamp,
  isUnread = false,
  showUnreadDot = false,
  className,
  children,
}: NotificationPressableProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)

    const { error } = await deleteNotification(notificationId)

    if (!error) {
      onDeleted(notificationId)
      onUnreadCountChange?.()
      setShowDeleteDialog(false)
    }

    setIsDeleting(false)
  }

  return (
    <>
      <div
        className={cn(
          'group flex w-full items-stretch gap-4 transition-colors',
          className
        )}
      >
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-4 text-left"
        >
          {children}
        </button>

        <div className="flex flex-shrink-0 flex-col items-end self-stretch">
          <span className="text-xs text-gray-400 whitespace-nowrap">{timestamp}</span>

          {showUnreadDot && isUnread && (
            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-gr-secondary" />
          )}

          <button
            type="button"
            onClick={handleDeleteClick}
            aria-label="Delete notification"
            className={cn(
              'mt-auto flex size-8 items-center justify-center rounded-lg text-gray-400 transition-all',
              'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100',
              'hover:bg-red-50 hover:text-red-500',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200',
              'max-lg:opacity-100'
            )}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setShowDeleteDialog(open)
          }
        }}
        icon={<Trash2 strokeWidth={1.5} />}
        title="Delete notification?"
        description="This notification will be permanently removed and cannot be undone."
        confirmText="Yes, delete"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        loadingText="Deleting..."
      />
    </>
  )
}
