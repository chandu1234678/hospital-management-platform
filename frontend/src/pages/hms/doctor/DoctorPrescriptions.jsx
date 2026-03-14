import { useState } from 'react'
import toast from 'react-hot-toast'
import { HMS_PHARMACY } from '../../../data/hmsData.js'

export default function DoctorPrescriptions() {
  const [prescriptions] = useState(HMS_PHARMACY)

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Prescriptions</h1>
          <p className="text-slate-500 text-sm">Medications prescribed to your patients</p>
        </div>
        <button onClick={() => toast.success('New prescription pad opened')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          New Prescription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prescriptions.map(rx => (
          <div key={rx.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#0f4b80]/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#0f4b80]">medication</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{rx.medicine}</h4>
                <p className="text-xs text-slate-500">Qty: {rx.qty} · {rx.time}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">Patient: <span className="font-medium">{rx.patient}</span></p>
            <div className="flex items-center justify-between mt-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rx.status === 'Dispensed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {rx.status}
              </span>
              <button onClick={() => toast.success(`Printing prescription ${rx.id}`)}
                className="text-[#0f4b80] text-xs font-bold hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">print</span>Print
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
