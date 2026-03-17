import { useState, useEffect } from 'react'
import { hmsService } from '../../../services/api.js'

export default function DoctorPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    hmsService.getDoctorPatients()
      .then(setPatients)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="p-8 text-center text-slate-400">
      <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      <p className="mt-2 text-sm">Loading patients...</p>
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Patients</h1>
          <p className="text-slate-500 text-sm">{patients.length} patient(s) under your care</p>
        </div>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none text-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-slate-300 text-5xl">group_off</span>
          <p className="text-slate-500 mt-2">{search ? 'No patients match your search' : 'No patients found'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[#0f4b80] font-bold text-lg shrink-0">
                  {(p.name || 'P').charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">{p.name}</h4>
                    {p.gender && <span className="text-xs text-slate-400">{p.gender}</span>}
                    {p.blood_group && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600">{p.blood_group}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{p.email} · {p.phone || 'No phone'}</p>
                  {p.allergies && p.allergies !== 'None' && (
                    <p className="text-xs text-red-600 font-semibold mt-1">⚠ Allergy: {p.allergies}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded-lg">
                    ID #{p.id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
