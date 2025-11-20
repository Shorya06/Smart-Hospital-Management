import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SymptomChecker from '../pages/SymptomChecker'
import { AuthProvider } from '../contexts/AuthContext'
import { aiAPI } from '../services/api'

// Mock the API
vi.mock('../services/api', () => ({
  aiAPI: {
    analyzeSymptoms: vi.fn(),
  },
}))

describe('SymptomChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders symptom checker form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <SymptomChecker />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText(/AI Symptom Checker/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/symptoms description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /analyze symptoms/i })).toBeInTheDocument()
  })

  it('validates minimum input length', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <SymptomChecker />
        </AuthProvider>
      </BrowserRouter>
    )

    const input = screen.getByLabelText(/symptoms description/i)
    fireEvent.change(input, { target: { value: 'ab' } })

    expect(screen.getByText(/please provide at least 3 characters/i)).toBeInTheDocument()
    
    const button = screen.getByRole('button', { name: /analyze symptoms/i })
    expect(button).toBeDisabled()
  })

  it('shows character count', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <SymptomChecker />
        </AuthProvider>
      </BrowserRouter>
    )

    const input = screen.getByLabelText(/symptoms description/i)
    fireEvent.change(input, { target: { value: 'fever headache' } })

    expect(screen.getByText(/15\/500 characters/i)).toBeInTheDocument()
  })

  it('enforces maximum character limit', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <SymptomChecker />
        </AuthProvider>
      </BrowserRouter>
    )

    const input = screen.getByLabelText(/symptoms description/i)
    const longText = 'a'.repeat(600)
    fireEvent.change(input, { target: { value: longText } })

    // Should be limited to 500
    expect(input.value.length).toBeLessThanOrEqual(500)
  })

  it('handles successful symptom analysis', async () => {
    const mockResponse = {
      data: {
        predicted_disease: 'Flu',
        confidence: 0.95,
        recommendations: ['High probability of Flu. Please consult a doctor.'],
        all_conditions: [
          { condition: 'Flu', confidence: 0.95 },
          { condition: 'Strep Throat', confidence: 0.45 },
        ],
      },
    }

    aiAPI.analyzeSymptoms.mockResolvedValue(mockResponse)

    render(
      <BrowserRouter>
        <AuthProvider>
          <SymptomChecker />
        </AuthProvider>
      </BrowserRouter>
    )

    const input = screen.getByLabelText(/symptoms description/i)
    const button = screen.getByRole('button', { name: /analyze symptoms/i })

    fireEvent.change(input, { target: { value: 'fever headache fatigue' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Flu/i)).toBeInTheDocument()
      expect(screen.getByText(/95%/i)).toBeInTheDocument()
    })

    expect(aiAPI.analyzeSymptoms).toHaveBeenCalledWith('fever headache fatigue')
  })

  it('handles API errors gracefully', async () => {
    aiAPI.analyzeSymptoms.mockRejectedValue(new Error('API Error'))

    render(
      <BrowserRouter>
        <AuthProvider>
          <SymptomChecker />
        </AuthProvider>
      </BrowserRouter>
    )

    const input = screen.getByLabelText(/symptoms description/i)
    const button = screen.getByRole('button', { name: /analyze symptoms/i })

    fireEvent.change(input, { target: { value: 'fever headache' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    })
  })

  it('shows low confidence warning', async () => {
    const mockResponse = {
      data: {
        predicted_disease: 'General Consultation',
        confidence: 0.3,
        recommendations: ['Low confidence prediction.'],
        all_conditions: [
          { condition: 'General Consultation', confidence: 0.3 },
        ],
      },
    }

    aiAPI.analyzeSymptoms.mockResolvedValue(mockResponse)

    render(
      <BrowserRouter>
        <AuthProvider>
          <SymptomChecker />
        </AuthProvider>
      </BrowserRouter>
    )

    const input = screen.getByLabelText(/symptoms description/i)
    const button = screen.getByRole('button', { name: /analyze symptoms/i })

    fireEvent.change(input, { target: { value: 'unusual symptoms' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/low confidence/i)).toBeInTheDocument()
    })
  })

  it('disables button during loading', async () => {
    let resolvePromise
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    aiAPI.analyzeSymptoms.mockReturnValue(promise)

    render(
      <BrowserRouter>
        <AuthProvider>
          <SymptomChecker />
        </AuthProvider>
      </BrowserRouter>
    )

    const input = screen.getByLabelText(/symptoms description/i)
    const button = screen.getByRole('button', { name: /analyze symptoms/i })

    fireEvent.change(input, { target: { value: 'fever headache' } })
    fireEvent.click(button)

    expect(button).toBeDisabled()
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument()

    resolvePromise({
      data: {
        predicted_disease: 'Flu',
        confidence: 0.95,
        recommendations: [],
        all_conditions: [],
      },
    })

    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
  })

  it('displays confidence bar correctly', async () => {
    const mockResponse = {
      data: {
        predicted_disease: 'Flu',
        confidence: 0.85,
        recommendations: [],
        all_conditions: [{ condition: 'Flu', confidence: 0.85 }],
      },
    }

    aiAPI.analyzeSymptoms.mockResolvedValue(mockResponse)

    render(
      <BrowserRouter>
        <AuthProvider>
          <SymptomChecker />
        </AuthProvider>
      </BrowserRouter>
    )

    const input = screen.getByLabelText(/symptoms description/i)
    const button = screen.getByRole('button', { name: /analyze symptoms/i })

    fireEvent.change(input, { target: { value: 'fever headache' } })
    fireEvent.click(button)

    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar', { name: /confidence level/i })
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('aria-valuenow', '85')
    })
  })
})

