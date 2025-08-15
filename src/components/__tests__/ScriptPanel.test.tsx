import { render, screen } from '@testing-library/react'
import { ScriptPanel } from '../ScriptPanel'

describe('ScriptPanel', () => {
  it('shows initial outreach script for pending status', () => {
    render(<ScriptPanel status="pending" />)
    expect(screen.getByText('Initial Outreach Script')).toBeInTheDocument()
    expect(screen.getByText(/Hello, I'm calling from SedarOutreach/)).toBeInTheDocument()
  })

  it('shows follow-up script for callback status without date', () => {
    render(<ScriptPanel status="callback" />)
    expect(screen.getByText('Follow-Up Script')).toBeInTheDocument()
    expect(screen.getByText(/following up on our previous conversation/)).toBeInTheDocument()
  })

  it('shows follow-up script with date for callback status', () => {
    render(<ScriptPanel status="callback" callbackDate="2024-12-25" />)
    expect(screen.getByText('Follow-Up Script')).toBeInTheDocument()
    expect(screen.getByText(/Scheduled for: 2024-12-25/)).toBeInTheDocument()
  })

  it('shows completion message for completed status', () => {
    render(<ScriptPanel status="completed" />)
    expect(screen.getByText('Call Completed')).toBeInTheDocument()
    expect(screen.getByText(/This customer has been contacted/)).toBeInTheDocument()
  })

  it('applies green styling for completed status', () => {
    const { container } = render(<ScriptPanel status="completed" />)
    const panel = container.firstChild
    expect(panel).toHaveClass('bg-green-50')
    expect(panel).toHaveClass('border-green-200')
  })

  it('applies neutral styling for pending status', () => {
    const { container } = render(<ScriptPanel status="pending" />)
    const panel = container.firstChild
    expect(panel).toHaveClass('bg-neutral-50')
    expect(panel).toHaveClass('border-neutral-200')
  })
})