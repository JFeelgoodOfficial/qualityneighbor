import { test, expect } from '@playwright/test'

test.describe('Neighborly Needs Board', () => {
  test('section is visible and renders at least one need card', async ({ page }) => {
    await page.goto('/')

    const section = page
      .getByRole('region', { name: /needs/i })
      .or(page.locator('[data-section="needs"], #needs'))
      .first()

    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()

    const cards = section.locator('[data-need-card], article, li').filter({
      hasText: /.+/,
    })

    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('every visible need card has a non-empty title and body', async ({ page }) => {
    await page.goto('/')

    const section = page
      .getByRole('region', { name: /needs/i })
      .or(page.locator('[data-section="needs"]'))
      .first()
    await section.scrollIntoViewIfNeeded()

    const cards = section.locator('[data-need-card], article')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)

      const title = card.locator('h3, h4, [data-need-title]').first()
      const titleText = (await title.textContent())?.trim() ?? ''
      expect(titleText.length, `card ${i} has empty title`).toBeGreaterThan(0)

      const body = card.locator('p, [data-need-body]').first()
      const bodyText = (await body.textContent())?.trim() ?? ''
      expect(bodyText.length, `card ${i} has empty body`).toBeGreaterThan(0)
    }
  })

  test('filter interaction works via touch/tap on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only test')

    await page.goto('/')

    const section = page
      .getByRole('region', { name: /needs/i })
      .or(page.locator('[data-section="needs"]'))
      .first()
    await section.scrollIntoViewIfNeeded()

    const allBefore = await section.locator('[data-need-card], article').count()

    const offeringFilter = section.getByRole('button', { name: /offering/i })
    await offeringFilter.tap()

    await expect.poll(async () => section.locator('[data-need-card], article').count()).toBeLessThanOrEqual(
      allBefore,
    )

    const offeringCards = section.locator('[data-need-category="offering"], [data-need-card]')
    const offeringCount = await offeringCards.count()
    expect(offeringCount).toBeGreaterThan(0)
  })

  test('"Mark as Helpful" persists across a page reload', async ({ page }) => {
    await page.goto('/')

    const section = page
      .getByRole('region', { name: /needs/i })
      .or(page.locator('[data-section="needs"]'))
      .first()
    await section.scrollIntoViewIfNeeded()

    const firstCard = section.locator('[data-need-card], article').first()
    const helpful = firstCard.getByRole('button', { name: /helpful/i })

    await helpful.click()
    await expect(helpful).toHaveAttribute('aria-pressed', 'true')

    await page.reload()

    const sectionAfter = page
      .getByRole('region', { name: /needs/i })
      .or(page.locator('[data-section="needs"]'))
      .first()
    await sectionAfter.scrollIntoViewIfNeeded()

    const firstCardAfter = sectionAfter.locator('[data-need-card], article').first()
    const helpfulAfter = firstCardAfter.getByRole('button', { name: /helpful/i })

    await expect(helpfulAfter).toHaveAttribute('aria-pressed', 'true')
  })
})
