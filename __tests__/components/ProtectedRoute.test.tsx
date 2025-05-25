import { render, screen, waitFor, act } from '@testing-library/react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useRouter } from 'next/navigation'
import * as supabase from '@/lib/supabase'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock supabase auth
jest.mock('@/lib/supabase', () => ({
  getUser: jest.fn()
}))

describe('ProtectedRoute', () => {
  const mockRouter = {
    push: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('renders children when user is authenticated', async () => {
    ;(supabase.getUser as jest.Mock).mockResolvedValue({ id: '123', email: 'test@example.com' })

    await act(async () => {
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('redirects to login when user is not authenticated', async () => {
    ;(supabase.getUser as jest.Mock).mockResolvedValue(null)

    await act(async () => {
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )
    })

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading state while checking authentication', async () => {
    // Create a promise that we can resolve later
    let resolveAuth: (value: any) => void
    ;(supabase.getUser as jest.Mock).mockImplementation(() => new Promise(resolve => {
      resolveAuth = resolve
    }))

    await act(async () => {
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )
    })

    // Should show loading state
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()

    // Resolve the auth check
    await act(async () => {
      resolveAuth({ id: '123', email: 'test@example.com' })
    })

    // Should show content after auth
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
    expect(screen.queryByRole('status', { name: 'Loading' })).not.toBeInTheDocument()
  })

  it('handles auth check error gracefully', async () => {
    ;(supabase.getUser as jest.Mock).mockRejectedValue(new Error('Auth error'))

    await act(async () => {
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )
    })

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
