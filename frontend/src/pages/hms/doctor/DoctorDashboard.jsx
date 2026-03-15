import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { hmsService } from '../../../services/api.js'

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hmsService.getDoctorAppointments()
      .then(setAppointments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appointment_date === today)
  const completed = appointments.filter(a => a.status === 'COMPLETED').length
  const pending = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length

  const stats = [
    { label: "Today's Appointments", value: loading ? '—' : todayAppts.length, icon: 'calendar_today', color: 'bg-[#0f4b80]/10 text-[#0f4b80]' },
    { label: 'Completed', value: loading ? '—' : completed, icon: 'check_circle', color: 'bg-green-100 text-green-600' },
    { label: 'Pending', value: loading ? '—' : pending, icon: 'pending_actions', color: 'bg-amber-100 text-amber-600' },
    { label: 'Total Patients', value: loading ? '—' : appointments.length, icon: 'group', color: 'bg-purple-100 text-purple-600' },
  ]

  const nextAppt = appointments.find(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Clinical Dashboard</h1>
          <p className="text-slate-500 text-sm">
            {loading ? 'Loading...' : `You have ${todayAppts.length} appointment(s) today.`}
          </p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase self-start sm:self-auto">On-Duty</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Next Consultation */}
          {nextAppt && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-[#0f4b80]/5 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0f4b80]">play_circle</span>
                  <span className="font-bold text-[#0f4b80] uppercase text-xs tracking-widest">Next Consultation</span>
                </div>
                <span className="text-slate-500 text-sm">{nextAppt.appointment_date} · {nextAppt.appointment_time}</span>
              </div>
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                  <span className="material-symbols-outlined text-slate-400 text-4xl">person</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{nextAppt.patient}</h3>
                  <p className="text-slate-500 text-sm">{nextAppt.department} · Token #{nextAppt.token_number}</p>
                  {nextAppt.reason && <p className="text-sm text-slate-600 mt-2">{nextAppt.reason}</p>}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button onClick={() => toast.success('Opening prescription pad')}
                      className="flex items-center gap-1 px-4 py-2 bg-[#0f4b80] text-white text-sm font-bold rounded-lg hover:opacity-90">
                      <span className="material-symbols-outlined text-sm">history_edu</span>
                      Write Prescription
                    </button>
                    <button onClick={() => toast.success('Opening lab order form')}
                      className="flex items-center gap-1 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50">
                      <span className="material-symbols-outlined text-sm">lab_profile</span>
                      Order Lab Test
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Today's Queue */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-800">Today's Queue</h4>
              <span className="text-xs text-slate-500">{todayAppts.length} patients</span>
            </div>
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              </div>
            ) : todayAppts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <span className="material-symbols-outlined text-3xl">event_available</span>
                <p className="text-sm mt-1">No appointments today</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todayAppts.map((a, i) => (
                  <div key={a.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#0f4b80]/10 text-[#0f4b80] flex items-center justify-center text-xs font-black shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{a.patient}</p>
                      <p className="text-xs text-slate-500">{a.department} · {a.appointment_time}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      a.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h4 className="font-bold text-slate-800 mb-4">Quick Actions</h4>
            <div className="space-y-2">
              {[
                { icon: 'history_edu', label: 'New Prescription', color: 'text-[#0f4b80]' },
                { icon: 'lab_profile', label: 'Order Lab Test', color: 'text-blue-600' },
                { icon: 'exit_to_app', label: 'Discharge Patient', color: 'text-green-600' },
                { icon: 'clinical_notes', label: 'Add Clinical Notes', color: 'text-purple-600' },
              ].map(action => (
                <button key={action.label} onClick={() => toast.success(`${action.label} opened`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left">
                  <span className={`material-symbols-outlined ${action.color}`}>{action.icon}</span>
                  <span className="text-sm font-medium text-slate-700">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#0f4b80] rounded-xl p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Emergency</p>
            <p className="text-2xl font-black">1066</p>
            <p className="text-white/70 text-xs mt-1">Internal emergency line</p>
          </div>
        </div>
      </div>
    </div>
  )
}
