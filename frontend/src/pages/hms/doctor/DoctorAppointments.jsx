import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { hmsService } from '../../../services/api.js'

const STATUS_COLORS = {
  'SCHEDULED': 'bg-slate-100 text-slate-600',
  'CONFIRMED': 'bg-indigo-100 text-indigo-700',
  'COMPLETED': 'bg-green-100 text-green-700',
  'CANCELLED': 'bg-red-100 text-red-600',
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hmsService.getDoctorAppointments()
      .then(setAppointments)
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }, [])

  const complete = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'COMPLETED' } : a))
    toast.success('Appointment marked as completed')
  }

  if (loading) return (
    <div className="p-8 text-center text-slate-400">
      <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      <p className="mt-2 text-sm">Loading appointments...</p>
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Appointments</h1>
        <p className="text-slate-500 text-sm">Your patient schedule</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-slate-300 text-5xl">event_busy</span>
          <p className="text-slate-500 mt-2">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[#0f4b80] font-bold text-lg shrink-0">
                  {(a.patient || 'P').charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">{a.patient || 'Unknown'}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                  </div>
                  <p className="text-sm text-slate-500">{a.department} · {a.appointment_date} · {a.appointment_time}</p>
                  {a.reason && <p className="text-xs text-slate-400 mt-1">{a.reason}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && (
                    <button onClick={() => complete(a.id)}
                      className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:opacity-90">
                      Complete
                    </button>
                  )}
                  <button onClick={() => toast.success(`Viewing ${a.patient}'s records`)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
