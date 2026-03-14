// API service — uses real backend when VITE_API_URL is set, falls back to mock
import { MOCK_CREDENTIALS, MOCK_USER, DOCTORS, MOCK_APPOINTMENTS, MOCK_PRESCRIPTIONS, MOCK_LAB_REPORTS } from '../data/mockData.js'

const BASE_URL = import.meta.env.VITE_API_URL || null
const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

// ─── HTTP helper ────────────────────────────────────────────────────────────
async function http(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || `Request failed: ${res.status}`)
  return data
}

const getToken = () => {
  try {
    const s = JSON.parse(localStorage.getItem('deepthi-auth') || '{}')
    return s?.state?.user?.token || null
  } catch { return null }
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authService = {
  async login(identifier, password) {
    if (BASE_URL) {
      const data = await http('POST', '/auth/login', { email: identifier, password })
      const me = await http('GET', '/auth/me', null, data.access_token)
      return { ...me, token: data.access_token, refresh_token: data.refresh_token }
    }
    // mock fallback
    await delay()
    const found = MOCK_CREDENTIALS.find(
      c => (c.email === identifier || c.phone === identifier) && c.password === password
    )
    if (!found) throw new Error('Invalid credentials. Please try again.')
    return { ...MOCK_USER, token: 'mock-jwt-token' }
  },

  async register(data) {
    if (BASE_URL) {
      const res = await http('POST', '/auth/register', { ...data, role: 'PATIENT' })
      const login = await http('POST', '/auth/login', { email: data.email, password: data.password })
      const me = await http('GET', '/auth/me', null, login.access_token)
      return { ...me, token: login.access_token }
    }
    await delay(800)
    return { ...MOCK_USER, ...data, token: 'mock-jwt-token' }
  },

  async sendOtp(contact) {
    await delay(500)
    return { success: true }
  },

  async verifyOtp(otp) {
    await delay(500)
    if (otp === '123456') return { success: true }
    throw new Error('Invalid OTP. Please try again.')
  },
}

// ─── Doctors ─────────────────────────────────────────────────────────────────
export const doctorService = {
  async getAll(filters = {}) {
    if (BASE_URL) {
      const params = new URLSearchParams()
      if (filters.department) params.set('department', filters.department)
      return http('GET', `/doctors?${params}`)
    }
    await delay()
    let docs = [...DOCTORS]
    if (filters.department) docs = docs.filter(d => d.department === filters.department)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      docs = docs.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q))
    }
    return docs
  },

  async getById(id) {
    if (BASE_URL) return http('GET', `/doctors/${id}`)
    await delay(400)
    const doc = DOCTORS.find(d => d.id === Number(id))
    if (!doc) throw new Error('Doctor not found')
    return doc
  },
}

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentService = {
  async book(data) {
    if (BASE_URL) return http('POST', '/appointments', data, getToken())
    await delay(800)
    return { id: `APT-${Date.now()}`, ...data, status: 'upcoming' }
  },

  async getAll(filters = {}) {
    if (BASE_URL) {
      const params = new URLSearchParams(filters)
      return http('GET', `/appointments?${params}`, null, getToken())
    }
    await delay()
    return MOCK_APPOINTMENTS
  },

  async cancel(id) {
    if (BASE_URL) return http('DELETE', `/appointments/${id}`, null, getToken())
    await delay(400)
    return { success: true }
  },

  async createPaymentOrder(apptId) {
    return http('POST', `/appointments/${apptId}/pay`, null, getToken())
  },

  async verifyPayment(apptId, data) {
    return http('POST', `/appointments/${apptId}/pay/verify`, data, getToken())
  },
}

// ─── Patient profile ──────────────────────────────────────────────────────────
export const patientService = {
  async getProfile() {
    if (BASE_URL) return http('GET', '/patients/me', null, getToken())
    await delay(400)
    return JSON.parse(localStorage.getItem('patientProfile') || JSON.stringify(MOCK_USER))
  },

  async updateProfile(data) {
    if (BASE_URL) return http('PATCH', '/patients/me', data, getToken())
    await delay(600)
    const updated = { ...MOCK_USER, ...data }
    localStorage.setItem('patientProfile', JSON.stringify(updated))
    return updated
  },
}

// ─── Lab reports ──────────────────────────────────────────────────────────────
export const reportService = {
  async getAll() {
    if (BASE_URL) return http('GET', '/lab-reports', null, getToken())
    await delay()
    return MOCK_LAB_REPORTS
  },

  download(report) {
    const blob = new Blob(
      [`Lab Report\n\nName: ${report.name}\nDate: ${report.date}\nDoctor: ${report.doctor}\nType: ${report.type}\nStatus: ${report.status}`],
      { type: 'application/pdf' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.name.replace(/\s+/g, '-')}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  },
}

// ─── Prescriptions ────────────────────────────────────────────────────────────
export const prescriptionService = {
  async getAll() {
    if (BASE_URL) return http('GET', '/prescriptions', null, getToken())
    await delay()
    return MOCK_PRESCRIPTIONS
  },
}

// ─── Billing ──────────────────────────────────────────────────────────────────
export const billingService = {
  async getAll() {
    if (BASE_URL) return http('GET', '/billing', null, getToken())
    await delay()
    return []
  },

  async createOrder(billId) {
    return http('POST', `/billing/${billId}/pay`, null, getToken())
  },

  async verifyPayment(billId, data) {
    return http('POST', `/billing/${billId}/verify`, data, getToken())
  },
}

// ─── Admin stats ──────────────────────────────────────────────────────────────
export const adminService = {
  async getStats() {
    if (BASE_URL) return http('GET', '/admin/stats', null, getToken())
    await delay(400)
    return { total_patients: 0, total_doctors: 0, total_appointments: 0, today_appointments: 0, available_beds: 0, total_beds: 0, pending_bills: 0, total_revenue: 0 }
  },
}
