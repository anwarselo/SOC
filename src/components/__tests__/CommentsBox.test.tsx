import { render, screen, fireEvent } from '@testing-library/react'
import { CommentsBox } from '../communication/CommentsBox'

describe('CommentsBox', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders label and textarea', () => {
    render(<CommentsBox value="" onChange={mockOnChange} />)
    expect(screen.getByText('Comments')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Add notes about this call...')).toBeInTheDocument()
  })

  it('displays initial value', () => {
    render(<CommentsBox value="Test comment" onChange={mockOnChange} />)
    const textarea = screen.getByPlaceholderText('Add notes about this call...')
    expect(textarea).toHaveValue('Test comment')
  })

  it('calls onChange when typing', () => {
    render(<CommentsBox value="" onChange={mockOnChange} />)
    const textarea = screen.getByPlaceholderText('Add notes about this call...')
    fireEvent.change(textarea, { target: { value: 'New comment' } })
    expect(mockOnChange).toHaveBeenCalledWith('New comment')
  })
})