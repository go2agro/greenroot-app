#!/usr/bin/env node
/**
 * Fetches gallery photos from go2agro.com/gallery/ and updates config/pages/gallery.json
 *
 * Usage:
 *   node scripts/extract-go2agro-gallery.mjs
 *   node scripts/extract-go2agro-gallery.mjs --write
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const SOURCE_URL = 'https://go2agro.com/gallery/'
const GALLERY_CONFIG_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'config',
  'pages',
  'gallery.json'
)

function normalizeKey(url) {
  return url
    .replace(/-\d+x\d+\.(jpg|jpeg|png|webp)$/i, '.$1')
    .replace(/-scaled\.(jpg|jpeg|png|webp)$/i, '.$1')
    .replace(/-compressed(-\d+)?\.(jpg|jpeg|png|webp)$/i, '.$1')
    .replace(/-min\.(jpg|jpeg|png|webp)$/i, '.$1')
    .replace(/-rotated\.(jpg|jpeg|png|webp)$/i, '.$1')
}

function score(url) {
  let value = 0
  if (url.includes('-scaled')) value -= 10
  if (url.includes('-compressed')) value -= 5
  if (url.includes('-min')) value -= 3
  if (/-\d+x\d+\./i.test(url)) value -= 8
  if (/\/2023\/02\/[2-7]\.png$/i.test(url)) value -= 20
  if (/go2agro/i.test(url) && url.endsWith('.png')) value -= 100
  if (url.includes('rotated')) value -= 2
  return value
}

function categorize(url) {
  const name = url.toLowerCase()
  if (name.includes('whatsapp')) return 'student-moments'
  if (name.includes('image-') && name.includes('compressed')) return 'field-training'
  if (name.includes('1659770')) return 'international-training'
  if (
    name.includes('img-2019') ||
    name.includes('img_2021') ||
    name.includes('img2021')
  ) {
    return 'international-training'
  }
  if (name.includes('/2023/02/') && name.endsWith('.png')) return 'events'
  return 'on-the-farm'
}

function extractPhotos(html) {
  const urls = [
    ...html.matchAll(
      /https:\/\/go2agro\.com\/wp-content\/uploads\/[^"'()\s>]+\.(?:jpg|jpeg|png|webp)/gi
    ),
  ].map((match) => match[0])

  const groups = new Map()
  for (const url of urls) {
    if (url.toLowerCase().includes('placeholder')) continue
    const key = normalizeKey(url)
    const existing = groups.get(key)
    if (!existing || score(url) > score(existing)) {
      groups.set(key, url)
    }
  }

  const photos = []
  for (const url of [...groups.values()].sort()) {
    if (score(url) < -50) continue
    photos.push({
      id: `photo-${photos.length + 1}`.padStart(8, '0').replace('photo-0', 'photo-'),
      src: url,
      alt: `International agricultural training and internship — photo ${photos.length + 1}`,
      category: categorize(url),
      featured: photos.length < 8 || photos.length % 13 === 0,
    })
  }

  return photos
}

async function main() {
  const shouldWrite = process.argv.includes('--write')
  console.log(`Fetching ${SOURCE_URL} ...`)

  const response = await fetch(SOURCE_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${SOURCE_URL}: ${response.status}`)
  }

  const html = await response.text()
  const photos = extractPhotos(html)
  const existing = JSON.parse(readFileSync(GALLERY_CONFIG_PATH, 'utf8'))

  const next = {
    ...existing,
    photos,
  }

  console.log(`Extracted ${photos.length} unique gallery photos`)
  if (shouldWrite) {
    writeFileSync(GALLERY_CONFIG_PATH, `${JSON.stringify(next, null, 2)}\n`)
    console.log(`Wrote ${GALLERY_CONFIG_PATH}`)
  } else {
    console.log('Tip: run with --write to update config/pages/gallery.json')
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
