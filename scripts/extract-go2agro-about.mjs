#!/usr/bin/env node
/**
 * Fetches About page content from go2agro.com and prints a GreenRoot-ready draft.
 *
 * Usage:
 *   node scripts/extract-go2agro-about.mjs
 *   node scripts/extract-go2agro-about.mjs --write   # overwrite config/pages/about.json
 *
 * Sources:
 *   https://go2agro.com/about-us/
 *   https://go2agro.com/
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ABOUT_URL = 'https://go2agro.com/about-us/'
const HOME_URL = 'https://go2agro.com/'
const ABOUT_CONFIG_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'config',
  'pages',
  'about.json'
)

function cleanText(value) {
  return value
    .replace(/&#8211;/g, '–')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractBetween(html, startPattern, endPattern) {
  const start = html.search(startPattern)
  if (start === -1) return null
  const slice = html.slice(start)
  const end = slice.search(endPattern)
  return end === -1 ? null : cleanText(slice.slice(0, end))
}

function extractStory(html) {
  const match = html.match(
    /We started working in 2019\.[\s\S]*?agriculture filed crops\./i
  )
  return match ? cleanText(match[0]) : null
}

function extractVision(html) {
  const match = html.match(
    /To be India['']s best Agricultural Institute[\s\S]*?strategic partnerships\./i
  )
  return match ? cleanText(match[0]) : null
}

function extractMission(html) {
  const match = html.match(
    /To provide Agricultural Students[\s\S]*?increase their productivity and success\./i
  )
  return match ? cleanText(match[0]) : null
}

function extractValues(html) {
  const labels = ['INTEGRITY', 'Transparency', 'Service excellence']
  return labels
    .map((label) => {
      const regex = new RegExp(`${label}[\\s\\S]*?(Building trust|Ensuring openness|Building an organizational)`, 'i')
      const match = html.match(regex)
      if (!match) return null
      const body = cleanText(match[0].replace(new RegExp(`^${label}`, 'i'), ''))
      return {
        title: label.charAt(0) + label.slice(1).toLowerCase(),
        body,
      }
    })
    .filter(Boolean)
}

function extractFounders(html) {
  const people = [
    {
      name: 'Mr. Sunil Landkar',
      role: 'Founder & CEO',
      email: 'info@greenroot.in',
      mobile: '+91 79729 37388',
      imagePattern: /sunil_1\.jpg/,
    },
  ]

  return people.map((person) => {
    const imageMatch = html.match(
      new RegExp(`https://go2agro\\.com/wp-content/uploads/[^"']*${person.imagePattern.source}`)
    )
    return {
      ...person,
      image: imageMatch?.[0] ?? null,
    }
  })
}

function extractAdvisors(html) {
  const advisors = [
    {
      name: 'Mr. Abraham Yehunda',
      roleLine1: 'CEO — Israel-India Initiative',
      roleLine2: 'Advisor — International Associate',
      imagePattern: /Untitled-design-62[^"']*\.jpg/,
    },
    {
      name: 'Giri & Jadhav Associates',
      roleLine1: 'Advisor — Finance & Tax',
      roleLine2: null,
      imagePattern: /\/2024\/11\/061[^"']*\.jpg/,
    },
    {
      name: 'Radhika Sakseria',
      roleLine1: 'Advocate',
      roleLine2: null,
      imagePattern: /WhatsApp-Image-2022-08-19-at-12\.55\.07-PM[^"']*\.jpeg/,
    },
  ]

  return advisors.map((advisor) => {
    const imageMatch = html.match(
      new RegExp(`https://go2agro\\.com/wp-content/uploads/${advisor.imagePattern.source}`)
    )
    const { imagePattern, ...rest } = advisor
    return {
      ...rest,
      image: imageMatch?.[0] ?? null,
    }
  })
}

async function main() {
  const shouldWrite = process.argv.includes('--write')

  console.log(`Fetching ${ABOUT_URL} and ${HOME_URL} ...`)
  const [aboutResponse, homeResponse] = await Promise.all([
    fetch(ABOUT_URL),
    fetch(HOME_URL),
  ])

  if (!aboutResponse.ok) {
    throw new Error(`Failed to fetch ${ABOUT_URL}: ${aboutResponse.status}`)
  }
  if (!homeResponse.ok) {
    throw new Error(`Failed to fetch ${HOME_URL}: ${homeResponse.status}`)
  }

  const aboutHtml = await aboutResponse.text()
  const homeHtml = await homeResponse.text()
  const html = `${aboutHtml}\n${homeHtml}`

  const extracted = {
    source: [ABOUT_URL, HOME_URL],
    fetchedAt: new Date().toISOString(),
    story: extractStory(aboutHtml),
    mission: extractMission(homeHtml),
    vision: extractVision(homeHtml),
    values: extractValues(homeHtml),
    founders: extractFounders(aboutHtml),
    advisors: extractAdvisors(aboutHtml),
  }

  console.log('\n--- Raw extraction from go2agro.com ---\n')
  console.log(JSON.stringify(extracted, null, 2))

  const existing = JSON.parse(readFileSync(ABOUT_CONFIG_PATH, 'utf8'))
  const mapped = {
    ...existing,
    story: {
      ...existing.story,
      description: extracted.story ?? existing.story.description,
      chapters: existing.story.chapters.map((chapter) => {
        if (chapter.label === 'Mission' && extracted.mission) {
          return { ...chapter, body: extracted.mission }
        }
        if (chapter.label === 'Vision' && extracted.vision) {
          return { ...chapter, body: extracted.vision }
        }
        return chapter
      }),
    },
    pillars: {
      ...existing.pillars,
      items: extracted.values.length
        ? extracted.values.map((value, index) => ({
            ...existing.pillars.items[index],
            title: value.title,
            text: value.body,
          }))
        : existing.pillars.items,
    },
    team: {
      ...existing.team,
      founders: extracted.founders.every((person) => person.image)
        ? extracted.founders
        : existing.team.founders,
      advisors: extracted.advisors.some((advisor) => advisor.image)
        ? extracted.advisors
        : existing.team.advisors,
    },
  }

  console.log('\n--- Mapped for GreenRoot (config/pages/about.json) ---\n')
  console.log(JSON.stringify(mapped, null, 2))

  if (shouldWrite) {
    writeFileSync(ABOUT_CONFIG_PATH, `${JSON.stringify(mapped, null, 2)}\n`)
    console.log(`\nWrote ${ABOUT_CONFIG_PATH}`)
  } else {
    console.log('\nTip: run with --write to update config/pages/about.json automatically.')
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
