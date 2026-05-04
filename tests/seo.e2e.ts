import { test, expect } from '@playwright/test'

const CANONICAL_URL = 'https://qualityneighbor.hartlandranch.com/'

async function metaContent(
  page: import('@playwright/test').Page,
  selector: string,
): Promise<string> {
  const el = page.locator(selector).first()
  await expect(el, `expected ${selector} to exist`).toHaveCount(1)
  const content = await el.getAttribute('content')
  return (content ?? '').trim()
}

test.describe('SEO meta tags', () => {
  test('page title contains QualityNeighbor', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Quality\s?Neighbor/i)
  })

  test('<meta name="description"> exists and is non-empty', async ({ page }) => {
    await page.goto('/')
    const desc = await metaContent(page, 'head meta[name="description"]')
    expect(desc.length).toBeGreaterThan(0)
  })

  test('Open Graph tags are present and non-empty', async ({ page }) => {
    await page.goto('/')

    const ogTitle = await metaContent(page, 'head meta[property="og:title"]')
    const ogDesc = await metaContent(page, 'head meta[property="og:description"]')
    const ogImage = await metaContent(page, 'head meta[property="og:image"]')
    const ogUrl = await metaContent(page, 'head meta[property="og:url"]')

    expect(ogTitle.length).toBeGreaterThan(0)
    expect(ogDesc.length).toBeGreaterThan(0)
    expect(ogImage.length).toBeGreaterThan(0)
    expect(ogUrl.length).toBeGreaterThan(0)
    expect(ogImage).toMatch(/^https?:\/\//)
  })

  test('Twitter Card tags are present', async ({ page }) => {
    await page.goto('/')

    const twCard = await metaContent(page, 'head meta[name="twitter:card"]')
    const twTitle = await metaContent(page, 'head meta[name="twitter:title"]')
    const twImage = await metaContent(page, 'head meta[name="twitter:image"]')

    expect(twCard.length).toBeGreaterThan(0)
    expect(twTitle.length).toBeGreaterThan(0)
    expect(twImage.length).toBeGreaterThan(0)
  })

  test('canonical link points to the production URL', async ({ page }) => {
    await page.goto('/')

    const canonical = page.locator('head link[rel="canonical"]').first()
    await expect(canonical).toHaveCount(1)

    const href = await canonical.getAttribute('href')
    expect(href).toBe(CANONICAL_URL)
  })

  test('theme-color meta is set to vintage red', async ({ page }) => {
    await page.goto('/')

    const themeColor = await metaContent(page, 'head meta[name="theme-color"]')
    expect(themeColor.toLowerCase()).toBe('#c31f2b')
  })
})
