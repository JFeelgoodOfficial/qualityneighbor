import { test, expect } from '@playwright/test'

test.describe('Monthly Poll', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const keys: string[] = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i)
        if (k && k.startsWith('qn:poll:')) keys.push(k)
      }
      keys.forEach((k) => window.localStorage.removeItem(k))
    })
  })

  test('poll question is visible', async ({ page }) => {
    await page.goto('/')

    const section = page
      .getByRole('region', { name: /poll/i })
      .or(page.locator('[data-section="poll"], #poll'))
      .first()
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()

    const question = section.locator('h2, h3, [data-poll-question]').first()
    await expect(question).toBeVisible()
    const text = (await question.textContent())?.trim() ?? ''
    expect(text.length).toBeGreaterThan(0)
  })

  test('user can select an option and submit; results view appears', async ({ page }) => {
    await page.goto('/')

    const section = page
      .getByRole('region', { name: /poll/i })
      .or(page.locator('[data-section="poll"]'))
      .first()
    await section.scrollIntoViewIfNeeded()

    const firstOption = section.getByRole('radio').first()
    await firstOption.check()
    await expect(firstOption).toBeChecked()

    const submit = section.getByRole('button', { name: /submit|vote/i })
    await submit.click()

    const results = section
      .getByRole('region', { name: /results/i })
      .or(section.getByText(/thank|results/i))
      .first()
    await expect(results).toBeVisible()
  })

  test('reload after voting still shows results, not the voting form', async ({ page }) => {
    await page.goto('/')

    const section = page
      .getByRole('region', { name: /poll/i })
      .or(page.locator('[data-section="poll"]'))
      .first()
    await section.scrollIntoViewIfNeeded()

    await section.getByRole('radio').first().check()
    await section.getByRole('button', { name: /submit|vote/i }).click()

    await expect(section.getByText(/thank|results/i).first()).toBeVisible()

    await page.reload()

    const sectionAfter = page
      .getByRole('region', { name: /poll/i })
      .or(page.locator('[data-section="poll"]'))
      .first()
    await sectionAfter.scrollIntoViewIfNeeded()

    await expect(sectionAfter.getByRole('button', { name: /^submit$|^vote$/i })).toHaveCount(0)
    await expect(sectionAfter.getByText(/thank|results/i).first()).toBeVisible()
  })
})
