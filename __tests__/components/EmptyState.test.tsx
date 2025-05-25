import { render, screen } from '@testing-library/react'
import EmptyState from '@/components/EmptyState'

// Mock icon component for testing
const MockIcon = ({ className }: { className?: string }) => (
  <svg className={className} data-testid="mock-icon" />
)

describe('EmptyState', () => {
  const defaultProps = {
    title: 'No Items',
    message: 'There are no items to display',
  }

  it('renders with required props', () => {
    render(<EmptyState {...defaultProps} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('No Items')).toBeInTheDocument()
    expect(screen.getByText('There are no items to display')).toBeInTheDocument()
  })

  it('renders with icon when provided', () => {
    render(<EmptyState {...defaultProps} icon={MockIcon} />)
    const icon = screen.getByTestId('mock-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('h-12 w-12 text-gray-400')
  })

  it('renders action link when provided', () => {
    const actionProps = {
      ...defaultProps,
      actionLabel: 'Add Item',
      actionLink: '/add',
    }
    render(<EmptyState {...actionProps} />)
    const link = screen.getByRole('link', { name: 'Add Item' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/add')
    expect(link).toHaveClass('btn-primary')
  })

  it('does not render action link when only label is provided', () => {
    render(<EmptyState {...defaultProps} actionLabel="Add Item" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('does not render action link when only link is provided', () => {
    render(<EmptyState {...defaultProps} actionLink="/add" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    render(<EmptyState {...defaultProps} />)
    const container = screen.getByRole('status')
    expect(container).toHaveAttribute('aria-label', 'Empty state')
  })
}) 