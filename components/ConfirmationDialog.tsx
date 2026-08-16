"use client"

import { type ReactNode } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ConfirmationDialogVariant = "danger" | "success" | "warning"

const variantStyles: Record<
  ConfirmationDialogVariant,
  { icon: string; title: string }
> = {
  danger: {
    icon: "text-[#E04848]",
    title: "text-[#E04848]",
  },
  success: {
    icon: "text-[#8DC63F]",
    title: "text-[#8DC63F]",
  },
  warning: {
    icon: "text-amber-600",
    title: "text-amber-700",
  },
}

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon: ReactNode
  title: string
  description: ReactNode
  cancelText?: string
  confirmText: string
  onConfirm: () => void
  isLoading?: boolean
  loadingText?: string
  variant?: ConfirmationDialogVariant
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  icon,
  title,
  description,
  cancelText = "Cancel",
  confirmText,
  onConfirm,
  isLoading = false,
  loadingText,
  variant = "danger",
}: ConfirmationDialogProps) {
  const styles = variantStyles[variant]
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isLoading) {
          onOpenChange(nextOpen)
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/50 supports-backdrop-filter:backdrop-blur-[2px]"
        className="max-w-[420px] rounded-2xl border border-[#EEEEEE] bg-white p-8 shadow-xl sm:max-w-[420px]"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              "mb-4 flex items-center justify-center [&_svg]:size-14",
              styles.icon
            )}
          >
            {icon}
          </div>

          <DialogTitle className={cn("mb-3 text-xl font-bold", styles.title)}>
            {title}
          </DialogTitle>

          <DialogDescription className="mb-8 max-w-[320px] text-sm leading-relaxed text-gray-600">
            {description}
          </DialogDescription>

          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className={cn(
                "flex-1 rounded-full border border-[#8DC63F] px-4 py-2.5 text-sm font-semibold text-[#8DC63F] transition-colors",
                "hover:bg-[#8DC63F]/5 disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full bg-[#8DC63F] px-4 py-2.5 text-sm font-semibold text-white transition-colors",
                "hover:bg-[#7DB62F] disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {loadingText ?? confirmText}
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
