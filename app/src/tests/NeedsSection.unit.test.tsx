import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the needs data module so the component renders deterministic content.
// Adjust the path/module name if the project exports needs from a different location.
vi.mock('@/sections/NeedsSection.data', () => ({
  needs: [
    {
      id: 'n1',
      title: 'Borrow a ladder this weekend',
      body: 'Need an 8-foot ladder Saturday morning to clean gutters.',
      category: 'help-wanted',
      author: 'Sam R.',
      date: '2026-04-12',
    },
    {
      id: 'n2',
      title: 'Free tomato seedlings',
      body: 'I overplanted. Heirloom Cherokee Purple, four pots left.',
      category: 'offering',
      author: 'Lina K.',
      date: '2026-04-15',
    },
    {
      id: 'n3',
      title: 'Lost: gray tabby on Pecan Lane',
      body: 'His name is Biscuit. Microchipped. Reward.',
      category: 'lost-found',
      author: 'Marcus T.',
      date: '2026-04-18',
    },
  ],
}))

import NeedsSection from '@/sections/NeedsSection'

const HELPFUL_KEY = 'qn:needs:helpful'

describe('NeedsSection', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the Needs Board heading and at least one need card', () => {
    render(<NeedsSection />)

    const heading = screen.getByRole('heading', { name: /needs/i, level: 2 })
    expect(heading).toBeInTheDocument()

    expect(screen.getByText(/borrow a ladder this weekend/i)).toBeInTheDocument()
    expect(screen.getByText(/free tomato seedlings/i)).toBeInTheDocument()
    expect(screen.getByText(/lost: gray tabby on pecan lane/i)).toBeInTheDocument()
  })

  it('exposes the four filter controls', () => {
    render(<NeedsSection />)

    const filterRegion = screen.getByRole('group', { name: /filter/i })
    const scope = within(filterRegion)

    expect(scope.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(scope.getByRole('button', { name: /help wanted/i })).toBeInTheDocument()
    expect(scope.getByRole('button', { name: /offering/i })).toBeInTheDocument()
    expect(scope.getByRole('button', { name: /lost.*found/i })).toBeInTheDocument()
  })

  it('filters cards when a category button is clicked', async () => {
    const user = userEvent.setup()
    render(<NeedsSection />)

    expect(screen.getByText(/borrow a ladder/i)).toBeInTheDocument()
    expect(screen.getByText(/free tomato seedlings/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /offering/i }))

    expect(screen.queryByText(/borrow a ladder/i)).not.toBeInTheDocument()
    expect(screen.getByText(/free tomato seedlings/i)).toBeInTheDocument()
    expect(screen.queryByText(/gray tabby/i)).not.toBeInTheDocument()
  })

  it('persists "Mark as Helpful" state to localStorage', async () => {
    const user = userEvent.setup()
    render(<NeedsSection />)

    const ladderCard = screen.getByText(/borrow a ladder/i).closest('article, li, div')
    expect(ladderCard).not.toBeNull()

    const helpfulButton = within(ladderCard as HTMLElement).getByRole('button', {
      name: /helpful/i,
    })

    await user.click(helpfulButton)

    const stored = window.localStorage.getItem(HELPFUL_KEY)
    expect(stored).not.toBeNull()
    expect(stored).toContain('n1')

    expect(helpfulButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('hydrates helpful state from localStorage on mount', () => {
    window.localStorage.setItem(HELPFUL_KEY, JSON.stringify(['n2']))

    render(<NeedsSection />)

    const tomatoCard = screen.getByText(/free tomato seedlings/i).closest('article, li, div')
    const helpfulButton = within(tomatoCard as HTMLElement).getByRole('button', {
      name: /helpful/i,
    })

    expect(helpfulButton).toHaveAttribute('aria-pressed', 'true')
  })
})
