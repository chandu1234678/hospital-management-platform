import { useState } from 'react'
import { HMS_PATIENTS } from '../../../data/hmsData.js'
import toast from 'react-hot-toast'

const RECORDS = HMS_PATIENTS.map((p, i) => ({
  ...p,
  recordId: `REC-${1000 + i}`,
  type: ['OPD Visit', 'Lab Report', 'Discharge Summary', 'Prescription'][i % 4],
  date: p.admitted,
  notes: 'Patient presented with routine complaints. Examination normal. Follow-up advised.',
}))

export default function ReceptionRecords() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = RECORDS.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.recordId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Medical Records</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage patient medical records</p>
        </div>
        <button onClick={() => toast.success('Export initiated')}
          className="inline-flex items-center gap-2 bg-[#0f4b80] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Records
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, patient ID or record ID..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none bg-white" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Record ID', 'Patient', 'Patient ID', 'Type', 'Date', 'Doctor', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No records found</td></tr>
              ) : filtered.map(r => (
                <tr key={r.recordId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#0f4b80] font-bold">{r.recordId}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{r.name}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{r.id}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{r.type}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.doctor}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(r)}
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

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Record Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Record ID', selected.recordId],
                  ['Patient ID', selected.id],
                  ['Patient Name', selected.name],
                  ['Age / Gender', `${selected.age} / ${selected.gender}`],
                  ['Record Type', selected.type],
                  ['Date', selected.date],
                  ['Doctor', selected.doctor],
                  ['Blood Group', selected.blood],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 font-semibold uppercase">{label}</p>
                    <p className="text-slate-800 font-semibold mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Clinical Notes</p>
                <p className="text-slate-700 text-sm bg-slate-50 rounded-lg p-3">{selected.notes}</p>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => { toast.success('Record downloaded'); setSelected(null) }}
                className="flex-1 bg-[#0f4b80] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download PDF
              </button>
              <button onClick={() => setSelected(null)}
                className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
