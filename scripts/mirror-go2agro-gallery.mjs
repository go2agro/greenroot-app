#!/usr/bin/env node
/**
 * Downloads go2agro gallery images referenced by placeholder entries
 * and updates config/pages/gallery.json with local /images/gallery paths.
 *
 * Usage:
 *   node scripts/mirror-go2agro-gallery.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const GALLERY_PATH = join(ROOT, 'config/pages/gallery.json')
const OUT_DIR = join(ROOT, 'public/images/gallery')
const SOURCE_COMMIT = 'fd4842c'

function slugFromUrl(url) {
  const filename = url.split('/').pop() || 'image.jpg'
  return filename
    .replace(/-\d+x\d+\.(jpg|jpeg|png|webp)$/i, '.$1')
    .replace(/-scaled\.(jpg|jpeg|png|webp)$/i, '.$1')
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
}

async function main() {
  const previous = JSON.parse(
    execSync(`git show ${SOURCE_COMMIT}:config/pages/gallery.json`, {
      encoding: 'utf8',
      cwd: ROOT,
    })
  )
  const current = JSON.parse(readFileSync(GALLERY_PATH, 'utf8'))
  const previousById = new Map(previous.photos.map((photo) => [photo.id, photo]))

  mkdirSync(OUT_DIR, { recursive: true })

  let downloaded = 0
  let skipped = 0
  let failed = 0

  for (const photo of current.photos) {
    if (!photo.src.includes('placeholder.png')) {
      skipped++
      continue
    }

    const prev = previousById.get(photo.id)
    if (!prev?.src?.includes('go2agro.com')) {
      console.log('NO_SOURCE', photo.id)
      failed++
      continue
    }

    const localName = slugFromUrl(prev.src)
    const localPath = join(OUT_DIR, localName)
    const publicSrc = `/images/gallery/${localName}`

    if (!existsSync(localPath)) {
      const response = await fetch(prev.src)
      if (!response.ok) {
        console.log('FETCH_FAIL', response.status, prev.src)
        failed++
        continue
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      writeFileSync(localPath, buffer)
      downloaded++
      console.log('DOWNLOADED', localName)
    } else {
      console.log('EXISTS', localName)
    }

    photo.src = publicSrc
  }

  writeFileSync(GALLERY_PATH, `${JSON.stringify(current, null, 2)}\n`)
  console.log('DONE', { downloaded, skipped, failed })
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
