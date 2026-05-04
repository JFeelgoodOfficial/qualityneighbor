import { existsSync, readFileSync } from 'fs'

const required = [
  { path: './robots.txt',    mustContain: 'User-agent' },
  { path: './sitemap.xml',   mustContain: '<urlset' },
  { path: './manifest.json', mustContain: '"name"' },
]

let failed = false

for (const { path, mustContain } of required) {
  if (!existsSync(path)) {
    console.error(`MISSING  ${path}`)
    failed = true
    continue
  }

  const content = readFileSync(path, 'utf8')
  if (!content.includes(mustContain)) {
    console.error(`INVALID  ${path}  (expected to contain: ${mustContain})`)
    failed = true
    continue
  }

  console.log(`OK  ${path}`)
}

if (failed) {
  console.error('\nSEO files check failed.')
  process.exit(1)
}

console.log('\nSEO files check passed.')
