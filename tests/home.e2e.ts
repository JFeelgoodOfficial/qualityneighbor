import { test, expect, type ConsoleMessage } from '@playwright/test'

test.describe('Homepage', () => {
  test('page title contains QualityNeighbor', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Quality\s?Neighbor/i)
  })

  test('masthead renders with the tagline "Neighbors helping neighbors."', async ({ page }) => {
    await page.goto('/')

    const masthead = page.locator('header, [data-testid="masthead"], [data-section="hero"]').first()
    await expect(masthead).toBeVisible()

    await expect(page.getByText(/neighbors helping neighbors\.?/i).first()).toBeVisible()
  })

  test('subscribe CTA is present and visible', async ({ page }) => {
    await page.goto('/')

    const subscribeCta = page
      .getByRole('link', { name: /subscribe/i })
      .or(page.getByRole('button', { name: /subscribe/i }))
      .first()

    await expect(subscribeCta).toBeVisible()
  })

  test('At a Glance section renders below the fold', async ({ page }) => {
    await page.goto('/')

    const glance = page
      .getByRole('region', { name: /at a glance/i })
      .or(page.locator('[data-section="at-a-glance"], #at-a-glance'))
      .first()

    await glance.scrollIntoViewIfNeeded()
    await expect(glance).toBeVisible()
  })

  test('no console errors on initial load', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/', { waitUntil: 'networkidle' })

    expect(errors, `Console errors found:\n${errors.join('\n')}`).toEqual([])
  })

  test('respects prefers-reduced-motion: GSAP animation classes are not applied', async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()

    await page.goto('/', { waitUntil: 'networkidle' })

    const animatedElements = page.locator(
      '[data-gsap-animated="true"], [data-animation-state="playing"]',
    )
    await expect(animatedElements).toHaveCount(0)

    const transformedHero = await page.evaluate(() => {
      const hero = document.querySelector('[data-section="hero"], header')
      if (!hero) return null
      const style = window.getComputedStyle(hero)
      return { transform: style.transform, opacity: style.opacity }
    })

    if (transformedHero) {
      expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transformedHero.transform)
      expect(Number(transformedHero.opacity)).toBe(1)
    }

    await context.close()
  })
})
