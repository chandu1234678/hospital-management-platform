import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { hmsService } from '../../../services/api.js'

const STATUS_COLORS = { PROCESSING: 'bg-blue-100 text-blue-700', PENDING: 'bg-amber-100 text-amber-700', COMPLETED: 'bg-green-100 text-green-700' }

export default function AdminLab() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hmsService.getLabQueue()
      .then(setQueue)
      .catch(() => toast.error('Failed to load lab queue'))
      .finally(() => setLoading(false))
  }, [])

  const markReady = (id) => {
    setQueue(prev => prev.map(l => l.id === id ? { ...l, status: 'COMPLETED' } : l))
    toast.success('Report marked as ready')
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Lab Technician Panel</h1>
          <p className="text-slate-500 text-sm">Manage lab tests and diagnostic reports</p>
        </div>
        <button onClick={() => toast.success('New lab order form opened')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          New Test Order
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', key: 'PENDING', color: 'text-amber-600 bg-amber-50' },
          { label: 'Processing', key: 'PROCESSING', color: 'text-blue-600 bg-blue-50' },
          { label: 'Completed', key: 'COMPLETED', color: 'text-green-600 bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl border border-slate-200 text-center ${s.color}`}>
            <p className="text-2xl font-black">{queue.filter(q => q.status === s.key).length}</p>
            <p className="text-xs font-bold uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <p className="mt-2 text-sm">Loading lab queue...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['ID', 'Patient', 'Test', 'Type', 'Doctor', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-[#0f4b80] font-bold">LAB-{String(l.id).padStart(4, '0')}</td>
                    <td className="px-5 py-4 text-sm font-semibold">{l.patient || 'Unknown'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{l.test_name}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{l.test_type || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{l.doctor || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{l.report_date || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[l.status] || 'bg-slate-100 text-slate-600'}`}>{l.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      {l.status !== 'COMPLETED' ? (
                        <button onClick={() => markReady(l.id)} className="text-[#0f4b80] hover:underline text-xs font-bold">Mark Ready</button>
                      ) : (
                        <button onClick={() => toast.success(`Downloading LAB-${l.id}`)} className="text-green-600 hover:underline text-xs font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">download</span>Report
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {queue.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-slate-300 text-4xl">lab_profile</span>
                <p className="text-slate-500 mt-2">No lab reports found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
