import { useState } from 'react'
import { HMS_PATIENTS } from '../../../data/hmsData.js'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  Active: 'bg-green-100 text-green-700',
  Discharged: 'bg-slate-100 text-slate-600',
}

export default function AdminPatients() {
  const [search, setSearch] = useState('')
  const [patients] = useState(HMS_PATIENTS)

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Patient Records</h1>
          <p className="text-slate-500 text-sm">Manage all registered patients</p>
        </div>
        <button onClick={() => toast.success('New patient registration form opened')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add Patient
        </button>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or patient ID..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                {['Patient ID', 'Name', 'Age/Gender', 'Blood', 'Doctor', 'Admitted', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono text-[#0f4b80] font-bold">{p.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[#0f4b80] text-xs font-bold">
                        {p.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{p.age}y / {p.gender}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-700">{p.blood}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{p.doctor}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{p.admitted}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => toast.success(`Viewing ${p.name}'s records`)}
                        className="text-[#0f4b80] hover:underline text-xs font-bold">View</button>
                      <button onClick={() => toast.success(`Editing ${p.name}'s records`)}
                        className="text-slate-500 hover:underline text-xs font-bold">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-slate-300 text-4xl">person_search</span>
            <p className="text-slate-500 mt-2">No patients found</p>
          </div>
        )}
      </div>
    </div>
  )
}
