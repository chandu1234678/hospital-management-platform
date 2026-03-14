import { useState } from 'react'
import toast from 'react-hot-toast'
import { DOCTORS } from '../../../data/mockData.js'

export default function AdminDoctors() {
  const [search, setSearch] = useState('')
  const filtered = DOCTORS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.department.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Doctor Management</h1>
          <p className="text-slate-500 text-sm">Manage medical staff and schedules</p>
        </div>
        <button onClick={() => toast.success('Add doctor form opened')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add Doctor
        </button>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search doctors..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 shrink-0">
                <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{doc.name}</h3>
                <p className="text-xs text-[#0f4b80] font-medium">{doc.specialty}</p>
                <p className="text-xs text-slate-500">{doc.department} · {doc.experience}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                  <span className="text-xs font-bold">{doc.rating}</span>
                  <span className="text-xs text-slate-400">({doc.reviews})</span>
                </div>
              </div>
            </div>
            <div className="px-5 pb-4 flex gap-2">
              <button onClick={() => toast.success(`Viewing ${doc.name}'s schedule`)}
                className="flex-1 py-2 bg-[#0f4b80]/10 text-[#0f4b80] text-xs font-bold rounded-lg hover:bg-[#0f4b80]/20 transition-colors">
                Schedule
              </button>
              <button onClick={() => toast.success(`Editing ${doc.name}'s profile`)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
