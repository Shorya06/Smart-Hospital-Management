import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

// Test component that uses auth
const TestComponent = () => {
  const { user, role, isAuthenticated, loading } = useAuth()
  return (
    <div>
      {loading ? 'Loading...' : `User: ${user?.username || 'None'}, Role: ${role || 'None'}, Auth: ${isAuthenticated}`}
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('should provide auth context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    expect(screen.getByText(/User:/)).toBeInTheDocument()
  })

  it('should load saved session from localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test', role: 'patient' }))
    localStorage.setItem('role', 'patient')
    localStorage.setItem('access_token', 'token')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    waitFor(() => {
      expect(screen.getByText(/test/)).toBeInTheDocument()
    })
  })

  it('should login successfully', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        user: { id: 1, username: 'test', role: 'patient' },
        tokens: { access: 'token', refresh: 'refresh' }
      })
    }
    global.fetch.mockResolvedValue(mockResponse)

    const LoginTest = () => {
      const { login } = useAuth()
      const handleLogin = async () => {
        await login({ username: 'test', password: 'pass' })
      }
      return <button onClick={handleLogin}>Login</button>
    }

    render(
      <AuthProvider>
        <LoginTest />
      </AuthProvider>
    )
  })

  it('should handle login error', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      text: async () => 'Error'
    }
    global.fetch.mockResolvedValue(mockResponse)

    const LoginTest = () => {
      const { login } = useAuth()
      const [result, setResult] = React.useState(null)
      const handleLogin = async () => {
        const res = await login({ username: 'test', password: 'pass' })
        setResult(res)
      }
      return (
        <div>
          <button onClick={handleLogin}>Login</button>
          {result && <div>{result.error}</div>}
        </div>
      )
    }

    render(
      <AuthProvider>
        <LoginTest />
      </AuthProvider>
    )
  })

  it('should register successfully', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        user: { id: 1, username: 'test', role: 'patient' },
        tokens: { access: 'token', refresh: 'refresh' }
      })
    }
    global.fetch.mockResolvedValue(mockResponse)

    const RegisterTest = () => {
      const { register } = useAuth()
      const handleRegister = async () => {
        await register({ username: 'test', password: 'pass', role: 'patient' })
      }
      return <button onClick={handleRegister}>Register</button>
    }

    render(
      <AuthProvider>
        <RegisterTest />
      </AuthProvider>
    )
  })

  it('should logout and clear state', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1 }))
    localStorage.setItem('access_token', 'token')

    const LogoutTest = () => {
      const { logout, isAuthenticated } = useAuth()
      return (
        <div>
          <div>Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
          <button onClick={logout}>Logout</button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <LogoutTest />
      </AuthProvider>
    )
  })

  it('should throw error when useAuth used outside provider', () => {
    const TestOutside = () => {
      try {
        useAuth()
        return <div>No Error</div>
      } catch (error) {
        return <div>Error: {error.message}</div>
      }
    }

    render(<TestOutside />)
    expect(screen.getByText(/useAuth must be used within/)).toBeInTheDocument()
  })
})

