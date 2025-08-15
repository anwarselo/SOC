import { render, screen } from '@testing-library/react'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('shows pending message for pending view', () => {
    render(<EmptyState view="pending" />)
    expect(screen.getByText('No New Customers')).toBeInTheDocument()
    expect(screen.getByText(/All customers have been contacted/)).toBeInTheDocument()
  })

  it('shows callbacks message for callbacks view', () => {
    render(<EmptyState view="callbacks" />)
    expect(screen.getByText('No Callbacks Today')).toBeInTheDocument()
    expect(screen.getByText(/No callbacks scheduled for today/)).toBeInTheDocument()
  })
})