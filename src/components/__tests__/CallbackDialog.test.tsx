import { render, screen, fireEvent } from '@testing-library/react'
import { CallbackDialog } from '../workflow-orchestration/CallbackDialog'

describe('CallbackDialog', () => {
  const mockOnSave = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    mockOnSave.mockClear()
    mockOnCancel.mockClear()
  })

  it('renders dialog with title', () => {
    render(<CallbackDialog onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByText('Schedule Callback')).toBeInTheDocument()
  })

  it('renders date input', () => {
    render(<CallbackDialog onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByLabelText('Callback Date')).toBeInTheDocument()
  })

  it('Save button disabled without date', () => {
    render(<CallbackDialog onSave={mockOnSave} onCancel={mockOnCancel} />)
    const saveButton = screen.getByText('Save')
    expect(saveButton).toBeDisabled()
  })

  it('Save button enabled with date', () => {
    render(<CallbackDialog onSave={mockOnSave} onCancel={mockOnCancel} />)
    const dateInput = screen.getByLabelText('Callback Date')
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } })
    const saveButton = screen.getByText('Save')
    expect(saveButton).not.toBeDisabled()
  })

  it('calls onSave with date', () => {
    render(<CallbackDialog onSave={mockOnSave} onCancel={mockOnCancel} />)
    const dateInput = screen.getByLabelText('Callback Date')
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } })
    fireEvent.click(screen.getByText('Save'))
    expect(mockOnSave).toHaveBeenCalledWith('2024-12-25')
  })

  it('calls onCancel when Cancel clicked', () => {
    render(<CallbackDialog onSave={mockOnSave} onCancel={mockOnCancel} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnCancel).toHaveBeenCalled()
  })
})