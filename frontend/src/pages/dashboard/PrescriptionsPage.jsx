import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { prescriptionService } from '../../services/api.js'

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    prescriptionService.getAll()
      .then(data => { setPrescriptions(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleRefill = async (rx) => {
    if (rx.refills === 0) return toast.error('No refills remaining. Please contact your doctor.')
    toast.success(`Refill requested for ${rx.medicine}`)
  }

  const active = prescriptions.filter(p => p.status === 'active')
  const expired = prescriptions.filter(p => p.status === 'expired')

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Prescriptions</h2>
        <p className="text-slate-500">Manage your medications and request refills</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-100 h-48" />)}
        </div>
      ) : (
        <>
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">medication</span>
            Active Prescriptions
          </h3>
          {active.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-slate-200 mb-8">
              <span className="material-symbols-outlined text-slate-300 text-4xl">medication</span>
              <p className="text-slate-500 mt-2">No active prescriptions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {active.map(rx => (
                <div key={rx.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0f4b80]/10 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#0f4b80]">medication</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 leading-none">{rx.medicine}</h3>
                          <p className="text-sm text-slate-500 font-medium">{rx.dosage} {rx.form}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Active</span>
                    </div>
                    <div className="space-y-2 py-3 border-y border-slate-100">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-slate-400 text-lg">medical_information</span>
                        <span className="text-slate-600">{rx.doctor}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-slate-400 text-lg">schedule</span>
                        <span className="text-slate-600">{rx.instructions}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-slate-400 text-lg">reorder</span>
                        <span className="text-slate-600">Refills remaining: <span className="font-bold text-[#0f4b80]">{rx.refills}</span></span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleRefill(rx)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                          rx.refills > 0 ? 'bg-[#0f4b80] text-white hover:opacity-90' : 'bg-amber-500 text-white hover:opacity-90'
                        }`}>
                        {rx.refills > 0 ? 'Refill Now' : 'Renew Script'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {expired.length > 0 && (
            <>
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">history</span>
                Recently Expired
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Medication</th>
                      <th className="px-6 py-4 hidden sm:table-cell">Dosage</th>
                      <th className="px-6 py-4 hidden md:table-cell">Doctor</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expired.map(rx => (
                      <tr key={rx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{rx.medicine}</td>
                        <td className="px-6 py-4 hidden sm:table-cell text-slate-500 text-sm">{rx.dosage} {rx.form}</td>
                        <td className="px-6 py-4 hidden md:table-cell text-slate-500 text-sm">{rx.doctor}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{rx.date}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => toast.success('Renewal request sent!')}
                            className="text-[#0f4b80] hover:underline font-bold text-sm">Request Renewal</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
