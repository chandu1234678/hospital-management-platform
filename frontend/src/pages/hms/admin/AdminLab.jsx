import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { hmsService, doctorService } from '../../../services/api.js'

const STATUS_COLORS = {
  PROCESSING: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
}

const TEST_TYPES = ['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'ECG', 'Ultrasound', 'Biopsy', 'Culture', 'Other']

const EMPTY_FORM = { patient_id: '', doctor_id: '', test_name: '', test_type: 'Blood Test', report_date: '', remarks: '' }

export default function AdminLab() {
  const [queue, setQueue] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      hmsService.getLabQueue(),
      hmsService.getPatients(),
      doctorService.getAll(),
    ]).then(([lab, pts, docs]) => {
      setQueue(lab)
      setPatients(pts)
      setDoctors(docs)
    }).catch(() => toast.error('Failed to load lab data'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = queue.filter(l =>
    !search ||
    (l.patient || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.test_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.patient_id || !form.test_name) return toast.error('Patient and test name are required')
    setSaving(true)
    try {
      const payload = {
        patient_id: Number(form.patient_id),
        doctor_id: form.doctor_id ? Number(form.doctor_id) : null,
        test_name: form.test_name,
        test_type: form.test_type,
        report_date: form.report_date || null,
        remarks: form.remarks || null,
        status: 'PENDING',
      }
      const created = await hmsService.createLabReport(payload)
      const patientName = patients.find(p => p.id === Number(form.patient_id))?.name || 'Unknown'
      const doctorName = doctors.find(d => d.id === Number(form.doctor_id))?.name || null
      setQueue(prev => [{ ...created, patient: patientName, doctor: doctorName || 'N/A' }, ...prev])
      toast.success('Lab test order created')
      setShowModal(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      toast.error(err.message || 'Failed to create lab order')
    } finally {
      setSaving(false)
    }
  }

  const markReady = async (id) => {
    try {
      await hmsService.updateLabReport(id, { status: 'COMPLETED' })
      setQueue(prev => prev.map(l => l.id === id ? { ...l, status: 'COMPLETED' } : l))
      toast.success('Report marked as ready')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const markProcessing = async (id) => {
    try {
      await hmsService.updateLabReport(id, { status: 'PROCESSING' })
      setQueue(prev => prev.map(l => l.id === id ? { ...l, status: 'PROCESSING' } : l))
      toast.success('Status updated to Processing')
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Lab Technician Panel</h1>
          <p className="text-slate-500 text-sm">Manage lab tests and diagnostic reports</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          New Test Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', key: 'PENDING', color: 'text-amber-600 bg-amber-50' },
          { label: 'Processing', key: 'PROCESSING', color: 'text-blue-600 bg-blue-50' },
          { label: 'Completed', key: 'COMPLETED', color: 'text-green-600 bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl border border-slate-200 text-center ${s.color}`}>
            <p className="text-2xl font-black">{queue.filter(q => q.status === s.key).length}</p>
            <p className="text-xs font-bold uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient or test..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none bg-white" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <p className="mt-2 text-sm">Loading lab queue...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['ID', 'Patient', 'Test', 'Type', 'Doctor', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-[#0f4b80] font-bold">LAB-{String(l.id).padStart(4, '0')}</td>
                    <td className="px-5 py-4 text-sm font-semibold">{l.patient || 'Unknown'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{l.test_name}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{l.test_type || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{l.doctor || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{l.report_date || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[l.status] || 'bg-slate-100 text-slate-600'}`}>{l.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {l.status === 'PENDING' && (
                          <button onClick={() => markProcessing(l.id)} className="text-blue-600 hover:underline text-xs font-bold">Process</button>
                        )}
                        {l.status === 'PROCESSING' && (
                          <button onClick={() => markReady(l.id)} className="text-[#0f4b80] hover:underline text-xs font-bold">Mark Ready</button>
                        )}
                        {l.status === 'COMPLETED' && (
                          <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>Done
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-slate-300 text-4xl">lab_profile</span>
                <p className="text-slate-500 mt-2">{search ? 'No results found' : 'No lab reports found'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Test Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">New Test Order</h2>
                <p className="text-xs text-slate-500 mt-0.5">Create a new lab test request</p>
              </div>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }} className="p-2 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Patient <span className="text-red-500">*</span></label>
                  <select value={form.patient_id} onChange={e => setForm(p => ({ ...p, patient_id: e.target.value }))} required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none bg-white">
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Referring Doctor</label>
                  <select value={form.doctor_id} onChange={e => setForm(p => ({ ...p, doctor_id: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none bg-white">
                    <option value="">None / Walk-in</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Test Name <span className="text-red-500">*</span></label>
                  <input value={form.test_name} onChange={e => setForm(p => ({ ...p, test_name: e.target.value }))} required
                    placeholder="e.g. Complete Blood Count"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Test Type</label>
                  <select value={form.test_type} onChange={e => setForm(p => ({ ...p, test_type: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none bg-white">
                    {TEST_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Report Date</label>
                  <input type="date" value={form.report_date} onChange={e => setForm(p => ({ ...p, report_date: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Remarks</label>
                  <input value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))}
                    placeholder="Optional notes"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-[#0f4b80] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                  {saving ? 'Creating...' : 'Create Order'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }}
                  className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
