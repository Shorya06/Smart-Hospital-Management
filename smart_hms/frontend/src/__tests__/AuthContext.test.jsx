import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <div data-testid="user">{user ? user.username : 'No user'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <button onClick={() => login({ username: 'test', password: 'test' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('provides auth context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toBeInTheDocument()
    expect(screen.getByTestId('authenticated')).toBeInTheDocument()
  })

  it('loads saved session from localStorage', () => {
    const savedUser = { id: 1, username: 'testuser', role: 'patient' }
    localStorage.setItem('user', JSON.stringify(savedUser))
    localStorage.setItem('role', 'patient')
    localStorage.setItem('access_token', 'token123')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('testuser')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
  })

  it('handles login successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: 1, username: 'testuser', role: 'patient' },
            tokens: { access: 'token123', refresh: 'refresh123' },
          }),
      })
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const loginButton = screen.getByText('Login')
    loginButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser')
      expect(localStorage.getItem('access_token')).toBe('token123')
    })
  })

  it('handles login failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Invalid credentials'),
      })
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const loginButton = screen.getByText('Login')
    loginButton.click()

    await waitFor(() => {
      // User should remain null on failed login
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
    })
  })

  it('handles logout', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test' }))
    localStorage.setItem('access_token', 'token123')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const logoutButton = screen.getByText('Logout')
    logoutButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
      expect(localStorage.getItem('access_token')).toBeNull()
    })
  })

  it('throws error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
})

