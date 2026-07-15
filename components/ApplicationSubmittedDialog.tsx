"use client"

import { useRouter } from "next/navigation"
import { BadgeCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  formatApplicationReferenceId,
  formatApplicationStatusLabel,
  formatSubmittedDateTime,
} from "@/lib/utils"

interface ApplicationSubmittedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  internshipTitle: string
  internshipCountry?: string
  submittedAt: string
  status: string
}

export function ApplicationSubmittedDialog({
  open,
  onOpenChange,
  applicationId,
  internshipTitle,
  internshipCountry,
  submittedAt,
  status,
}: ApplicationSubmittedDialogProps) {
  const router = useRouter()

  const internshipLabel = internshipCountry
    ? `${internshipTitle} – ${internshipCountry}`
    : internshipTitle

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
            Application Submitted Successfully!
          </DialogTitle>

          <DialogDescription className="mb-6 max-w-[440px] text-sm leading-relaxed text-gray-600">
            Your application has been received and is now under review. We&apos;ll
            notify you via email once there is an update.
          </DialogDescription>

          <div className="mb-8 w-full rounded-xl border border-[#8DC63F] bg-[#F7FAF0] p-4 text-left">
            <p className="mb-3 text-sm font-bold text-gray-900">Application Summary</p>
            <div className="space-y-1.5 text-sm text-gray-800">
              <p>
                <span className="font-medium">Application ID:</span>{" "}
                {formatApplicationReferenceId(applicationId, submittedAt)}
              </p>
              <p>
                <span className="font-medium">Internship:</span> {internshipLabel}
              </p>
              <p>
                <span className="font-medium">Submitted on:</span>{" "}
                {formatSubmittedDateTime(submittedAt)}
              </p>
              <p>
                <span className="font-medium">Current Status:</span>{" "}
                {formatApplicationStatusLabel(status)}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/student/internships")}
              className="flex-1 rounded-full bg-[#8DC63F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7DB62F]"
            >
              Browse more internships
            </button>
            <button
              type="button"
              onClick={() => router.push("/student/applications")}
              className="flex-1 rounded-full border border-[#8DC63F] bg-white px-4 py-2.5 text-sm font-semibold text-[#8DC63F] transition-colors hover:bg-[#8DC63F]/5"
            >
              Go to My Applications
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
