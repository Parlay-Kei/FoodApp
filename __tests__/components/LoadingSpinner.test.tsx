import { render, screen } from '@testing-library/react'
import LoadingSpinner from '@/components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default medium size', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status', { name: 'Loading' })
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
    expect(spinner).toHaveClass('w-8 h-8') // medium size
  })

  it('renders with small size', () => {
    render(<LoadingSpinner size="small" />)
    const spinner = screen.getByRole('status', { name: 'Loading' })
    expect(spinner).toHaveClass('w-4 h-4')
  })

  it('renders with large size', () => {
    render(<LoadingSpinner size="large" />)
    const spinner = screen.getByRole('status', { name: 'Loading' })
    expect(spinner).toHaveClass('w-12 h-12')
  })

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status', { name: 'Loading' })
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })
}) 