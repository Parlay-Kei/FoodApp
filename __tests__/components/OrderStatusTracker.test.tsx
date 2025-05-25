import { render, screen } from '@testing-library/react'
import OrderStatusTracker from '@/components/OrderStatusTracker'

jest.mock('@/lib/utils', () => ({
  getOrderStatusInfo: (status: string) => {
    if (status === 'pending') return { color: 'yellow', step: 1, label: 'Pending', description: 'Order received' }
    if (status === 'in_progress') return { color: 'blue', step: 2, label: 'In Progress', description: 'Order is being prepared' }
    if (status === 'ready') return { color: 'green', step: 3, label: 'Ready', description: 'Order is ready for pickup' }
    return { color: 'gray', step: 0, label: 'Unknown', description: 'Unknown status' }
  }
}))

describe('OrderStatusTracker', () => {
  it('renders progress and status for pending', () => {
    render(<OrderStatusTracker status="pending" />)
    expect(screen.getByRole('heading', { name: 'Pending' })).toBeInTheDocument()
    expect(screen.getByText('Order received')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders progress and status for in_progress', () => {
    render(<OrderStatusTracker status="in_progress" />)
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument()
    expect(screen.getByText('Order is being prepared')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders progress and status for ready', () => {
    render(<OrderStatusTracker status="ready" />)
    expect(screen.getByRole('heading', { name: 'Ready' })).toBeInTheDocument()
    expect(screen.getByText('Order is ready for pickup')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    // Check the status label in the progress bar
    expect(screen.getByText('Ready', { selector: 'p.text-xs' })).toBeInTheDocument()
  })

  it('renders unknown status gracefully', () => {
    render(<OrderStatusTracker status="unknown" />)
    expect(screen.getByRole('heading', { name: 'Unknown' })).toBeInTheDocument()
    expect(screen.getByText('Unknown status')).toBeInTheDocument()
  })
}) 