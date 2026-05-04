import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('homepage has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    if (results.violations.length > 0) {
      const formatted = results.violations
        .map((v) => `- [${v.id}] ${v.help} (${v.nodes.length} node(s))`)
        .join('\n')
      console.log('Axe violations:\n' + formatted)
    }

    expect(results.violations).toEqual([])
  })

  test('color contrast specifically: --espresso text on --paper-primary background', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const results = await new AxeBuilder({ page })
      .options({ runOnly: ['color-contrast'] })
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('every <img> has a non-empty alt attribute', async ({ page }) => {
    await page.goto('/')

    const images = page.locator('img')
    const count = await images.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt, `image ${i} is missing alt`).not.toBeNull()
      expect((alt ?? '').trim().length, `image ${i} has empty alt`).toBeGreaterThan(0)
    }
  })

  test('all interactive elements are keyboard-focusable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const interactives = page.locator(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )

    const count = await interactives.count()
    expect(count).toBeGreaterThan(0)

    const sample = Math.min(count, 25)
    for (let i = 0; i < sample; i++) {
      const el = interactives.nth(i)
      if (!(await el.isVisible())) continue

      const tabindex = await el.getAttribute('tabindex')
      expect(tabindex !== '-1', `element ${i} has tabindex="-1"`).toBe(true)
    }
  })

  test('Needs Board filter buttons have accessible labels', async ({ page }) => {
    await page.goto('/')

    const section = page
      .getByRole('region', { name: /needs/i })
      .or(page.locator('[data-section="needs"]'))
      .first()
    await section.scrollIntoViewIfNeeded()

    const filterButtons = section
      .getByRole('group', { name: /filter/i })
      .getByRole('button')
      .or(section.locator('[data-need-filter] button'))

    const count = await filterButtons.count()
    expect(count).toBeGreaterThanOrEqual(4)

    for (let i = 0; i < count; i++) {
      const btn = filterButtons.nth(i)
      const ariaLabel = (await btn.getAttribute('aria-label')) ?? ''
      const text = ((await btn.textContent()) ?? '').trim()
      const accessibleName = ariaLabel.length > 0 ? ariaLabel : text

      expect(accessibleName.length, `filter button ${i} has no accessible name`).toBeGreaterThan(0)
    }
  })
})
