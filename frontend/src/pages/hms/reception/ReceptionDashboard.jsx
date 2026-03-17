import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminService, hmsService } from '../../../services/api.js'
import { HMS_RECENT_ADMISSIONS } from '../../../data/hmsData.js'

const STATUS_COLORS = {
  SCHEDULED:  'bg-slate-100 text-slate-600',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  COMPLETED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-600',
}

export default function ReceptionDashboard() {
  const [stats, setStats] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [pendingBills, setPendingBills] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      adminService.getStats().catch(() => null),
      hmsService.getAppointments().catch(() => []),
      hmsService.getBilling().catch(() => []),
    ]).then(([s, a, bills]) => {
      setStats(s)
      setAppointments(a)
      setPendingBills(bills.filter(b => b.status === 'PENDING').length)
    }).finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appointment_date === today)

  const statCards = [
    { label: "Today's Appointments", value: loading ? '—' : todayAppts.length, icon: 'calendar_today', color: 'bg-blue-50 text-blue-600', link: '/hms/reception/appointments' },
    { label: 'Total Patients', value: loading ? '—' : (stats?.total_patients ?? '—'), icon: 'group', color: 'bg-green-50 text-green-600', link: '/hms/reception/records' },
    { label: 'Available Beds', value: loading ? '—' : (stats ? `${stats.available_beds}/${stats.total_beds}` : '—'), icon: 'bed', color: 'bg-amber-50 text-amber-600', link: null },
    { label: 'Pending Payments', value: loading ? '—' : pendingBills, icon: 'receipt_long', color: 'bg-red-50 text-red-600', link: '/hms/reception/billing' },
  ]

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Reception Dashboard</h1>
          <p className="text-slate-500 text-sm">{loading ? 'Loading...' : `${todayAppts.length} appointment(s) today`}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/hms/reception/registration"
            className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90">
            <span className="material-symbols-outlined text-lg">person_add</span>
            Register Patient
          </Link>
          <Link to="/hms/reception/billing"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:opacity-90">
            <span className="material-symbols-outlined text-lg">payment</span>
            Collect Payment
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label}
            onClick={() => s.link && navigate(s.link)}
            className={`bg-white p-5 rounded-xl border border-[#0f4b80]/10 shadow-sm ${s.link ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <p className="text-slate-500 text-xs font-medium">{s.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h4 className="font-bold text-slate-800 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Register', icon: 'person_add', to: '/hms/reception/registration', color: 'bg-[#0f4b80]/10 text-[#0f4b80]' },
            { label: 'Appointments', icon: 'event', to: '/hms/reception/appointments', color: 'bg-blue-50 text-blue-600' },
            { label: 'Billing', icon: 'receipt_long', to: '/hms/reception/billing', color: 'bg-amber-50 text-amber-600' },
            { label: 'Queue', icon: 'queue', to: '/hms/reception/queue', color: 'bg-green-50 text-green-600' },
            { label: 'Records', icon: 'folder_shared', to: '/hms/reception/records', color: 'bg-violet-50 text-violet-600' },
            { label: 'Discharge', icon: 'exit_to_app', to: '/hms/reception/discharge', color: 'bg-red-50 text-red-600' },
          ].map(a => (
            <Link key={a.label} to={a.to}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color}`}>
                <span className="material-symbols-outlined text-[20px]">{a.icon}</span>
              </div>
              <span className="text-xs font-semibold text-slate-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's appointments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-bold text-slate-800">Today's Appointments</h4>
          <Link to="/hms/reception/appointments" className="text-[#0f4b80] text-xs font-bold hover:underline">View All</Link>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Patient', 'Doctor', 'Dept', 'Time', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAppts.slice(0, 6).map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold">{a.patient}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{a.doctor}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{a.department}</td>
                    <td className="px-5 py-3 text-sm font-medium">{a.appointment_time}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent admissions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h4 className="font-bold text-slate-800">Recent Admissions</h4>
        </div>
        <div className="divide-y divide-slate-100">
          {HMS_RECENT_ADMISSIONS.slice(0, 3).map(p => (
            <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold shrink-0">{p.initials}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-slate-500">{p.room} · {p.doctor}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  p.status === 'Critical' ? 'bg-amber-100 text-amber-700' :
                  p.status === 'Stable' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{p.status}</span>
                <span className="text-xs text-slate-400">{p.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
