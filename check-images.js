#!/usr/bin/env node
/**
 * check-images.js
 *
 * Scans /app/src/assets/ and /public/ recursively.
 * - Fails (exit 1) if any single image > 500KB
 * - Warns if a .png could be a .webp
 * - Warns if any image filename contains spaces or uppercase letters
 * - Prints a summary: count, total size, violations
 *
 * No third-party dependencies.
 */

'use strict'

const fs = require('node:fs')
const path = require('node:path')

const REPO_ROOT = path.resolve(__dirname, '..')
const SCAN_DIRS = [
  path.join(REPO_ROOT, 'app', 'src', 'assets'),
  path.join(REPO_ROOT, 'public'),
  path.join(REPO_ROOT, 'app', 'public'),
]

const MAX_BYTES = 500 * 1024 // 500 KB
const IMAGE_EXTS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.avif',
  '.svg',
  '.ico',
  '.bmp',
  '.tiff',
])

const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN = '\x1b[32m'
const DIM = '\x1b[2m'
const RESET = '\x1b[0m'

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walk(dir) {
  /** @type {string[]} */
  const out = []
  if (!fs.existsSync(dir)) return out

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walk(full))
    } else if (entry.isFile()) {
      out.push(full)
    }
  }
  return out
}

/**
 * @param {number} bytes
 * @returns {string}
 */
function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function rel(p) {
  return path.relative(REPO_ROOT, p)
}

function main() {
  /** @type {Array<{ path: string; size: number }>} */
  const images = []
  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      const ext = path.extname(file).toLowerCase()
      if (!IMAGE_EXTS.has(ext)) continue
      const stat = fs.statSync(file)
      images.push({ path: file, size: stat.size })
    }
  }

  /** @type {string[]} */
  const violations = []
  /** @type {string[]} */
  const warnings = []

  for (const img of images) {
    const ext = path.extname(img.path).toLowerCase()
    const base = path.basename(img.path)

    if (img.size > MAX_BYTES && ext !== '.svg') {
      violations.push(
        `${rel(img.path)} is ${fmtBytes(img.size)} (limit ${fmtBytes(MAX_BYTES)})`,
      )
    }

    if (ext === '.png') {
      warnings.push(`${rel(img.path)} could be served as .webp for smaller size`)
    }

    if (/\s/.test(base)) {
      warnings.push(`${rel(img.path)} filename contains spaces (breaks consistent imports)`)
    }

    if (base !== base.toLowerCase()) {
      warnings.push(`${rel(img.path)} filename contains uppercase letters`)
    }
  }

  const totalBytes = images.reduce((a, b) => a + b.size, 0)

  console.log(`${DIM}---- Image audit ----${RESET}`)
  console.log(`Scanned ${images.length} image(s), total ${fmtBytes(totalBytes)}`)

  if (warnings.length > 0) {
    console.log(`\n${YELLOW}Warnings (${warnings.length}):${RESET}`)
    warnings.forEach((w) => console.log(`  ${YELLOW}!${RESET} ${w}`))
  }

  if (violations.length > 0) {
    console.log(`\n${RED}Violations (${violations.length}):${RESET}`)
    violations.forEach((v) => console.log(`  ${RED}x${RESET} ${v}`))
    console.log(`\n${RED}Image audit failed.${RESET}`)
    process.exit(1)
  }

  console.log(`\n${GREEN}Image audit passed.${RESET}`)
  process.exit(0)
}

main()
