/**
 * Tests for api.js service layer
 * Uses vi.stubGlobal to mock fetch — no real network calls.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authService, doctorService, appointmentService, patientService, billingService, reportService, prescriptionService } from '../services/api.js'

// ── helpers ──────────────────────────────────────────────────────────────────
const mockFetch = (body, status = 200) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: status < 400,
    status,
    json: async () => body,
  }))
}

const mockFetchSequence = (...responses) => {
  let i = 0
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
    const r = responses[i] || responses[responses.length - 1]
    i++
    return Promise.resolve({ ok: r.status < 400, status: r.status, json: async () => r.body })
  }))
}

beforeEach(() => {
  // Set BASE_URL so real-backend paths are exercised
  vi.stubEnv('VITE_API_URL', 'http://localhost:8000')
  // Clear HMS token
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

// ── Auth ─────────────────────────────────────────────────────────────────────
describe('authService.login', () => {
  it('returns user with token on success', async () => {
    mockFetchSequence(
      { status: 200, body: { access_token: 'tok123', refresh_token: 'ref456' } },
      { status: 200, body: { id: 1, name: 'Arjun', email: 'arjun@deepthi.com', role: 'PATIENT' } },
    )
    const user = await authService.login('arjun@deepthi.com', 'password123')
    expect(user.token).toBe('tok123')
    expect(user.email).toBe('arjun@deepthi.com')
  })

  it('throws on invalid credentials (401)', async () => {
    mockFetch({ detail: 'Invalid credentials' }, 401)
    await expect(authService.login('bad@email.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })

  it('throws a meaningful error when server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    await expect(authService.login('arjun@deepthi.com', 'password123')).rejects.toThrow()
  })

  it('throws on 500 server error', async () => {
    mockFetch({ detail: 'Internal Server Error' }, 500)
    await expect(authService.login('arjun@deepthi.com', 'password123')).rejects.toThrow()
  })
})

describe('authService.register', () => {
  it('registers and returns user with token', async () => {
    mockFetchSequence(
      { status: 201, body: { id: 2, name: 'New User', email: 'new@test.com', role: 'PATIENT' } },
      { status: 200, body: { access_token: 'newtok', refresh_token: 'newref' } },
      { status: 200, body: { id: 2, name: 'New User', email: 'new@test.com', role: 'PATIENT' } },
    )
    const user = await authService.register({ name: 'New User', email: 'new@test.com', password: 'pass123' })
    expect(user.token).toBe('newtok')
  })

  it('throws when email already registered (400)', async () => {
    mockFetch({ detail: 'Email already registered' }, 400)
    await expect(authService.register({ email: 'dup@test.com', password: 'x' })).rejects.toThrow('Email already registered')
  })
})

// ── Doctors ───────────────────────────────────────────────────────────────────
describe('doctorService', () => {
  it('getAll returns list of doctors', async () => {
    const doctors = [
      { id: 1, name: 'Dr. Rajesh Kumar', department: 'Cardiology', rating: 4.9 },
      { id: 2, name: 'Dr. Priya Sharma', department: 'Neurology', rating: 4.8 },
    ]
    mockFetch(doctors)
    const result = await doctorService.getAll()
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Dr. Rajesh Kumar')
  })

  it('getAll passes department filter as query param', async () => {
    mockFetch([{ id: 1, name: 'Dr. Rajesh Kumar', department: 'Cardiology' }])
    await doctorService.getAll({ department: 'Cardiology' })
    const url = fetch.mock.calls[0][0]
    expect(url).toContain('department=Cardiology')
  })

  it('getById returns single doctor', async () => {
    mockFetch({ id: 1, name: 'Dr. Rajesh Kumar', available_slots: '["09:00 AM"]' })
    const doc = await doctorService.getById(1)
    expect(doc.id).toBe(1)
  })

  it('getById throws 404 for unknown doctor', async () => {
    mockFetch({ detail: 'Doctor not found' }, 404)
    await expect(doctorService.getById(9999)).rejects.toThrow('Doctor not found')
  })

  it('getAll returns empty array when server returns empty list', async () => {
    vi.unstubAllEnvs()
    vi.stubEnv('VITE_API_URL', 'http://localhost:8000')
    mockFetch([])
    const docs = await doctorService.getAll()
    expect(Array.isArray(docs)).toBe(true)
    expect(docs.length).toBe(0)
  })

  it('mock getAll with department filter only returns matching doctors', async () => {
    vi.unstubAllEnvs()
    vi.stubEnv('VITE_API_URL', 'http://localhost:8000')
    mockFetch([{ id: 1, name: 'Dr. Rajesh Kumar', department: 'Cardiology' }])
    const docs = await doctorService.getAll({ department: 'Cardiology' })
    expect(docs.every(d => d.department === 'Cardiology')).toBe(true)
  })
})

// ── Appointments ──────────────────────────────────────────────────────────────
describe('appointmentService', () => {
  beforeEach(() => {
    // Seed a token in localStorage
    localStorage.setItem('deepthi-auth', JSON.stringify({ state: { user: { token: 'test-token' } } }))
  })

  it('book sends POST and returns appointment', async () => {
    const appt = { id: 10, patient_id: 1, doctor_id: 2, status: 'SCHEDULED' }
    mockFetch(appt, 201)
    const result = await appointmentService.book({ patient_id: 1, doctor_id: 2, appointment_date: '2026-04-01', appointment_time: '10:00 AM' })
    expect(result.id).toBe(10)
    expect(fetch.mock.calls[0][1].method).toBe('POST')
  })

  it('book sends Authorization header', async () => {
    mockFetch({ id: 11 }, 201)
    await appointmentService.book({ patient_id: 1, doctor_id: 2, appointment_date: '2026-04-01', appointment_time: '10:00 AM' })
    const headers = fetch.mock.calls[0][1].headers
    expect(headers['Authorization']).toBe('Bearer test-token')
  })

  it('getAll auto-injects patient_id from /patients/me', async () => {
    mockFetchSequence(
      { status: 200, body: { id: 5 } },           // /patients/me
      { status: 200, body: [{ id: 1 }, { id: 2 }] }, // /appointments
    )
    const result = await appointmentService.getAll()
    expect(result).toHaveLength(2)
    const apptUrl = fetch.mock.calls[1][0]
    expect(apptUrl).toContain('patient_id=5')
  })

  it('cancel sends DELETE request', async () => {
    mockFetch({}, 204)
    await appointmentService.cancel(5)
    expect(fetch.mock.calls[0][1].method).toBe('DELETE')
    expect(fetch.mock.calls[0][0]).toContain('/appointments/5')
  })
})

// ── Patient profile ───────────────────────────────────────────────────────────
describe('patientService', () => {
  beforeEach(() => {
    localStorage.setItem('deepthi-auth', JSON.stringify({ state: { user: { token: 'test-token' } } }))
  })

  it('getProfile normalizes snake_case to camelCase', async () => {
    mockFetch({ id: 1, blood_group: 'O+', emergency_contact: '9999', date_of_birth: '1985-06-15', medical_history: 'None' })
    const profile = await patientService.getProfile()
    expect(profile.bloodGroup).toBe('O+')
    expect(profile.emergencyContact).toBe('9999')
    expect(profile.dateOfBirth).toBe('1985-06-15')
  })

  it('updateProfile sends PATCH with snake_case payload', async () => {
    mockFetch({ id: 1, blood_group: 'A+', emergency_contact: '8888', date_of_birth: '1990-01-01', medical_history: '' })
    await patientService.updateProfile({ bloodGroup: 'A+', emergencyContact: '8888', dateOfBirth: '1990-01-01' })
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.blood_group).toBe('A+')
    expect(body.emergency_contact).toBe('8888')
    expect(fetch.mock.calls[0][1].method).toBe('PATCH')
  })
})

// ── Billing ───────────────────────────────────────────────────────────────────
describe('billingService', () => {
  beforeEach(() => {
    localStorage.setItem('deepthi-auth', JSON.stringify({ state: { user: { token: 'test-token' } } }))
  })

  it('getAll normalizes bill fields for frontend', async () => {
    mockFetchSequence(
      { status: 200, body: { id: 1 } }, // /patients/me
      { status: 200, body: [
        { id: 10, bill_number: 'BILL-001', total: 1500, status: 'PAID', items: '[]', created_at: '2026-03-14T10:00:00', paid_at: '2026-03-14T10:05:00' },
        { id: 11, bill_number: 'BILL-002', total: 800, status: 'PENDING', items: '[{"name":"CBC"}]', created_at: '2026-03-15T09:00:00', paid_at: null },
      ]},
    )
    const bills = await billingService.getAll()
    expect(bills[0].invoiceId).toBe('BILL-001')
    expect(bills[0].status).toBe('Paid')
    expect(bills[0].amount).toBe(1500)
    expect(bills[1].status).toBe('Pending')
    expect(bills[1].desc).toBe('CBC')
  })

  it('createOrder sends POST to /billing/{id}/pay', async () => {
    mockFetch({ order_id: 'order_xyz', amount: 150000 })
    await billingService.createOrder(10)
    expect(fetch.mock.calls[0][0]).toContain('/billing/10/pay')
    expect(fetch.mock.calls[0][1].method).toBe('POST')
  })
})

// ── Lab Reports ───────────────────────────────────────────────────────────────
describe('reportService', () => {
  beforeEach(() => {
    localStorage.setItem('deepthi-auth', JSON.stringify({ state: { user: { token: 'test-token' } } }))
  })

  it('getAll maps backend fields to frontend fields', async () => {
    mockFetchSequence(
      { status: 200, body: { id: 1 } },
      { status: 200, body: [
        { id: 1, test_name: 'CBC', test_type: 'Blood Test', report_date: '2026-03-12', status: 'COMPLETED', created_at: '2026-03-12T00:00:00' },
        { id: 2, test_name: 'MRI Brain', test_type: 'Radiology', report_date: '2026-03-22', status: 'PENDING', created_at: '2026-03-22T00:00:00' },
      ]},
    )
    const reports = await reportService.getAll()
    expect(reports[0].name).toBe('CBC')
    expect(reports[0].type).toBe('Blood Test')
    expect(reports[0].status).toBe('ready')
    expect(reports[1].status).toBe('processing')
  })
})

// ── Prescriptions ─────────────────────────────────────────────────────────────
describe('prescriptionService', () => {
  beforeEach(() => {
    localStorage.setItem('deepthi-auth', JSON.stringify({ state: { user: { token: 'test-token' } } }))
  })

  it('getAll parses medications JSON and maps fields', async () => {
    mockFetchSequence(
      { status: 200, body: { id: 1 } },
      { status: 200, body: [
        {
          id: 1, diagnosis: 'Hypertension', status: 'ACTIVE',
          medications: JSON.stringify([{ name: 'Amlodipine', dosage: '5mg', form: 'Tablet', instructions: 'Once daily', refills: 3 }]),
          instructions: 'Monitor BP', created_at: '2026-03-01T00:00:00',
        },
        {
          id: 2, diagnosis: 'Knee Pain', status: 'EXPIRED',
          medications: JSON.stringify([{ name: 'Diclofenac', dosage: '50mg', form: 'Tablet', instructions: 'Twice daily', refills: 0 }]),
          instructions: 'Physiotherapy', created_at: '2026-02-01T00:00:00',
        },
      ]},
    )
    const rxList = await prescriptionService.getAll()
    expect(rxList[0].medicine).toBe('Amlodipine')
    expect(rxList[0].dosage).toBe('5mg')
    expect(rxList[0].status).toBe('active')
    expect(rxList[0].refills).toBe(3)
    expect(rxList[1].status).toBe('expired')
  })

  it('handles malformed medications JSON gracefully', async () => {
    mockFetchSequence(
      { status: 200, body: { id: 1 } },
      { status: 200, body: [
        { id: 3, diagnosis: 'Unknown', status: 'ACTIVE', medications: 'NOT_JSON', instructions: '', created_at: '2026-03-01T00:00:00' },
      ]},
    )
    const rxList = await prescriptionService.getAll()
    expect(rxList[0].medicine).toBe('Unknown') // falls back to diagnosis
  })
})
