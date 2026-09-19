type StipendCurrency = {
  code: string
  locale: string
  format: (amount: number) => string
}

const COUNTRY_CURRENCY: Record<string, StipendCurrency> = {
  Denmark: {
    code: 'DKK',
    locale: 'da-DK',
    format: (amount) =>
      `kr ${amount.toLocaleString('da-DK', { maximumFractionDigits: 0 })}/month`,
  },
  Germany: {
    code: 'EUR',
    locale: 'de-DE',
    format: (amount) =>
      `€${amount.toLocaleString('de-DE', { maximumFractionDigits: 0 })}/month`,
  },
  USA: {
    code: 'USD',
    locale: 'en-US',
    format: (amount) =>
      `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}/month`,
  },
  Israel: {
    code: 'ILS',
    locale: 'he-IL',
    format: (amount) =>
      `₪${amount.toLocaleString('he-IL', { maximumFractionDigits: 0 })}/month`,
  },
  Australia: {
    code: 'AUD',
    locale: 'en-AU',
    format: (amount) =>
      `A$${amount.toLocaleString('en-AU', { maximumFractionDigits: 0 })}/month`,
  },
}

/** Original Go2Agro INR stipend reference, shown on detail pages only. */
const INR_STIPEND_REFERENCE: Record<string, number> = {
  Denmark: 130000,
  Germany: 120000,
  USA: 110000,
  Israel: 55000,
  Australia: 110000,
}

export function getStipendCurrencyCode(country?: string | null): string | null {
  if (!country) return null
  return COUNTRY_CURRENCY[country]?.code ?? null
}

function formatInrStipend(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/month`
}

export function formatStipendMonthly(
  amount?: number | null,
  country?: string | null
): string {
  if (amount == null || amount <= 0) return 'To be discussed'

  const currency = country ? COUNTRY_CURRENCY[country] : undefined
  if (!currency) {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/month`
  }

  return currency.format(amount)
}

export function formatStipendMonthlyCard(
  amount?: number | null,
  country?: string | null
): string | null {
  if (amount == null || amount <= 0) return null
  return formatStipendMonthly(amount, country)
}

/** Detail page only — local currency with INR equivalent in brackets. */
export function formatStipendMonthlyDetail(
  amount?: number | null,
  country?: string | null
): string {
  const local = formatStipendMonthly(amount, country)
  if (local === 'To be discussed' || !country) return local

  const inrAmount = INR_STIPEND_REFERENCE[country]
  if (!inrAmount) return local

  return `${local} (${formatInrStipend(inrAmount)})`
}
