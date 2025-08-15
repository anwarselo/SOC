import { render, screen, fireEvent } from '@testing-library/react'
import { FilterTabs } from '../FilterTabs'

describe('FilterTabs', () => {
  it('renders both tabs', () => {
    render(<FilterTabs activeView="pending" onChange={() => {}} />)
    expect(screen.getByText('New Customers')).toBeInTheDocument()
    expect(screen.getByText("Today's Callbacks")).toBeInTheDocument()
  })

  it('shows active state on pending tab', () => {
    render(<FilterTabs activeView="pending" onChange={() => {}} />)
    const pendingTab = screen.getByText('New Customers')
    expect(pendingTab).toHaveClass('bg-blue-50')
    expect(pendingTab).toHaveClass('border-blue-200')
  })

  it('shows active state on callbacks tab', () => {
    render(<FilterTabs activeView="callbacks" onChange={() => {}} />)
    const callbackTab = screen.getByText("Today's Callbacks")
    expect(callbackTab).toHaveClass('bg-blue-50')
    expect(callbackTab).toHaveClass('border-blue-200')
  })

  it('calls onChange when clicking inactive tab', () => {
    const onChange = jest.fn()
    render(<FilterTabs activeView="pending" onChange={onChange} />)
    fireEvent.click(screen.getByText("Today's Callbacks"))
    expect(onChange).toHaveBeenCalledWith('callbacks')
  })

  it('does not call onChange when clicking active tab', () => {
    const onChange = jest.fn()
    render(<FilterTabs activeView="pending" onChange={onChange} />)
    fireEvent.click(screen.getByText('New Customers'))
    expect(onChange).not.toHaveBeenCalled()
  })
})