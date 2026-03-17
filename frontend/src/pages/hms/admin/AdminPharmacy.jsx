import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { hmsService } from '../../../services/api.js'

const STATUS_COLORS = {
  ACTIVE:     'bg-amber-100 text-amber-700',
  COMPLETED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-600',
}

export default function AdminPharmacy() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hmsService.getPrescriptions()
      .then(data => setPrescriptions(data.map(rx => {
        let meds = []
        try { meds = JSON.parse(rx.medications || '[]') } catch {}
        const firstMed = meds[0] || {}
        return {
          ...rx,
          medicine: firstMed.name || rx.diagnosis || 'Prescription',
          qty: firstMed.quantity || firstMed.qty || 1,
          displayStatus: rx.status === 'ACTIVE' ? 'Pending' : rx.status === 'COMPLETED' ? 'Dispensed' : rx.status,
        }
      })))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const dispense = async (id) => {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: 'COMPLETED', displayStatus: 'Dispensed' } : p))
    toast.success('Medication dispensed successfully')
  }

  const pending = prescriptions.filter(p => p.displayStatus === 'Pending').length
  const dispensed = prescriptions.filter(p => p.displayStatus === 'Dispensed').length

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pharmacy Management</h1>
          <p className="text-slate-500 text-sm">Manage prescriptions and medication dispensing</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Pending', value: loading ? '—' : pending, color: 'bg-amber-50 text-amber-700' },
          { label: 'Dispensed', value: loading ? '—' : dispensed, color: 'bg-green-50 text-green-700' },
        ].map(s => (
          <div key={s.label} className={`p-5 rounded-xl border border-slate-200 ${s.color}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-xs font-bold uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          <p className="mt-2 text-sm">Loading prescriptions...</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-slate-300 text-5xl">medication_liquid</span>
          <p className="text-slate-500 mt-2">No prescriptions found</p>
        </div>
      ) : (
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[rx.status] || 'bg-slate-100 text-slate-600'}`}>
                        {rx.displayStatus}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Patient: <span className="font-medium text-slate-700">{rx.patient}</span>
                    </p>
                    {rx.created_at && (
                      <p className="text-xs text-slate-400">
                        {new Date(rx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                {rx.displayStatus === 'Pending' && (
                  <button onClick={() => dispense(rx.id)}
                    className="px-4 py-2 bg-[#0f4b80] text-white text-sm font-bold rounded-lg hover:opacity-90 shrink-0">
                    Dispense
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
