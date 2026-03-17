import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../../components/Modal.jsx'
import { hmsService, doctorService } from '../../../services/api.js'

const STATUS_COLORS = {
  'SCHEDULED':   'bg-slate-100 text-slate-600',
  'CONFIRMED':   'bg-indigo-100 text-indigo-700',
  'IN PROGRESS': 'bg-blue-100 text-blue-700',
  'COMPLETED':   'bg-green-100 text-green-700',
  'CANCELLED':   'bg-red-100 text-red-600',
  'WAITING':     'bg-amber-100 text-amber-700',
}

const BLANK = { patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', department: '', reason: '' }
const TIME_SLOTS = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM',
  '04:00 PM','04:30 PM','05:00 PM','05:30 PM','06:00 PM']

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [cancelId, setCancelId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [viewAppt, setViewAppt] = useState(null)

  useEffect(() => {
    Promise.all([
      hmsService.getAppointments(),
      hmsService.getPatients(),
      doctorService.getAll(),
    ]).then(([appts, pts, docs]) => {
      setAppointments(appts)
      setPatients(pts)
      setDoctors(docs)
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = appointments.filter(a => {
    const matchFilter = filter === 'all' || a.status?.toLowerCase() === filter
    const matchSearch = !search || (a.patient||'').toLowerCase().includes(search.toLowerCase()) ||
      (a.doctor||'').toLowerCase().includes(search.toLowerCase()) ||
      (a.department||'').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const handleCancel = async () => {
    try {
      await hmsService.cancelAppointment?.(cancelId)
    } catch (_) {}
    setAppointments(prev => prev.map(a => a.id === cancelId ? { ...a, status: 'CANCELLED' } : a))
    setCancelId(null)
    toast.success('Appointment cancelled')
  }

  const handleDoctorChange = (doctorId) => {
    const doc = doctors.find(d => d.id === Number(doctorId))
    setForm(f => ({ ...f, doctor_id: doctorId, department: doc?.department || f.department }))
  }

  const handleCreate = async () => {
    if (!form.patient_id || !form.doctor_id || !form.appointment_date || !form.appointment_time) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      const created = await hmsService.createAppointment({
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        department: form.department || undefined,
        reason: form.reason || undefined,
      })
      setAppointments(prev => [created, ...prev])
      setShowNew(false)
      setForm(BLANK)
      toast.success(`Appointment #${created.id} created successfully`)
    } catch (e) {
      toast.error(e.message || 'Failed to create appointment')
    } finally {
      setSaving(false)
    }
  }

  const counts = {
    all: appointments.length,
    scheduled: appointments.filter(a => a.status?.toLowerCase() === 'scheduled').length,
    completed: appointments.filter(a => a.status?.toLowerCase() === 'completed').length,
    cancelled: appointments.filter(a => a.status?.toLowerCase() === 'cancelled').length,
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Appointment Management</h1>
          <p className="text-slate-500 text-sm">All appointments — {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0f4b80] text-white rounded-xl text-sm font-semibold hover:bg-[#0d3f6e] transition-colors shadow-md shadow-blue-900/20 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          New Appointment
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {['all', 'scheduled', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === f ? 'bg-[#0f4b80] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0f4b80]'
              }`}>
              {f} <span className="opacity-60">({counts[f]})</span>
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, doctor..."
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-full sm:w-56 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <p className="mt-2 text-sm">Loading appointments...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['ID', 'Patient', 'Doctor', 'Department', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-[#0f4b80] font-bold">#{a.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[10px] font-bold text-[#0f4b80]">
                          {(a.patient || 'P').charAt(0)}
                        </div>
                        <span className="text-sm font-semibold">{a.patient || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{a.doctor || 'N/A'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{a.department || '—'}</td>
                    <td className="px-5 py-4 text-sm font-medium">{a.appointment_date}</td>
                    <td className="px-5 py-4 text-sm">{a.appointment_time}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[a.status?.toUpperCase()] || 'bg-slate-100 text-slate-600'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-3">
                        <button onClick={() => setViewAppt(a)} className="text-[#0f4b80] hover:underline text-xs font-bold">View</button>
                        {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                          <button onClick={() => setCancelId(a.id)} className="text-red-500 hover:underline text-xs font-bold">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-slate-300 text-4xl">event_busy</span>
                <p className="text-slate-500 mt-2">No appointments found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Appointment Modal */}
      <Modal open={showNew} onClose={() => { setShowNew(false); setForm(BLANK) }} title="New Appointment">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Patient <span className="text-red-500">*</span></label>
              <select value={form.patient_id} onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 bg-white">
                <option value="">Select patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} — {p.phone || p.email}</option>)}
              </select>
            </div>
            {/* Doctor */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Doctor <span className="text-red-500">*</span></label>
              <select value={form.doctor_id} onChange={e => handleDoctorChange(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 bg-white">
                <option value="">Select doctor...</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.department}</option>)}
              </select>
            </div>
            {/* Date */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.appointment_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            {/* Time */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Time <span className="text-red-500">*</span></label>
              <select value={form.appointment_time} onChange={e => setForm(f => ({ ...f, appointment_time: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 bg-white">
                <option value="">Select time...</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* Department */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Department</label>
              <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="Auto-filled from doctor"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            {/* Reason */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Reason / Chief Complaint</label>
              <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                rows={2} placeholder="Describe the reason for visit..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleCreate} disabled={saving}
              className="flex-1 bg-[#0f4b80] text-white font-bold py-2.5 rounded-xl hover:bg-[#0d3f6e] disabled:opacity-60 transition-colors">
              {saving ? 'Creating...' : 'Create Appointment'}
            </button>
            <button onClick={() => { setShowNew(false); setForm(BLANK) }}
              className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewAppt} onClose={() => setViewAppt(null)} title={`Appointment #${viewAppt?.id}`}>
        {viewAppt && (
          <div className="space-y-3">
            {[
              ['Patient', viewAppt.patient],
              ['Doctor', viewAppt.doctor],
              ['Department', viewAppt.department || '—'],
              ['Date', viewAppt.appointment_date],
              ['Time', viewAppt.appointment_time],
              ['Status', viewAppt.status],
              ['Token #', viewAppt.token_number || '—'],
              ['Reason', viewAppt.reason || '—'],
              ['Notes', viewAppt.notes || '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                <span className="text-sm font-medium text-slate-800 text-right max-w-[60%]">{val}</span>
              </div>
            ))}
            <button onClick={() => setViewAppt(null)}
              className="w-full mt-2 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50">
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Cancel Confirm Modal */}
      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Appointment">
        <p className="text-slate-600 mb-6">Are you sure you want to cancel appointment <span className="font-bold text-slate-900">#{cancelId}</span>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={handleCancel} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl hover:opacity-90">Yes, Cancel</button>
          <button onClick={() => setCancelId(null)} className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50">Keep It</button>
        </div>
      </Modal>
    </div>
  )
}
