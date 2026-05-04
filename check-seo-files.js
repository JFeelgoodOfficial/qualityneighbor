#!/usr/bin/env node
/**
 * check-seo-files.js
 *
 * - Confirms sitemap.xml exists at repo root
 * - Confirms robots.txt exists at repo root
 * - Confirms robots.txt contains the sitemap reference
 * - Confirms sitemap.xml contains the canonical URL
 *
 * No third-party dependencies. Exits 1 with a clear message on any violation.
 */

'use strict'

const fs = require('node:fs')
const path = require('node:path')

const REPO_ROOT = path.resolve(__dirname, '..')
const CANONICAL_URL = 'https://qualityneighbor.hartlandranch.com/'
const SITEMAP_URL = 'https://qualityneighbor.hartlandranch.com/sitemap.xml'

const SITEMAP_PATH = path.join(REPO_ROOT, 'sitemap.xml')
const ROBOTS_PATH = path.join(REPO_ROOT, 'robots.txt')

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const RESET = '\x1b[0m'

/** @type {string[]} */
const violations = []

function fileExists(p) {
  try {
    return fs.statSync(p).isFile()
  } catch {
    return false
  }
}

function check(condition, message) {
  if (!condition) violations.push(message)
}

function main() {
  // 1. sitemap.xml exists
  check(fileExists(SITEMAP_PATH), `sitemap.xml not found at ${SITEMAP_PATH}`)

  // 2. robots.txt exists
  check(fileExists(ROBOTS_PATH), `robots.txt not found at ${ROBOTS_PATH}`)

  // 3. robots.txt declares the sitemap
  if (fileExists(ROBOTS_PATH)) {
    const robots = fs.readFileSync(ROBOTS_PATH, 'utf8')
    const expected = `Sitemap: ${SITEMAP_URL}`
    check(
      robots.includes(expected),
      `robots.txt is missing the sitemap line:\n    ${expected}`,
    )
  }

  // 4. sitemap.xml contains the canonical URL
  if (fileExists(SITEMAP_PATH)) {
    const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8')
    check(
      sitemap.includes(CANONICAL_URL),
      `sitemap.xml does not contain the canonical URL: ${CANONICAL_URL}`,
    )
  }

  if (violations.length > 0) {
    console.log(`${RED}SEO files check failed:${RESET}`)
    violations.forEach((v) => console.log(`  ${RED}x${RESET} ${v}`))
    process.exit(1)
  }

  console.log(`${GREEN}SEO files check passed.${RESET}`)
  console.log(`  sitemap.xml -> references ${CANONICAL_URL}`)
  console.log(`  robots.txt  -> references ${SITEMAP_URL}`)
  process.exit(0)
}

main()
