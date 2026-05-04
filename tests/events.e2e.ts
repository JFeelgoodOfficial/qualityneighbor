import { test, expect } from '@playwright/test'

test.describe('Upcoming Events', () => {
  test('events section is visible', async ({ page }) => {
    await page.goto('/')

    const section = page
      .getByRole('region', { name: /events/i })
      .or(page.locator('[data-section="events"], #events'))
      .first()

    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
  })

  test('at least one event card renders with a title and a date', async ({ page }) => {
    await page.goto('/')

    const section = page
      .getByRole('region', { name: /events/i })
      .or(page.locator('[data-section="events"]'))
      .first()
    await section.scrollIntoViewIfNeeded()

    const cards = section.locator('[data-event-card], article, li').filter({ hasText: /.+/ })
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    const first = cards.first()

    const title = first.locator('h3, h4, [data-event-title]').first()
    const titleText = (await title.textContent())?.trim() ?? ''
    expect(titleText.length).toBeGreaterThan(0)

    const date = first.locator('time, [data-event-date]').first()
    await expect(date).toBeVisible()
    const dateText = (await date.textContent())?.trim() ?? ''
    expect(dateText.length).toBeGreaterThan(0)
  })

  test('countdown timer is present and shows a non-zero value', async ({ page }) => {
    await page.goto('/')

    const section = page
      .getByRole('region', { name: /events/i })
      .or(page.locator('[data-section="events"]'))
      .first()
    await section.scrollIntoViewIfNeeded()

    const countdown = section.locator('[data-countdown], [data-testid="countdown"]').first()
    await expect(countdown).toBeVisible()

    const text = (await countdown.textContent())?.trim() ?? ''
    expect(text.length).toBeGreaterThan(0)

    // Some unit (days/hours/minutes) must show a digit greater than zero somewhere.
    const numbers = text.match(/\d+/g) ?? []
    const hasNonZero = numbers.some((n) => Number(n) > 0)
    expect(hasNonZero, `countdown text "${text}" had no non-zero numbers`).toBe(true)
  })

  test('event dates are formatted, not raw ISO strings', async ({ page }) => {
    await page.goto('/')

    const section = page
      .getByRole('region', { name: /events/i })
      .or(page.locator('[data-section="events"]'))
      .first()
    await section.scrollIntoViewIfNeeded()

    const dates = section.locator('time, [data-event-date]')
    const count = await dates.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const text = (await dates.nth(i).textContent())?.trim() ?? ''
      expect(text).not.toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
      expect(text).not.toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})
