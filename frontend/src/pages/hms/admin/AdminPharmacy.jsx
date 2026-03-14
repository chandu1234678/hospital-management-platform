import { useState } from 'react'
import toast from 'react-hot-toast'
import { HMS_PHARMACY } from '../../../data/hmsData.js'

const STATUS_COLORS = { Dispensed: 'bg-green-100 text-green-700', Pending: 'bg-amber-100 text-amber-700' }

export default function AdminPharmacy() {
  const [prescriptions, setPrescriptions] = useState(HMS_PHARMACY)

  const dispense = (id) => {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: 'Dispensed' } : p))
    toast.success('Medication dispensed successfully')
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pharmacy Management</h1>
          <p className="text-slate-500 text-sm">Manage prescriptions and medication dispensing</p>
        </div>
        <button onClick={() => toast.success('New prescription form opened')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          New Prescription
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Pending', value: prescriptions.filter(p => p.status === 'Pending').length, color: 'bg-amber-50 text-amber-700' },
          { label: 'Dispensed Today', value: prescriptions.filter(p => p.status === 'Dispensed').length, color: 'bg-green-50 text-green-700' },
        ].map(s => (
          <div key={s.label} className={`p-5 rounded-xl border border-slate-200 ${s.color}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-xs font-bold uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {prescriptions.map(rx => (
          <div key={rx.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#0f4b80]/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#0f4b80]">medication</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900">{rx.medicine}</p>
                    <span className="text-xs text-slate-500">× {rx.qty}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[rx.status]}`}>{rx.status}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">Patient: <span className="font-medium text-slate-700">{rx.patient}</span></p>
                  <p className="text-xs text-slate-400">Prescribed by {rx.doctor} · {rx.time}</p>
                </div>
              </div>
              {rx.status === 'Pending' && (
                <button onClick={() => dispense(rx.id)}
                  className="px-4 py-2 bg-[#0f4b80] text-white text-sm font-bold rounded-lg hover:opacity-90 shrink-0">
                  Dispense
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
