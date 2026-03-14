import { useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../../components/Modal.jsx'
import { HMS_APPOINTMENTS } from '../../../data/hmsData.js'

const STATUS_COLORS = {
  'In Progress': 'bg-blue-100 text-blue-700',
  'Waiting': 'bg-amber-100 text-amber-700',
  'Scheduled': 'bg-slate-100 text-slate-600',
  'Cancelled': 'bg-red-100 text-red-600',
  'Completed': 'bg-green-100 text-green-700',
}

export default function ReceptionAppointments() {
  const [appointments, setAppointments] = useState(HMS_APPOINTMENTS)
  const [cancelId, setCancelId] = useState(null)

  const handleCancel = () => {
    setAppointments(prev => prev.map(a => a.id === cancelId ? { ...a, status: 'Cancelled' } : a))
    setCancelId(null)
    toast.success('Appointment cancelled.')
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Appointments</h1>
          <p className="text-slate-500 text-sm">Manage today's appointment schedule</p>
        </div>
        <button onClick={() => toast.success('New appointment form opened')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          New Appointment
        </button>
      </div>

      <div className="space-y-3">
        {appointments.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[#0f4b80] font-bold shrink-0">
                {a.patient.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-sm">{a.patient}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                </div>
                <p className="text-xs text-slate-500">{a.doctor} · {a.dept} · {a.time}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => toast.success(`Checking in ${a.patient}`)}
                  className="px-3 py-1.5 bg-[#0f4b80] text-white text-xs font-bold rounded-lg hover:opacity-90">
                  Check In
                </button>
                {a.status !== 'Cancelled' && (
                  <button onClick={() => setCancelId(a.id)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
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
