#!/usr/bin/env node
/**
 * Fetches contact details from go2agro.com and prints them as JSON.
 *
 * Usage:
 *   node scripts/extract-go2agro-contact.mjs
 *   node scripts/extract-go2agro-contact.mjs --write   # overwrite config/contact.json
 *
 * Source: https://go2agro.com/contact-us/
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const SOURCE_URL = 'https://go2agro.com/contact-us/'
const CONTACT_CONFIG_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'config',
  'contact.json'
)

function cleanText(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function extractAddress(html) {
  const match = html.match(
    /(\d+\s+\d+(?:st|nd|rd|th)?\s+Floor[^<]*?Pune[^<]*?\d{6})/i
  )
  return match ? cleanText(match[1]) : null
}

function extractPhones(html) {
  const matches = html.matchAll(/\+91\s*(\d{10})/g)
  const numbers = [...new Set([...matches].map((m) => m[1]))]
  return numbers.map((digits) => ({
    label: numbers.indexOf(digits) === 0 ? 'Phone Number' : 'Alternate Number',
    display: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
    tel: `+91${digits}`,
  }))
}

function extractEmails(html) {
  const matches = html.matchAll(/([a-zA-Z0-9._%+-]+@go2agro\.com)/gi)
  const emails = [...new Set([...matches].map((m) => m[1].toLowerCase()))]
  return emails.map((email) => ({
    label: email === 'info@go2agro.com' ? 'General Enquiries' : email.split('@')[0],
    email,
  }))
}

function extractWhatsApp(html) {
  const match = html.match(/"number":"(\d{10})"/)
  if (!match) return null
  const digits = match[1]
  return {
    label: 'WhatsApp',
    display: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
    url: `https://wa.me/91${digits}`,
  }
}

function extractSocials(html) {
  const patterns = [
    { id: 'facebook', label: 'Facebook', regex: /href="(https:\/\/www\.facebook\.com\/[^"]+)"/ },
    { id: 'linkedin', label: 'LinkedIn', regex: /href="(https:\/\/www\.linkedin\.com\/[^"]+)"/ },
    { id: 'instagram', label: 'Instagram', regex: /href="(https:\/\/www\.instagram\.com\/[^"]+)"/ },
  ]

  return patterns
    .map(({ id, label, regex }) => {
      const match = html.match(regex)
      if (!match) return null
      const href = match[1].replace(/&#038;/g, '&').split('?')[0]
      return { id, label, href }
    })
    .filter(Boolean)
}

function splitAddressLines(address) {
  const parts = address.split(',').map((part) => cleanText(part))
  if (parts.length <= 1) return [address]

  const cityLine = parts[parts.length - 1]
  const street = parts.slice(0, -1).join(', ')
  const cityMatch = cityLine.match(/^(.*?)\s*-\s*(\d{6})$/)

  if (!cityMatch) return [address]

  const [, cityState, pin] = cityMatch
  return [street, `${cityState.trim()}, Maharashtra ${pin.trim()}, India`]
}

function buildGreenRootContact(extracted) {
  const existing = JSON.parse(readFileSync(CONTACT_CONFIG_PATH, 'utf8'))

  return {
    ...existing,
    officeName: 'GreenRoot Platform',
    addressLines: splitAddressLines(extracted.address),
    phones: extracted.phones,
    emails: [
      { label: 'Support', email: 'support@greenroot.in' },
      { label: 'General Enquiries', email: 'info@greenroot.in' },
    ],
    whatsapp: extracted.whatsapp ?? existing.whatsapp,
    socials: extracted.socials.length > 0 ? extracted.socials : existing.socials,
    sidebarHelp: {
      ...existing.sidebarHelp,
      phone: extracted.phones[0]?.display ?? existing.sidebarHelp.phone,
      email: 'support@greenroot.in',
    },
  }
}

async function main() {
  const shouldWrite = process.argv.includes('--write')

  console.log(`Fetching ${SOURCE_URL} ...`)
  const response = await fetch(SOURCE_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${SOURCE_URL}: ${response.status}`)
  }

  const html = await response.text()
  const extracted = {
    source: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    address: extractAddress(html),
    phones: extractPhones(html),
    emails: extractEmails(html),
    whatsapp: extractWhatsApp(html),
    socials: extractSocials(html),
  }

  console.log('\n--- Raw extraction from go2agro.com ---\n')
  console.log(JSON.stringify(extracted, null, 2))

  const greenRootContact = buildGreenRootContact(extracted)

  console.log('\n--- Mapped for GreenRoot (config/contact.json) ---\n')
  console.log(JSON.stringify(greenRootContact, null, 2))

  if (shouldWrite) {
    writeFileSync(CONTACT_CONFIG_PATH, `${JSON.stringify(greenRootContact, null, 2)}\n`)
    console.log(`\nWrote ${CONTACT_CONFIG_PATH}`)
  } else {
    console.log('\nTip: run with --write to update config/contact.json automatically.')
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
