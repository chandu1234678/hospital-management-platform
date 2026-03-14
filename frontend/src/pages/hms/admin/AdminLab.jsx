import { useState } from 'react'
import toast from 'react-hot-toast'
import { HMS_LAB_QUEUE } from '../../../data/hmsData.js'

const STATUS_COLORS = { Processing: 'bg-blue-100 text-blue-700', Pending: 'bg-amber-100 text-amber-700', Ready: 'bg-green-100 text-green-700' }
const PRIORITY_COLORS = { Stat: 'bg-red-100 text-red-700', Urgent: 'bg-orange-100 text-orange-700', Routine: 'bg-slate-100 text-slate-600' }

export default function AdminLab() {
  const [queue, setQueue] = useState(HMS_LAB_QUEUE)

  const markReady = (id) => {
    setQueue(prev => prev.map(l => l.id === id ? { ...l, status: 'Ready' } : l))
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: queue.filter(q => q.status === 'Pending').length, color: 'text-amber-600 bg-amber-50' },
          { label: 'Processing', value: queue.filter(q => q.status === 'Processing').length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Ready', value: queue.filter(q => q.status === 'Ready').length, color: 'text-green-600 bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl border border-slate-200 text-center ${s.color}`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs font-bold uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                {['Lab ID', 'Patient', 'Test', 'Doctor', 'Priority', 'Time', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono text-[#0f4b80] font-bold">{l.id}</td>
                  <td className="px-5 py-4 text-sm font-semibold">{l.patient}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{l.test}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{l.doctor}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PRIORITY_COLORS[l.priority]}`}>{l.priority}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{l.time}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[l.status]}`}>{l.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    {l.status !== 'Ready' ? (
                      <button onClick={() => markReady(l.id)} className="text-[#0f4b80] hover:underline text-xs font-bold">Mark Ready</button>
                    ) : (
                      <button onClick={() => toast.success(`Downloading ${l.id}`)} className="text-green-600 hover:underline text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">download</span>Report
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
