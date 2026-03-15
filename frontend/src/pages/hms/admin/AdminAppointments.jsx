import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../../components/Modal.jsx'
import { hmsService } from '../../../services/api.js'

const STATUS_COLORS = {
  'IN PROGRESS': 'bg-blue-100 text-blue-700',
  'WAITING': 'bg-amber-100 text-amber-700',
  'SCHEDULED': 'bg-slate-100 text-slate-600',
  'CANCELLED': 'bg-red-100 text-red-600',
  'COMPLETED': 'bg-green-100 text-green-700',
  'CONFIRMED': 'bg-indigo-100 text-indigo-700',
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cancelId, setCancelId] = useState(null)

  useEffect(() => {
    hmsService.getAppointments()
      .then(setAppointments)
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status.toLowerCase() === filter)

  const handleCancel = () => {
    setAppointments(prev => prev.map(a => a.id === cancelId ? { ...a, status: 'CANCELLED' } : a))
    setCancelId(null)
    toast.success('Appointment cancelled.')
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Appointment Management</h1>
          <p className="text-slate-500 text-sm">All appointments — {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => toast.success('New appointment form opened')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          New Appointment
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'scheduled', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === f ? 'bg-[#0f4b80] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0f4b80]'
            }`}>{f}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <p className="mt-2 text-sm">Loading appointments...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['ID', 'Patient', 'Doctor', 'Department', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-[#0f4b80] font-bold">#{a.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                          {(a.patient || 'P').charAt(0)}
                        </div>
                        <span className="text-sm font-semibold">{a.patient || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{a.doctor || 'N/A'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{a.department}</td>
                    <td className="px-5 py-4 text-sm font-medium">{a.appointment_date}</td>
                    <td className="px-5 py-4 text-sm">{a.appointment_time}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[a.status?.toUpperCase()] || 'bg-slate-100 text-slate-600'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => toast.success(`Appointment #${a.id} — ${a.reason || 'No reason'}`)}
                          className="text-[#0f4b80] hover:underline text-xs font-bold">View</button>
                        {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                          <button onClick={() => setCancelId(a.id)}
                            className="text-red-500 hover:underline text-xs font-bold">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-slate-300 text-4xl">event_busy</span>
                <p className="text-slate-500 mt-2">No appointments found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Appointment">
        <p className="text-slate-600 mb-6">Are you sure you want to cancel this appointment?</p>
        <div className="flex gap-3">
          <button onClick={handleCancel} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-lg hover:opacity-90">Yes, Cancel</button>
          <button onClick={() => setCancelId(null)} className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50">Keep It</button>
        </div>
      </Modal>
    </div>
  )
}
