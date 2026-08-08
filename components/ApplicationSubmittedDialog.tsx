"use client"

import { BadgeCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatApplicationReferenceId } from "@/lib/utils"

interface ApplicationSubmittedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  submittedAt: string
}

export function ApplicationSubmittedDialog({
  open,
  onOpenChange,
  applicationId,
  submittedAt,
}: ApplicationSubmittedDialogProps) {
  const applicationRef = formatApplicationReferenceId(applicationId, submittedAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/50 supports-backdrop-filter:backdrop-blur-[2px]"
        className="max-w-[calc(100%-2rem)] rounded-2xl border border-[#EEEEEE] bg-white p-6 shadow-xl sm:max-w-[560px] sm:p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8DC63F] text-white shadow-sm">
            <BadgeCheck className="h-10 w-10" strokeWidth={1.75} />
          </div>

          <DialogTitle className="mb-3 text-xl font-bold text-[#3B82F6]">
            Congratulations!
          </DialogTitle>

          <DialogDescription className="mb-6 max-w-[440px] space-y-3 text-sm leading-relaxed text-gray-600">
            <p>
              Your application has been sent successfully. You can view it in the{" "}
              <span className="font-semibold text-gray-800">My Applications</span>{" "}
              screen.
            </p>
            <p>
              Your application ID is{" "}
              <span className="font-bold text-[#3B82F6]">{applicationRef}</span>.
              Please keep this for your records.
            </p>
            <p>
              Keep checking your notifications for any updates about your
              submitted application.
            </p>
          </DialogDescription>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-full bg-[#8DC63F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7DB62F]"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
