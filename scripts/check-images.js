import { readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const IMAGES_DIR = './images'
const MAX_IMAGE_BYTES = 500 * 1024  // 500 KB
const MAX_VIDEO_BYTES = 5 * 1024 * 1024  // 5 MB

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'])
const VIDEO_EXTS = new Set(['.mp4', '.webm'])

let failed = false

const files = readdirSync(IMAGES_DIR)
for (const file of files) {
  const ext = extname(file).toLowerCase()
  const filePath = join(IMAGES_DIR, file)
  const { size } = statSync(filePath)

  let limit = null
  if (IMAGE_EXTS.has(ext)) limit = MAX_IMAGE_BYTES
  else if (VIDEO_EXTS.has(ext)) limit = MAX_VIDEO_BYTES
  else continue

  const kb = (size / 1024).toFixed(1)
  const limitKb = (limit / 1024).toFixed(0)

  if (size > limit) {
    console.error(`FAIL  ${file}  ${kb} KB  (limit: ${limitKb} KB)`)
    failed = true
  } else {
    console.log(`OK    ${file}  ${kb} KB`)
  }
}

if (failed) {
  console.error('\nImage audit failed — compress the files listed above before merging.')
  process.exit(1)
}

console.log('\nImage audit passed.')
