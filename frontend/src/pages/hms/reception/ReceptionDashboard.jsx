import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { HMS_STATS, HMS_APPOINTMENTS, HMS_RECENT_ADMISSIONS } from '../../../data/hmsData.js'

export default function ReceptionDashboard() {
  const stats = [
    { label: 'Walk-in Queue', value: HMS_STATS.walkInQueue, icon: 'queue', color: 'bg-amber-50 text-amber-600', badge: '+5 today', badgeColor: 'bg-emerald-50 text-emerald-600' },
    { label: "Today's Admissions", value: HMS_STATS.admissionsToday, icon: 'ward', color: 'bg-blue-50 text-blue-600', badge: '-2% vs avg', badgeColor: 'bg-rose-50 text-rose-600' },
    { label: 'Pending Discharge', value: HMS_STATS.pendingDischarge, icon: 'exit_to_app', color: 'bg-green-50 text-green-600', badge: 'Today', badgeColor: 'bg-slate-100 text-slate-500' },
  ]

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Reception Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back, Sarah. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.success('Printing daily stats...')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <span className="material-symbols-outlined text-lg">print</span>
            <span className="hidden sm:inline">Print Stats</span>
          </button>
          <Link to="/hms/reception/appointments"
            className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90">
            <span className="material-symbols-outlined text-lg">add</span>
            New Appointment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-6 rounded-xl border border-[#0f4b80]/10 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${s.color}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badgeColor}`}>{s.badge}</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{s.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-bold text-slate-800">Today's Appointments</h4>
          <Link to="/hms/reception/appointments" className="text-[#0f4b80] text-xs font-bold hover:underline">View All</Link>
        </div>
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
              {HMS_APPOINTMENTS.slice(0, 4).map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-semibold">{a.patient}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{a.doctor}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{a.dept}</td>
                  <td className="px-5 py-3 text-sm font-medium">{a.time}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      a.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      a.status === 'Waiting' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
