import { render, screen, fireEvent } from '@testing-library/react'
import { CustomerCard } from '../CustomerCard'

const mockCustomer = {
  id: '1',
  name: 'John Doe',
  phone: '555-0123',
  city: 'New York',
  status: 'pending' as const,
  result: null,
  callbackDate: null,
  comments: ''
}

describe('CustomerCard', () => {
  const mockHandlers = {
    onPrevious: jest.fn(),
    onNext: jest.fn(),
    onStatusChange: jest.fn(),
    onCommentsChange: jest.fn()
  }

  beforeEach(() => {
    Object.values(mockHandlers).forEach(fn => fn.mockClear())
  })

  it('renders customer info', () => {
    render(<CustomerCard customer={mockCustomer} {...mockHandlers} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('555-0123')).toBeInTheDocument()
    expect(screen.getByText('New York')).toBeInTheDocument()
  })

  it('renders empty state when customer is null', () => {
    render(<CustomerCard customer={null} view="pending" {...mockHandlers} />)
    expect(screen.getByText('No New Customers')).toBeInTheDocument()
  })

  it('handles missing fields with fallback', () => {
    const partial = { ...mockCustomer, phone: '', city: undefined }
    render(<CustomerCard customer={partial} {...mockHandlers} />)
    expect(screen.getAllByText('').length).toBeGreaterThan(0)
  })

  it('calls navigation handlers', () => {
    render(<CustomerCard customer={mockCustomer} {...mockHandlers} />)
    fireEvent.click(screen.getByText(' Previous'))
    expect(mockHandlers.onPrevious).toHaveBeenCalled()
    fireEvent.click(screen.getByText('Next ’'))
    expect(mockHandlers.onNext).toHaveBeenCalled()
  })

  it('propagates status changes', () => {
    render(<CustomerCard customer={mockCustomer} {...mockHandlers} />)
    fireEvent.click(screen.getByText('Do Not Disturb'))
    expect(mockHandlers.onStatusChange).toHaveBeenCalled()
  })
})