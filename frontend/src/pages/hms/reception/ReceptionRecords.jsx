import { useState, useEffect } from 'react'
import { hmsService } from '../../../services/api.js'

export default function ReceptionRecords() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    hmsService.getPatients()
      .then(setPatients)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) ||
    String(p.id).includes(search)
  )

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Patient Records</h1>
          <p className="text-slate-500 text-sm">{patients.length} patient(s) registered</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, phone or ID..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none bg-white" />
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          <p className="mt-2 text-sm">Loading records...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['ID', 'Patient', 'Gender', 'Blood Group', 'Phone', 'DOB', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">No records found</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#0f4b80] font-bold">#{p.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[#0f4b80] text-xs font-bold shrink-0">
                          {(p.name || 'P').charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 whitespace-nowrap">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.gender || '—'}</td>
                    <td className="px-4 py-3">
                      {p.blood_group ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600">{p.blood_group}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.date_of_birth || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(p)}
                        className="inline-flex items-center gap-1 text-[#0f4b80] text-xs font-semibold hover:underline">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Patient Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[#0f4b80] text-2xl font-black">
                  {(selected.name || 'P').charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selected.name}</h3>
                  <p className="text-sm text-slate-500">{selected.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Patient ID', `#${selected.id}`],
                  ['Phone', selected.phone || '—'],
                  ['Gender', selected.gender || '—'],
                  ['Blood Group', selected.blood_group || '—'],
                  ['Date of Birth', selected.date_of_birth || '—'],
                  ['Address', selected.address || '—'],
                  ['Emergency Contact', selected.emergency_contact || '—'],
                  ['Allergies', selected.allergies || 'None'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 font-semibold uppercase">{label}</p>
                    <p className="text-slate-800 font-semibold mt-0.5 break-words">{val}</p>
                  </div>
                ))}
              </div>
              {selected.medical_history && (
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Medical History</p>
                  <p className="text-slate-700 text-sm bg-slate-50 rounded-lg p-3">{selected.medical_history}</p>
                </div>
              )}
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
