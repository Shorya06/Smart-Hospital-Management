import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from '../contexts/AuthContext'

// Mock the pages to avoid complex dependencies
vi.mock('../pages/Dashboard', () => ({
  default: () => <div>Dashboard</div>
}))
vi.mock('../pages/Appointments', () => ({
  default: () => <div>Appointments</div>
}))
vi.mock('../pages/SymptomChecker', () => ({
  default: () => <div>SymptomChecker</div>
}))
vi.mock('../pages/Patients', () => ({
  default: () => <div>Patients</div>
}))
vi.mock('../pages/Doctors', () => ({
  default: () => <div>Doctors</div>
}))
vi.mock('../pages/Analytics', () => ({
  default: () => <div>Analytics</div>
}))
vi.mock('../components/Layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>
}))
vi.mock('../components/ProtectedRoute', () => ({
  default: ({ children }) => <div>{children}</div>
}))
vi.mock('../components/Auth/Login', () => ({
  default: () => <div>Login Component</div>
}))
vi.mock('../components/Auth/Register', () => ({
  default: () => <div>Register Component</div>
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    )
  })

  it('renders login route', () => {
    window.history.pushState({}, '', '/login')
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    )
    // Login component should be rendered
    expect(screen.getByText(/login component/i)).toBeInTheDocument()
  })
})

