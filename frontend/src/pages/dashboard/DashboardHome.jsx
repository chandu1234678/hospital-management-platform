import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'
import { useAppointmentStore } from '../../store/appointmentStore.js'
import { MOCK_PRESCRIPTIONS, MOCK_LAB_REPORTS, MOCK_MESSAGES } from '../../data/mockData.js'

export default function DashboardHome() {
  const { user } = useAuthStore()
  const { appointments } = useAppointmentStore()
  const upcoming = appointments.filter(a => a.status === 'upcoming')
  const activeMeds = MOCK_PRESCRIPTIONS.filter(p => p.status === 'active')
  const pendingReports = MOCK_LAB_REPORTS.filter(r => r.status === 'processing')
  const unreadMsgs = MOCK_MESSAGES.filter(m => !m.read)

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}</h2>
          <p className="text-slate-500">Here's a summary of your health records and activity.</p>
        </div>
        <Link to="/book-appointment"
          className="hidden sm:flex items-center gap-2 bg-[#0f4b80] text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm">
          <span className="material-symbols-outlined text-base">add</span>
          New Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: 'event', color: 'text-[#0f4b80] bg-[#0f4b80]/10', label: 'Next Appointment', value: upcoming[0] ? `${upcoming[0].date} ${upcoming[0].time}` : 'None scheduled' },
          { icon: 'pill', color: 'text-green-600 bg-green-500/10', label: 'Active Medications', value: `${activeMeds.length} Prescriptions` },
          { icon: 'description', color: 'text-blue-600 bg-blue-500/10', label: 'Lab Results', value: `${pendingReports.length} Pending Review` },
          { icon: 'mail', color: 'text-amber-600 bg-amber-500/10', label: 'Unread Messages', value: `${unreadMsgs.length} Messages` },
        ].map(s => (
          <div key={s.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <span className="text-sm font-medium text-slate-500">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Appointments */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0f4b80]">calendar_month</span>
                Upcoming Appointments
              </h3>
              <Link to="/dashboard/appointments" className="text-[#0f4b80] text-sm font-semibold hover:underline">View All</Link>
            </div>
            <div className="p-6">
              {upcoming.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-slate-300 text-4xl">event_busy</span>
                  <p className="text-slate-500 mt-2">No upcoming appointments</p>
                  <Link to="/book-appointment" className="text-[#0f4b80] font-bold text-sm hover:underline mt-1 block">Book one now</Link>
                </div>
              ) : upcoming.slice(0, 2).map(appt => (
                <div key={appt.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#0f4b80]/5 border border-[#0f4b80]/10 mb-3 last:mb-0">
                  <div className="w-16 h-16 rounded-lg bg-white flex flex-col items-center justify-center border border-[#0f4b80]/20 shrink-0">
                    <span className="text-[#0f4b80] font-black text-xl">{new Date(appt.date + 'T00:00:00').getDate()}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">{new Date(appt.date + 'T00:00:00').toLocaleString('en', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{appt.doctorName}</h4>
                    <p className="text-sm text-slate-500">{appt.department} • {appt.time}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span>{appt.location}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/dashboard/appointments" className="px-3 py-1.5 bg-[#0f4b80] text-white text-xs font-medium rounded-lg hover:opacity-90">Manage</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Prescriptions */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600">medication</span>
                Recent Prescriptions
              </h3>
              <Link to="/dashboard/prescriptions" className="text-[#0f4b80] text-sm font-semibold hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {activeMeds.slice(0, 2).map(rx => (
                <div key={rx.id} className="p-5 flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-500">pill</span>
                    </div>
                    <div>
                      <p className="font-bold">{rx.medicine} {rx.dosage}</p>
                      <p className="text-sm text-slate-500">{rx.instructions}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                    <p className="text-xs text-slate-400 mt-1">Refills: {rx.refills} left</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="space-y-8">
          {/* Lab Reports */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">lab_panel</span>
                Lab Reports
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_LAB_REPORTS.slice(0, 3).map(r => (
                <Link key={r.id} to="/dashboard/lab-reports"
                  className={`block p-4 border rounded-lg hover:bg-slate-50 cursor-pointer group transition-colors ${r.status === 'processing' ? 'bg-amber-50/50 border-amber-100' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-sm">{r.name}</p>
                    {r.status === 'processing'
                      ? <span className="text-[10px] font-bold text-amber-600 uppercase">Processing</span>
                      : <span className="material-symbols-outlined text-slate-400 group-hover:text-[#0f4b80] transition-colors">download</span>}
                  </div>
                  <p className="text-xs text-slate-500">{r.status === 'processing' ? `Est: ${r.date}` : `Completed: ${r.date}`}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Messages */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">forum</span>
                Messages
              </h3>
              {unreadMsgs.length > 0 && (
                <span className="text-xs font-bold bg-[#0f4b80] text-white px-2 py-0.5 rounded-full">{unreadMsgs.length} New</span>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {MOCK_MESSAGES.slice(0, 2).map(msg => (
                <div key={msg.id} className="p-4 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#0f4b80]/10 text-[#0f4b80] flex items-center justify-center shrink-0 font-bold text-sm">
                    {msg.from.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="text-sm font-bold truncate">{msg.from}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{msg.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
