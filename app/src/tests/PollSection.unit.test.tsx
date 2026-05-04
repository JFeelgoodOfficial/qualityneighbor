import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/sections/PollSection.data', () => ({
  poll: {
    id: 'apr-2026-park',
    question: 'Which amenity would you most like to see at the new community park?',
    options: [
      { id: 'opt-shade', label: 'Shade structures over the playground' },
      { id: 'opt-dogpark', label: 'Fenced dog park' },
      { id: 'opt-walking', label: 'Lighted walking loop' },
      { id: 'opt-pavilion', label: 'Covered pavilion for events' },
    ],
  },
}))

import PollSection from '@/sections/PollSection'

const POLL_KEY = 'qn:poll:apr-2026-park'

describe('PollSection', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the poll question and all options for a first-time visitor', () => {
    render(<PollSection />)

    expect(
      screen.getByRole('heading', {
        name: /which amenity would you most like to see/i,
      }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText(/shade structures/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fenced dog park/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lighted walking loop/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/covered pavilion/i)).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /submit|vote/i })).toBeInTheDocument()
  })

  it('lets a user select an option, submit, and shows the results view', async () => {
    const user = userEvent.setup()
    render(<PollSection />)

    await user.click(screen.getByLabelText(/fenced dog park/i))
    await user.click(screen.getByRole('button', { name: /submit|vote/i }))

    expect(screen.getByText(/results|thank/i)).toBeInTheDocument()

    expect(screen.queryByRole('button', { name: /^submit$|^vote$/i })).not.toBeInTheDocument()

    const stored = window.localStorage.getItem(POLL_KEY)
    expect(stored).not.toBeNull()
    expect(stored).toContain('opt-dogpark')
  })

  it('shows the results view immediately when localStorage already records a vote', () => {
    window.localStorage.setItem(
      POLL_KEY,
      JSON.stringify({ optionId: 'opt-walking', votedAt: '2026-04-15T10:00:00Z' }),
    )

    render(<PollSection />)

    expect(screen.queryByRole('button', { name: /^submit$|^vote$/i })).not.toBeInTheDocument()

    const results = screen.getByRole('region', { name: /results/i })
    expect(results).toBeInTheDocument()

    expect(within(results).getByText(/lighted walking loop/i)).toBeInTheDocument()
  })

  it('disables the submit button until an option is selected', () => {
    render(<PollSection />)
    const submit = screen.getByRole('button', { name: /submit|vote/i })
    expect(submit).toBeDisabled()
  })
})
