import { useState } from 'react'
import { HMS_PATIENTS } from '../../../data/hmsData.js'
import toast from 'react-hot-toast'

const ADMITTED = HMS_PATIENTS.filter(p => p.status === 'Active').map((p, i) => ({
  ...p,
  room: ['ICU-04', 'B-201', 'C-105', 'D-302'][i % 4],
  admitDate: p.admitted,
  days: Math.floor(Math.random() * 7) + 1,
  diagnosis: ['Hypertension', 'Cardiac Arrhythmia', 'Knee Injury', 'Migraine'][i % 4],
}))

const STATUS_COLORS = {
  Active: 'bg-green-50 text-green-700',
  Discharged: 'bg-slate-100 text-slate-500',
}

export default function ReceptionDischarge() {
  const [patients, setPatients] = useState(ADMITTED)
  const [confirm, setConfirm] = useState(null)
  const [selected, setSelected] = useState(null)

  const handleDischarge = (id) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'Discharged' } : p))
    toast.success('Patient discharged successfully')
    setConfirm(null)
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Discharge Management</h1>
        <p className="text-slate-500 text-sm mt-1">Process patient discharges and generate summaries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Currently Admitted', value: patients.filter(p => p.status === 'Active').length, icon: 'bed', color: 'text-blue-600 bg-blue-50' },
          { label: 'Discharged Today', value: patients.filter(p => p.status === 'Discharged').length, icon: 'exit_to_app', color: 'text-green-600 bg-green-50' },
          { label: 'Pending Discharge', value: patients.filter(p => p.status === 'Active' && p.days >= 3).length, icon: 'pending_actions', color: 'text-amber-600 bg-amber-50' },
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

      {/* Patient list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Admitted Patients</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Patient', 'ID', 'Room', 'Doctor', 'Diagnosis', 'Days', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[#0f4b80] text-xs font-bold shrink-0">
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-semibold text-slate-900 whitespace-nowrap">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.id}</td>
                  <td className="px-4 py-3 text-slate-700">{p.room}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{p.doctor}</td>
                  <td className="px-4 py-3 text-slate-700">{p.diagnosis}</td>
                  <td className="px-4 py-3 text-slate-700">{p.days}d</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(p)}
                        className="text-[#0f4b80] text-xs font-semibold hover:underline inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">description</span>
                        Summary
                      </button>
                      {p.status === 'Active' && (
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
              Are you sure you want to discharge <span className="font-bold">{confirm.name}</span> from room <span className="font-bold">{confirm.room}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDischarge(confirm.id)}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                Yes, Discharge
              </button>
              <button onClick={() => setConfirm(null)}
                className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
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
                  ['Patient ID', selected.id],
                  ['Room', selected.room],
                  ['Doctor', selected.doctor],
                  ['Diagnosis', selected.diagnosis],
                  ['Admit Date', selected.admitDate],
                  ['Duration', `${selected.days} days`],
                  ['Status', selected.status],
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
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => { toast.success('Summary downloaded'); setSelected(null) }}
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
