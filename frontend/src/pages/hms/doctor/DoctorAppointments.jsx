import { useState } from 'react'
import toast from 'react-hot-toast'
import { HMS_APPOINTMENTS } from '../../../data/hmsData.js'

const STATUS_COLORS = {
  'In Progress': 'bg-blue-100 text-blue-700',
  'Waiting': 'bg-amber-100 text-amber-700',
  'Scheduled': 'bg-slate-100 text-slate-600',
  'Cancelled': 'bg-red-100 text-red-600',
  'Completed': 'bg-green-100 text-green-700',
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState(HMS_APPOINTMENTS)

  const complete = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Completed' } : a))
    toast.success('Appointment marked as completed')
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Appointments</h1>
        <p className="text-slate-500 text-sm">Today's patient schedule</p>
      </div>

      <div className="space-y-4">
        {appointments.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[#0f4b80] font-bold text-lg shrink-0">
                {a.patient.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-900">{a.patient}</h4>
                  <span className="text-xs text-slate-400">{a.age}y</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                </div>
                <p className="text-sm text-slate-500">{a.dept} · {a.time} · {a.type}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {a.status !== 'Completed' && a.status !== 'Cancelled' && (
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
    </div>
  )
}
