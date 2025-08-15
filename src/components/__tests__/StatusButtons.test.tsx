import { render, screen, fireEvent } from '@testing-library/react'
import { StatusButtons } from '../communication/StatusButtons'

describe('StatusButtons', () => {
  const mockOnAction = jest.fn()

  beforeEach(() => {
    mockOnAction.mockClear()
  })

  it('renders all 7 buttons', () => {
    render(<StatusButtons onAction={mockOnAction} />)
    expect(screen.getByText('Do Not Disturb')).toBeInTheDocument()
    expect(screen.getByText('Number Changed')).toBeInTheDocument()
    expect(screen.getByText('Delay / Call Back Later')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
    expect(screen.getByText('Option 4')).toBeInTheDocument()
  })

  it('handles Do Not Disturb click', () => {
    render(<StatusButtons onAction={mockOnAction} />)
    fireEvent.click(screen.getByText('Do Not Disturb'))
    expect(mockOnAction).toHaveBeenCalledWith({
      status: 'completed',
      result: 'Do Not Disturb',
      callbackDate: null
    })
  })

  it('handles Number Changed click', () => {
    render(<StatusButtons onAction={mockOnAction} />)
    fireEvent.click(screen.getByText('Number Changed'))
    expect(mockOnAction).toHaveBeenCalledWith({
      status: 'completed',
      result: 'Number Changed',
      callbackDate: null
    })
  })

  it('handles Option clicks', () => {
    render(<StatusButtons onAction={mockOnAction} />)
    fireEvent.click(screen.getByText('Option 1'))
    expect(mockOnAction).toHaveBeenCalledWith({
      status: 'completed',
      result: 'Option 1',
      callbackDate: null
    })
  })

  it('handles Delay button without calling onAction directly', () => {
    render(<StatusButtons onAction={mockOnAction} />)
    fireEvent.click(screen.getByText('Delay / Call Back Later'))
    // Should open dialog, not call onAction immediately
    expect(mockOnAction).not.toHaveBeenCalled()
  })
})