import { useState, useEffect } from 'react'
import { hmsService } from '../../../services/api.js'
import toast from 'react-hot-toast'

export default function ReceptionDischarge() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    hmsService.getPatients()
      .then(data => {
        // Enrich with mock ward/room data since no admission model exists
        const WARDS = ['ICU', 'General', 'Surgical', 'Pediatric', 'Maternity']
        const DIAGNOSES = ['Hypertension', 'Cardiac Arrhythmia', 'Knee Injury', 'Migraine', 'Diabetes', 'Fracture', 'Appendicitis']
        setPatients(data.map((p, i) => ({
          ...p,
          room: `${WARDS[i % WARDS.length]}-${100 + i}`,
          admitDate: new Date(Date.now() - (i + 1) * 86400000 * 2).toISOString().split('T')[0],
          days: (i % 7) + 1,
          diagnosis: DIAGNOSES[i % DIAGNOSES.length],
          admitStatus: i % 5 === 0 ? 'Discharged' : 'Active',
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDischarge = (id) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, admitStatus: 'Discharged' } : p))
    toast.success('Patient discharged successfully')
    setConfirm(null)
  }

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.room?.toLowerCase().includes(search.toLowerCase())
  )

  const admitted = patients.filter(p => p.admitStatus === 'Active').length
  const discharged = patients.filter(p => p.admitStatus === 'Discharged').length
  const pending = patients.filter(p => p.admitStatus === 'Active' && p.days >= 3).length

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Discharge Management</h1>
        <p className="text-slate-500 text-sm mt-1">Process patient discharges and generate summaries</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Currently Admitted', value: admitted, icon: 'bed', color: 'text-blue-600 bg-blue-50' },
          { label: 'Discharged', value: discharged, icon: 'exit_to_app', color: 'text-green-600 bg-green-50' },
          { label: 'Pending Discharge', value: pending, icon: 'pending_actions', color: 'text-amber-600 bg-amber-50' },
          { label: 'Avg Stay (days)', value: '4.2', icon: 'schedule', color: 'text-violet-600 bg-violet-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or room..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none bg-white" />
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          <p className="mt-2 text-sm">Loading patients...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Patient', 'ID', 'Room', 'Diagnosis', 'Days', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[#0f4b80] text-xs font-bold shrink-0">
                          {(p.name || 'P').charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900 whitespace-nowrap">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">#{p.id}</td>
                    <td className="px-4 py-3 text-slate-700">{p.room}</td>
                    <td className="px-4 py-3 text-slate-700">{p.diagnosis}</td>
                    <td className="px-4 py-3 text-slate-700">{p.days}d</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.admitStatus === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {p.admitStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelected(p)}
                          className="text-[#0f4b80] text-xs font-semibold hover:underline inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">description</span>
                          Summary
                        </button>
                        {p.admitStatus === 'Active' && (
                          <button onClick={() => setConfirm(p)}
                            className="text-red-600 text-xs font-semibold hover:underline inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">exit_to_app</span>
                            Discharge
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Discharge Modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">exit_to_app</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Confirm Discharge</h2>
                <p className="text-slate-500 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-slate-700 text-sm bg-slate-50 rounded-lg p-3">
              Discharge <span className="font-bold">{confirm.name}</span> from room <span className="font-bold">{confirm.room}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDischarge(confirm.id)}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90">
                Yes, Discharge
              </button>
              <button onClick={() => setConfirm(null)}
                className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discharge Summary Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Discharge Summary</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Patient', selected.name],
                  ['Patient ID', `#${selected.id}`],
                  ['Room', selected.room],
                  ['Diagnosis', selected.diagnosis],
                  ['Admit Date', selected.admitDate],
                  ['Duration', `${selected.days} days`],
                  ['Blood Group', selected.blood_group || '—'],
                  ['Status', selected.admitStatus],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 font-semibold uppercase">{label}</p>
                    <p className="text-slate-800 font-semibold mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Discharge Instructions</p>
                <p className="text-slate-700 bg-slate-50 rounded-lg p-3">
                  Patient advised to rest for 5–7 days. Follow-up appointment scheduled in 2 weeks. Medications prescribed as per attached prescription.
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button onClick={() => setSelected(null)}
                className="w-full border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
