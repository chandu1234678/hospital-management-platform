// API service — real backend via VITE_API_URL, mock fallback
import { MOCK_CREDENTIALS, MOCK_USER, DOCTORS, MOCK_APPOINTMENTS, MOCK_PRESCRIPTIONS, MOCK_LAB_REPORTS } from '../data/mockData.js'

const BASE_URL = import.meta.env.VITE_API_URL || null
const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

// ─── Token helpers ────────────────────────────────────────────────────────────
const getToken = () => {
  try {
    const s = JSON.parse(localStorage.getItem('deepthi-auth') || '{}')
    return s?.state?.user?.token || null
  } catch { return null }
}

const getHmsToken = () => {
  try {
    return localStorage.getItem('hms-token') || getToken()
  } catch { return null }
}

const getHmsRefreshToken = () => {
  try {
    return localStorage.getItem('hms-refresh-token') || null
  } catch { return null }
}

// ─── Silent token refresh ─────────────────────────────────────────────────────
let _refreshing = null  // deduplicate concurrent refresh calls

async function silentRefresh() {
  if (_refreshing) return _refreshing
  _refreshing = (async () => {
    const refreshToken = getHmsRefreshToken()
    if (!refreshToken) throw new Error('No refresh token')
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) throw new Error('Refresh failed')
    const data = await res.json()
    localStorage.setItem('hms-token', data.access_token)
    if (data.refresh_token) localStorage.setItem('hms-refresh-token', data.refresh_token)
    return data.access_token
  })()
  _refreshing.finally(() => { _refreshing = null })
  return _refreshing
}

// ─── HTTP helper ─────────────────────────────────────────────────────────────
async function http(method, path, body, token, _retry = false) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))

  // Auto-refresh on 401 for HMS calls (token passed = authenticated call)
  if (res.status === 401 && token && !_retry && BASE_URL) {
    const refreshToken = getHmsRefreshToken()
    if (refreshToken) {
      try {
        const newToken = await silentRefresh()
        return http(method, path, body, newToken, true)
      } catch {
        localStorage.removeItem('hms-token')
        localStorage.removeItem('hms-refresh-token')
      }
    }
  }

  if (!res.ok) throw new Error(data.detail || `Request failed: ${res.status}`)
  return data
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  async login(identifier, password) {
    if (BASE_URL) {
      const data = await http('POST', '/auth/login', { email: identifier, password })
      const me = await http('GET', '/auth/me', null, data.access_token)
      return { ...me, token: data.access_token, refresh_token: data.refresh_token }
    }
    await delay()
    const found = MOCK_CREDENTIALS.find(
      c => (c.email === identifier || c.phone === identifier) && c.password === password
    )
    if (!found) throw new Error('Invalid credentials. Please try again.')
    return { ...MOCK_USER, token: 'mock-jwt-token' }
  },

  async register(data) {
    if (BASE_URL) {
      await http('POST', '/auth/register', { ...data, role: 'PATIENT' })
      const login = await http('POST', '/auth/login', { email: data.email, password: data.password })
      const me = await http('GET', '/auth/me', null, login.access_token)
      return { ...me, token: login.access_token }
    }
    await delay(800)
    return { ...MOCK_USER, ...data, token: 'mock-jwt-token' }
  },

  async sendOtp(_contact) {
    await delay(500)
    return { success: true }
  },

  async verifyOtp(otp) {
    await delay(500)
    if (otp === '123456') return { success: true }
    throw new Error('Invalid OTP. Please try again.')
  },
}

// ─── Doctors ──────────────────────────────────────────────────────────────────
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
    if (BASE_URL) {
      const d = await http('GET', `/doctors/${id}`)
      let slots = []
      try { slots = JSON.parse(d.available_slots || '[]') } catch (_) {}
      return {
        ...d,
        fee: d.consultation_fee,
        about: d.bio || '',
        slots,
        location: d.location || 'Main Building',
        education: d.education || [{ degree: d.qualification || 'MBBS', institution: 'Medical University', year: '' }],
      }
    }
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
      let f = { ...filters }
      if (!f.patient_id) {
        try {
          const profile = await http('GET', '/patients/me', null, getToken())
          if (profile?.id) f.patient_id = profile.id
        } catch (_) {}
      }
      const params = new URLSearchParams(f)
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
    if (BASE_URL) {
      const p = await http('GET', '/patients/me', null, getToken())
      return {
        ...p,
        bloodGroup: p.blood_group,
        emergencyContact: p.emergency_contact,
        dateOfBirth: p.date_of_birth,
        medicalHistory: p.medical_history,
        medications: p.medical_history,
      }
    }
    await delay(400)
    return JSON.parse(localStorage.getItem('patientProfile') || JSON.stringify(MOCK_USER))
  },

  async updateProfile(data) {
    if (BASE_URL) {
      const payload = {
        name: data.name,
        phone: data.phone,
        blood_group: data.bloodGroup || data.blood_group,
        emergency_contact: data.emergencyContact || data.emergency_contact,
        date_of_birth: data.dateOfBirth || data.date_of_birth,
        address: data.address,
        allergies: data.allergies,
        medical_history: data.medicalHistory || data.medical_history || data.medications,
        gender: data.gender,
      }
      const p = await http('PATCH', '/patients/me', payload, getToken())
      return {
        ...p,
        bloodGroup: p.blood_group,
        emergencyContact: p.emergency_contact,
        dateOfBirth: p.date_of_birth,
        medicalHistory: p.medical_history,
        medications: p.medical_history,
      }
    }
    await delay(600)
    const updated = { ...MOCK_USER, ...data }
    localStorage.setItem('patientProfile', JSON.stringify(updated))
    return updated
  },
}

// ─── Lab reports ──────────────────────────────────────────────────────────────
export const reportService = {
  async getAll() {
    if (BASE_URL) {
      let patientId = null
      try {
        const profile = await http('GET', '/patients/me', null, getToken())
        patientId = profile?.id
      } catch (_) {}
      const params = patientId ? `?patient_id=${patientId}` : ''
      const reports = await http('GET', `/lab-reports${params}`, null, getToken()).catch(() => [])
      return reports.map(r => ({
        ...r,
        name: r.test_name,
        type: r.test_type || 'General',
        date: r.report_date || new Date(r.created_at).toLocaleDateString('en-IN'),
        doctor: r.doctor_name || (r.doctor_id ? `Dr. #${r.doctor_id}` : 'N/A'),
        status: r.status === 'COMPLETED' ? 'ready' : 'processing',
      }))
    }
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
    if (BASE_URL) {
      let patientId = null
      try {
        const profile = await http('GET', '/patients/me', null, getToken())
        patientId = profile?.id
      } catch (_) {}
      const params = patientId ? `?patient_id=${patientId}` : ''
      const rxList = await http('GET', `/prescriptions${params}`, null, getToken()).catch(() => [])
      return rxList.map(rx => {
        let meds = []
        try { meds = JSON.parse(rx.medications) } catch (_) {}
        const firstMed = Array.isArray(meds) && meds.length > 0 ? meds[0] : {}
        return {
          ...rx,
          medicine: firstMed.name || rx.diagnosis || 'Prescription',
          dosage: firstMed.dosage || firstMed.dose || '',
          form: firstMed.form || firstMed.type || 'Tablet',
          doctor: rx.doctor_id ? `Dr. #${rx.doctor_id}` : 'N/A',
          instructions: rx.instructions || firstMed.instructions || '',
          refills: firstMed.refills ?? 0,
          status: rx.status === 'ACTIVE' ? 'active' : 'expired',
          date: new Date(rx.created_at).toLocaleDateString('en-IN'),
        }
      })
    }
    await delay()
    return MOCK_PRESCRIPTIONS
  },
}

// ─── Billing ──────────────────────────────────────────────────────────────────
export const billingService = {
  async getAll() {
    if (BASE_URL) {
      let patientId = null
      try {
        const profile = await http('GET', '/patients/me', null, getToken())
        patientId = profile?.id
      } catch (_) {}
      const params = patientId ? `?patient_id=${patientId}` : ''
      const bills = await http('GET', `/billing${params}`, null, getToken())
      return bills.map(b => {
        let items = []
        try { items = JSON.parse(b.items) } catch (_) {}
        const desc = items.length > 0 ? items.map(i => i.name).join(', ') : 'Medical Services'
        return {
          ...b,
          invoiceId: b.bill_number,
          date: new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          desc,
          amount: b.total,
          status: b.status === 'PAID' ? 'Paid' : b.status === 'PARTIAL' ? 'Partial' : 'Pending',
          paymentId: null,
          paidOn: b.paid_at ? new Date(b.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        }
      })
    }
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
    if (BASE_URL) return http('GET', '/admin/stats', null, getHmsToken())
    await delay(400)
    return { total_patients: 0, total_doctors: 0, total_appointments: 0, today_appointments: 0, available_beds: 0, total_beds: 0, pending_bills: 0, total_revenue: 0 }
  },

  async getReport(type, period) {
    if (BASE_URL) return http('GET', `/admin/reports?report_type=${type}&period=${period}`, null, getHmsToken())
    return { type, period, summary: {}, rows: [] }
  },

  async getReportCustom(type, start, end) {
    if (BASE_URL) return http('GET', `/admin/reports?report_type=${type}&period=custom&start_date=${start}&end_date=${end}`, null, getHmsToken())
    return { type, period: 'custom', summary: {}, rows: [] }
  },
}

// ─── HMS services (admin + doctor portal) ────────────────────────────────────
export const hmsService = {
  // Admin
  async getAppointments() {
    if (BASE_URL) return http('GET', '/admin/appointments', null, getHmsToken())
    return []
  },

  async cancelAppointment(id) {
    if (BASE_URL) return http('DELETE', `/appointments/${id}`, null, getHmsToken())
    return {}
  },

  async getPatients() {
    if (BASE_URL) return http('GET', '/admin/patients', null, getHmsToken())
    return []
  },

  async getBilling() {
    if (BASE_URL) return http('GET', '/admin/billing', null, getHmsToken())
    return []
  },

  async updateBill(id, data) {
    if (BASE_URL) return http('PATCH', `/billing/${id}`, data, getHmsToken())
    return { id, ...data }
  },

  async createPaymentOrder(billId) {
    if (BASE_URL) return http('POST', `/billing/${billId}/pay`, null, getHmsToken())
    return {}
  },

  async verifyPayment(billId, data) {
    if (BASE_URL) return http('POST', `/billing/${billId}/verify`, data, getHmsToken())
    return {}
  },

  async completeAppointment(id) {
    if (BASE_URL) return http('PATCH', `/doctors/appointments/${id}`, { status: 'COMPLETED' }, getHmsToken())
    return { id, status: 'COMPLETED' }
  },

  async getLabQueue() {
    if (BASE_URL) return http('GET', '/admin/lab', null, getHmsToken())
    return []
  },

  async getInventory() {
    if (BASE_URL) return http('GET', '/inventory', null, getHmsToken())
    return []
  },

  async getBeds() {
    if (BASE_URL) return http('GET', '/beds', null, getHmsToken())
    return []
  },

  async addBed(data) {
    if (BASE_URL) return http('POST', '/beds', data, getHmsToken())
    return { id: Date.now(), ...data }
  },

  async updateBed(id, data) {
    if (BASE_URL) return http('PATCH', `/beds/${id}`, data, getHmsToken())
    return { id, ...data }
  },

  async deleteBed(id) {
    if (BASE_URL) return http('DELETE', `/beds/${id}`, null, getHmsToken())
    return {}
  },

  async createLabReport(data) {
    if (BASE_URL) return http('POST', '/lab-reports', data, getHmsToken())
    return { id: Date.now(), ...data, status: 'PENDING' }
  },

  async updateLabReport(id, data) {
    if (BASE_URL) return http('PATCH', `/lab-reports/${id}`, data, getHmsToken())
    return { id, ...data }
  },

  async createBill(data) {
    if (BASE_URL) return http('POST', '/billing', data, getHmsToken())
    return { id: Date.now(), ...data }
  },

  async createPatient(data) {
    // Creates user + patient profile via auth register
    if (BASE_URL) return http('POST', '/auth/register', { ...data, role: 'PATIENT' })
    return { id: Date.now(), ...data }
  },

  async createDoctor(data) {
    if (BASE_URL) return http('POST', '/admin/doctors', data, getHmsToken())
    return { id: Date.now(), ...data }
  },

  async createAppointment(data) {
    if (BASE_URL) return http('POST', '/admin/appointments', data, getHmsToken())
    return { id: Date.now(), ...data, status: 'SCHEDULED' }
  },

  async addInventoryItem(data) {
    if (BASE_URL) return http('POST', '/inventory', data, getHmsToken())
    return { id: Date.now(), ...data }
  },

  async updateInventoryItem(id, data) {
    if (BASE_URL) return http('PATCH', `/inventory/${id}`, data, getHmsToken())
    return { id, ...data }
  },

  async deleteInventoryItem(id) {
    if (BASE_URL) return http('DELETE', `/inventory/${id}`, null, getHmsToken())
    return {}
  },

  async updateDoctor(id, data) {
    if (BASE_URL) return http('PATCH', `/doctors/${id}`, data, getHmsToken())
    return { id, ...data }
  },

  async getDoctorSchedule(id) {
    if (BASE_URL) return http('GET', `/doctors/${id}/schedule`, null, getHmsToken())
    return []
  },

  async setDoctorSchedule(id, entries) {
    if (BASE_URL) return http('POST', `/doctors/${id}/schedule`, entries, getHmsToken())
    return entries
  },

  // Doctor portal
  async getDoctorAppointments() {
    if (BASE_URL) return http('GET', '/doctors/me/appointments', null, getHmsToken())
    return []
  },

  async getDoctorPatients() {
    if (BASE_URL) return http('GET', '/doctors/me/patients', null, getHmsToken())
    return []
  },

  async getDoctorProfile() {
    if (BASE_URL) return http('GET', '/doctors/me/profile', null, getHmsToken())
    return null
  },

  async getDoctorPrescriptions() {
    if (BASE_URL) return http('GET', '/doctors/me/prescriptions', null, getHmsToken())
    return []
  },

  async getDoctorLabReports() {
    if (BASE_URL) return http('GET', '/doctors/me/lab-reports', null, getHmsToken())
    return []
  },

  async updateAppointmentStatus(id, status, notes) {
    if (BASE_URL) return http('PATCH', `/doctors/appointments/${id}`, { status, notes }, getHmsToken())
    return { id, status }
  },

  async checkinAppointment(id) {
    if (BASE_URL) return http('PATCH', `/doctors/appointments/${id}/checkin`, {}, getHmsToken())
    return { id, status: 'CONFIRMED' }
  },

  async getPrescriptions() {
    if (BASE_URL) return http('GET', '/admin/prescriptions', null, getHmsToken())
    return []
  },

  async createPrescription(data) {
    if (BASE_URL) return http('POST', '/prescriptions', data, getHmsToken())
    return { id: Date.now(), ...data, status: 'ACTIVE' }
  },
}
