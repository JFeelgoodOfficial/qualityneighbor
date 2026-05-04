import { test, expect } from '@playwright/test'

test.describe('PWA compliance', () => {
  test('<link rel="manifest"> is present in <head>', async ({ page }) => {
    await page.goto('/')

    const manifestLink = page.locator('head link[rel="manifest"]')
    await expect(manifestLink).toHaveCount(1)

    const href = await manifestLink.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).toMatch(/\.(webmanifest|json)$/i)
  })

  test('<meta name="theme-color" content="#C31F2B"> is present', async ({ page }) => {
    await page.goto('/')

    const themeColor = page.locator('head meta[name="theme-color"]').first()
    await expect(themeColor).toHaveCount(1)

    const content = await themeColor.getAttribute('content')
    expect(content?.toLowerCase()).toBe('#c31f2b')
  })

  test('manifest is fetchable and declares display: standalone', async ({ page, request }) => {
    await page.goto('/')

    const href = await page.locator('head link[rel="manifest"]').first().getAttribute('href')
    expect(href).toBeTruthy()

    const url = new URL(href!, page.url()).toString()
    const response = await request.get(url)
    expect(response.ok(), `manifest fetch failed: ${response.status()}`).toBe(true)

    const manifest = (await response.json()) as Record<string, unknown>
    expect(manifest.display).toBe('standalone')
  })

  test('manifest declares at least one 192px icon', async ({ page, request }) => {
    await page.goto('/')

    const href = await page.locator('head link[rel="manifest"]').first().getAttribute('href')
    const url = new URL(href!, page.url()).toString()
    const response = await request.get(url)
    const manifest = (await response.json()) as {
      icons?: Array<{ src: string; sizes: string; type?: string }>
    }

    expect(Array.isArray(manifest.icons)).toBe(true)

    const has192 = (manifest.icons ?? []).some((icon) =>
      (icon.sizes ?? '').split(/\s+/).some((size) => size.toLowerCase() === '192x192'),
    )

    expect(has192, 'manifest must declare a 192x192 icon').toBe(true)
  })

  test('manifest background color matches paper-primary token', async ({ page, request }) => {
    await page.goto('/')

    const href = await page.locator('head link[rel="manifest"]').first().getAttribute('href')
    const url = new URL(href!, page.url()).toString()
    const response = await request.get(url)
    const manifest = (await response.json()) as { background_color?: string }

    expect(manifest.background_color?.toLowerCase()).toBe('#f4f1ea')
  })
})
