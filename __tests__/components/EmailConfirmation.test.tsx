import { render, screen, fireEvent, act } from '@testing-library/react'
import EmailConfirmation from '@/components/EmailConfirmation'

describe('EmailConfirmation', () => {
  jest.useFakeTimers()
  const props = { orderId: '123', userEmail: 'test@example.com' }

  it('renders send button initially', () => {
    render(<EmailConfirmation {...props} />)
    expect(screen.getByRole('button', { name: 'Send Confirmation Email' })).toBeInTheDocument()
  })

  it('shows loading state when clicked', () => {
    render(<EmailConfirmation {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Send Confirmation Email' }))
    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled()
  })

  it('shows success message after sending', () => {
    render(<EmailConfirmation {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Send Confirmation Email' }))
    act(() => {
      jest.runAllTimers()
    })
    expect(screen.getByText('✓ Confirmation email sent!')).toBeInTheDocument()
    expect(screen.getByText('Check your inbox for order details.')).toBeInTheDocument()
  })
}) 