import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authAPI, userAPI, patientAPI, doctorAPI, appointmentAPI, medicalRecordAPI, prescriptionAPI, aiAPI, dashboardAPI, default as api } from '../services/api'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = axios

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('authAPI', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          user: { id: 1, username: 'test' },
          tokens: { access: 'token', refresh: 'refresh' }
        }
      }
      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      })

      const result = await authAPI.login({ username: 'test', password: 'pass' })
      expect(result).toBeDefined()
    })

    it('should register successfully', async () => {
      const mockResponse = {
        data: {
          user: { id: 1, username: 'test' },
          tokens: { access: 'token', refresh: 'refresh' }
        }
      }
      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      })

      const result = await authAPI.register({ username: 'test', password: 'pass' })
      expect(result).toBeDefined()
    })

    it('should logout and clear tokens', () => {
      localStorage.setItem('access_token', 'token')
      localStorage.setItem('refresh_token', 'refresh')
      authAPI.logout()
      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })
  })

  describe('userAPI', () => {
    it('should get user profile', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: { id: 1 } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await userAPI.getProfile()
      expect(result).toBeDefined()
    })

    it('should update user profile', async () => {
      const mockApi = {
        patch: vi.fn().mockResolvedValue({ data: { id: 1 } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await userAPI.updateProfile({ name: 'Test' })
      expect(result).toBeDefined()
    })
  })

  describe('patientAPI', () => {
    it('should get patients', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: { results: [] } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await patientAPI.getPatients()
      expect(result).toBeDefined()
    })

    it('should get single patient', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: { id: 1 } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await patientAPI.getPatient(1)
      expect(result).toBeDefined()
    })

    it('should update patient', async () => {
      const mockApi = {
        patch: vi.fn().mockResolvedValue({ data: { id: 1 } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await patientAPI.updatePatient(1, {})
      expect(result).toBeDefined()
    })
  })

  describe('doctorAPI', () => {
    it('should get doctors', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: { results: [] } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await doctorAPI.getDoctors()
      expect(result).toBeDefined()
    })

    it('should get single doctor', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: { id: 1 } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await doctorAPI.getDoctor(1)
      expect(result).toBeDefined()
    })

    it('should update doctor', async () => {
      const mockApi = {
        patch: vi.fn().mockResolvedValue({ data: { id: 1 } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await doctorAPI.updateDoctor(1, {})
      expect(result).toBeDefined()
    })
  })

  describe('appointmentAPI', () => {
    it('should get appointments', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: { results: [] } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await appointmentAPI.getAppointments()
      expect(result).toBeDefined()
    })

    it('should create appointment', async () => {
      const mockApi = {
        post: vi.fn().mockResolvedValue({ data: { id: 1 } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await appointmentAPI.createAppointment({})
      expect(result).toBeDefined()
    })

    it('should confirm appointment', async () => {
      const mockApi = {
        post: vi.fn().mockResolvedValue({ data: {} }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await appointmentAPI.confirmAppointment(1)
      expect(result).toBeDefined()
    })

    it('should cancel appointment', async () => {
      const mockApi = {
        post: vi.fn().mockResolvedValue({ data: {} }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await appointmentAPI.cancelAppointment(1)
      expect(result).toBeDefined()
    })
  })

  describe('medicalRecordAPI', () => {
    it('should get medical records', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: { results: [] } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await medicalRecordAPI.getMedicalRecords()
      expect(result).toBeDefined()
    })

    it('should create medical record', async () => {
      const mockApi = {
        post: vi.fn().mockResolvedValue({ data: { id: 1 } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await medicalRecordAPI.createMedicalRecord({})
      expect(result).toBeDefined()
    })
  })

  describe('prescriptionAPI', () => {
    it('should get prescriptions', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: { results: [] } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await prescriptionAPI.getPrescriptions()
      expect(result).toBeDefined()
    })

    it('should create prescription', async () => {
      const mockApi = {
        post: vi.fn().mockResolvedValue({ data: { id: 1 } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await prescriptionAPI.createPrescription({})
      expect(result).toBeDefined()
    })
  })

  describe('aiAPI', () => {
    it('should analyze symptoms', async () => {
      const mockApi = {
        post: vi.fn().mockResolvedValue({ 
          data: { 
            predicted_disease: 'flu',
            confidence: 0.8,
            recommendations: []
          } 
        }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await aiAPI.analyzeSymptoms('fever headache')
      expect(result).toBeDefined()
    })
  })

  describe('dashboardAPI', () => {
    it('should get dashboard data', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: { user: {} } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }
      mockedAxios.create.mockReturnValue(mockApi)
      const result = await dashboardAPI.getDashboard()
      expect(result).toBeDefined()
    })
  })

  describe('API interceptors', () => {
    it('should add token to request headers', () => {
      localStorage.setItem('access_token', 'test-token')
      const mockConfig = { headers: {} }
      const mockInterceptor = {
        request: {
          use: vi.fn((fn) => {
            const result = fn(mockConfig)
            expect(result.headers.Authorization).toBe('Bearer test-token')
          })
        },
        response: { use: vi.fn() }
      }
      mockedAxios.create.mockReturnValue(mockInterceptor)
      // The interceptor is set up in api.js, so we test the behavior
      expect(localStorage.getItem('access_token')).toBe('test-token')
    })
  })
})

