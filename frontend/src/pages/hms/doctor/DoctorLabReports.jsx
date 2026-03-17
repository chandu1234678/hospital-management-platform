import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { hmsService } from '../../../services/api.js'

const STATUS_COLORS = {
  PENDING:    'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-600',
}

const TEST_TYPES = ['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'ECG', 'Ultrasound', 'Biopsy', 'Culture', 'Other']

export default function DoctorLabReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [showNew, setShowNew] = useState(false)
  const [patients, setPatients] = useState([])
  const [form, setForm] = useState({ patient_id: '', test_name: '', test_type: 'Blood Test', remarks: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    hmsService.getDoctorLabReports()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false))
    hmsService.getDoctorPatients().then(setPatients).catch(() => {})
  }, [])

  const filtered = reports.filter(r => {
    const matchSearch = r.patient?.toLowerCase().includes(search.toLowerCase()) ||
      r.test_name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || r.status === filter
    return matchSearch && matchFilter
  })

  const handleRequest = async () => {
    if (!form.patient_id || !form.test_name) return toast.error('Patient and test name are required')
    setSaving(true)
    try {
      const report = await hmsService.createLabReport({
        patient_id: Number(form.patient_id),
        test_name: form.test_name,
        test_type: form.test_type,
        remarks: form.remarks,
        status: 'PENDING',
      })
      const patientName = patients.find(p => p.id === Number(form.patient_id))?.name || 'Patient'
      setReports(prev => [{ ...report, patient: patientName }, ...prev])
      toast.success('Lab test requested')
      setShowNew(false)
      setForm({ patient_id: '', test_name: '', test_type: 'Blood Test', remarks: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to request lab test')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="p-8 text-center text-slate-400">
      <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      <p className="mt-2 text-sm">Loading lab reports...</p>
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Lab Reports</h1>
          <p className="text-slate-500 text-sm">{reports.length} report(s) ordered</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-[#0f4b80] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 shadow-sm self-start sm:self-auto">
          <span className="material-symbols-outlined text-[18px]">science</span>
          Request Lab Test
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient or test name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${filter === s ? 'bg-[#0f4b80] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-slate-300 text-5xl">lab_profile</span>
          <p className="text-slate-500 mt-2">{search || filter !== 'ALL' ? 'No reports match your filter' : 'No lab reports found'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#0f4b80]/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#0f4b80]">lab_profile</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">{r.test_name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[r.status] || 'bg-slate-100 text-slate-600'}`}>
                      {r.status}
                    </span>
                    {r.test_type && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">{r.test_type}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    Patient: <span className="font-medium text-slate-700">{r.patient}</span>
                    {r.report_date && ` · ${r.report_date}`}
                  </p>
                  {r.remarks && <p className="text-xs text-slate-400 mt-1">{r.remarks}</p>}
                </div>
                {r.status === 'COMPLETED' && r.results && (
                  <div className="shrink-0">
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                      Results Available
                    </span>
                  </div>
                )}
              </div>
              {r.status === 'COMPLETED' && r.results && (
                <div className="mt-3 bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Results</p>
                  <p className="text-sm text-slate-700">{r.results}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Request Lab Test Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Request Lab Test</h2>
              <button onClick={() => setShowNew(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Patient</label>
                <select value={form.patient_id} onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Test Name</label>
                <input value={form.test_name} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))}
                  placeholder="e.g. Complete Blood Count"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Test Type</label>
                <select value={form.test_type} onChange={e => setForm(f => ({ ...f, test_type: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                  {TEST_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Remarks / Instructions</label>
                <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                  rows={2} placeholder="Special instructions for the lab..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm resize-none" />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={handleRequest} disabled={saving}
                className="flex-1 bg-[#0f4b80] text-white py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : null}
                {saving ? 'Requesting...' : 'Request Test'}
              </button>
              <button onClick={() => setShowNew(false)}
                className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
