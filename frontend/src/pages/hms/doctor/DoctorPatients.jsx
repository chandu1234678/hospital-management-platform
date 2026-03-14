import toast from 'react-hot-toast'
import { HMS_DOCTOR_PATIENTS } from '../../../data/hmsData.js'

export default function DoctorPatients() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Patients</h1>
        <p className="text-slate-500 text-sm">Patients currently under your care</p>
      </div>

      <div className="space-y-4">
        {HMS_DOCTOR_PATIENTS.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[#0f4b80] font-bold text-lg shrink-0">
                {p.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-900">{p.name}</h4>
                  <span className="text-xs text-slate-400">{p.gender === 'F' ? 'Female' : 'Male'}, {p.age}y</span>
                  <span className="text-xs font-mono text-[#0f4b80]">#{p.id}</span>
                </div>
                <p className="text-sm text-slate-500">Reason: {p.reason}</p>
                {p.allergy !== 'None' && (
                  <p className="text-xs text-red-600 font-bold mt-0.5">⚠ Allergy: {p.allergy}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => toast.success(`Opening ${p.name}'s records`)}
                  className="px-4 py-2 bg-[#0f4b80] text-white text-xs font-bold rounded-lg hover:opacity-90">
                  View Records
                </button>
                <button onClick={() => toast.success(`Writing prescription for ${p.name}`)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50">
                  Prescribe
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
