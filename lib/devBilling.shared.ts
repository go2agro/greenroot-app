export const BASE_PLATFORM_RETAINER = 5000

export const COMMISSION_TIERS = [
  { min: 1, max: 10, fee: 10000, label: '1 – 10 Applications' },
  { min: 11, max: 20, fee: 20000, label: '10 – 20 Applications' },
  { min: 21, max: Infinity, fee: 30000, label: '20+ Applications' },
] as const

export const VISA_PROCESS_STARTED_STAGE = 'visa_application_started' as const

export type CommissionBreakdown = {
  processedCount: number
  baseRetainer: number
  volumeFee: number
  tierLabel: string
  totalCommission: number
}

export function calculateCommission(processedCount: number): CommissionBreakdown {
  const baseRetainer = BASE_PLATFORM_RETAINER
  let volumeFee = 0
  let tierLabel = 'No applications processed'

  if (processedCount >= 1 && processedCount <= 10) {
    volumeFee = 10000
    tierLabel = '1 – 10 Applications'
  } else if (processedCount > 10 && processedCount <= 20) {
    volumeFee = 20000
    tierLabel = '10 – 20 Applications'
  } else if (processedCount > 20) {
    volumeFee = 30000
    tierLabel = '20+ Applications'
  }

  return {
    processedCount,
    baseRetainer,
    volumeFee,
    tierLabel,
    totalCommission: baseRetainer + volumeFee,
  }
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function getMonthRange(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)
  return { startDate, endDate }
}

export function getDateRangeBounds(from: Date, to: Date) {
  const startDate = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const endDate = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
  return { startDate, endDate }
}

export function getCurrentMonthRange() {
  const now = new Date()
  return getMonthRange(now.getFullYear(), now.getMonth() + 1)
}
