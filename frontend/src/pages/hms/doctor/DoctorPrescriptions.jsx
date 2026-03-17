import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { hmsService } from '../../../services/api.js'

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-600',
}

const BLANK_MED = { name: '', dosage: '', frequency: '', duration: '' }

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [patients, setPatients] = useState([])
  const [form, setForm] = useState({ patient_id: '', diagnosis: '', instructions: '', medications: [{ ...BLANK_MED }] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    hmsService.getDoctorPrescriptions()
      .then(setPrescriptions)
      .catch(() => {})
      .finally(() => setLoading(false))
    hmsService.getDoctorPatients().then(setPatients).catch(() => {})
  }, [])

  const filtered = prescriptions.filter(rx =>
    rx.patient?.toLowerCase().includes(search.toLowerCase()) ||
    rx.diagnosis?.toLowerCase().includes(search.toLowerCase())
  )

  const parseMeds = (raw) => {
    try { return JSON.parse(raw || '[]') } catch { return [] }
  }

  const addMed = () => setForm(f => ({ ...f, medications: [...f.medications, { ...BLANK_MED }] }))
  const removeMed = (i) => setForm(f => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }))
  const updateMed = (i, field, val) => setForm(f => ({
    ...f, medications: f.medications.map((m, idx) => idx === i ? { ...m, [field]: val } : m)
  }))

  const handleCreate = async () => {
    if (!form.patient_id || !form.diagnosis) return toast.error('Patient and diagnosis are required')
    if (form.medications.some(m => !m.name)) return toast.error('All medications need a name')
    setSaving(true)
    try {
      const rx = await hmsService.createPrescription({
        patient_id: Number(form.patient_id),
        diagnosis: form.diagnosis,
        instructions: form.instructions,
        medications: JSON.stringify(form.medications),
        status: 'ACTIVE',
      })
      const patientName = patients.find(p => p.id === Number(form.patient_id))?.name || 'Patient'
      setPrescriptions(prev => [{ ...rx, patient: patientName }, ...prev])
      toast.success('Prescription created')
      setShowNew(false)
      setForm({ patient_id: '', diagnosis: '', instructions: '', medications: [{ ...BLANK_MED }] })
    } catch (err) {
      toast.error(err.message || 'Failed to create prescription')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="p-8 text-center text-slate-400">
      <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      <p className="mt-2 text-sm">Loading prescriptions...</p>
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Prescriptions</h1>
          <p className="text-slate-500 text-sm">{prescriptions.length} prescription(s) issued</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-[#0f4b80] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 shadow-sm self-start sm:self-auto">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Prescription
        </button>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient or diagnosis..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none text-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-slate-300 text-5xl">medication_liquid</span>
          <p className="text-slate-500 mt-2">{search ? 'No prescriptions match your search' : 'No prescriptions found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(rx => {
            const meds = parseMeds(rx.medications)
            const firstMed = meds[0] || {}
            const date = rx.created_at ? new Date(rx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
            return (
              <div key={rx.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0f4b80]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#0f4b80]">medication</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{firstMed.name || rx.diagnosis || 'Prescription'}</h4>
                    <p className="text-xs text-slate-500">{date}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${STATUS_COLORS[rx.status] || 'bg-slate-100 text-slate-600'}`}>
                    {rx.status}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mb-1">
                  Patient: <span className="font-semibold">{rx.patient}</span>
                </p>
                {rx.diagnosis && (
                  <p className="text-xs text-slate-500 mb-2">Diagnosis: {rx.diagnosis}</p>
                )}
                {meds.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                    {meds.slice(0, 3).map((m, i) => (
                      <p key={i} className="text-xs text-slate-600">
                        <span className="font-semibold">{m.name}</span>
                        {m.dosage && ` — ${m.dosage}`}
                        {m.frequency && ` · ${m.frequency}`}
                      </p>
                    ))}
                    {meds.length > 3 && <p className="text-xs text-slate-400">+{meds.length - 3} more</p>}
                  </div>
                )}
                {rx.instructions && (
                  <p className="text-xs text-slate-500 mt-2 italic">{rx.instructions}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* New Prescription Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">New Prescription</h2>
              <button onClick={() => setShowNew(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Patient</label>
                <select value={form.patient_id} onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Diagnosis</label>
                <input value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                  placeholder="e.g. Hypertension, Type 2 Diabetes"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Medications</label>
                  <button onClick={addMed} className="text-xs text-[#0f4b80] font-bold hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span> Add
                  </button>
                </div>
                <div className="space-y-3">
                  {form.medications.map((m, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <input value={m.name} onChange={e => updateMed(i, 'name', e.target.value)}
                          placeholder="Drug name"
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-[#0f4b80] outline-none text-xs" />
                        <input value={m.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)}
                          placeholder="Dosage"
                          className="w-24 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-[#0f4b80] outline-none text-xs" />
                        {form.medications.length > 1 && (
                          <button onClick={() => removeMed(i)} className="text-red-400 hover:text-red-600">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input value={m.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)}
                          placeholder="Frequency (e.g. Twice daily)"
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-[#0f4b80] outline-none text-xs" />
                        <input value={m.duration} onChange={e => updateMed(i, 'duration', e.target.value)}
                          placeholder="Duration"
                          className="w-28 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-[#0f4b80] outline-none text-xs" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Instructions</label>
                <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                  rows={2} placeholder="Special instructions for the patient..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm resize-none" />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 bg-[#0f4b80] text-white py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : null}
                {saving ? 'Creating...' : 'Create Prescription'}
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
