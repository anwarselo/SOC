import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ErrorReporter } from '../ErrorReporter'

// Mock fetch
global.fetch = jest.fn()

// Mock html2canvas
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(() => 
    Promise.resolve({
      toDataURL: () => 'data:image/png;base64,mockbase64'
    })
  )
}))

describe('ErrorReporter', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear()
  })

  it('renders Report Issue button', () => {
    render(<ErrorReporter />)
    expect(screen.getByText('Report Issue')).toBeInTheDocument()
  })

  it('disables button while capturing', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ logId: 'test-123' })
    })

    render(<ErrorReporter />)
    const button = screen.getByText('Report Issue')
    
    fireEvent.click(button)
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Capturing...')
    
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
  })

  it('shows success message with logId', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ logId: 'test-123' })
    })

    render(<ErrorReporter />)
    fireEvent.click(screen.getByText('Report Issue'))
    
    await waitFor(() => {
      expect(screen.getByText(/Issue reported successfully/)).toBeInTheDocument()
      expect(screen.getByText(/Log ID: test-123/)).toBeInTheDocument()
    })
  })

  it('shows error message on failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<ErrorReporter />)
    fireEvent.click(screen.getByText('Report Issue'))
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to report issue/)).toBeInTheDocument()
    })
  })
})