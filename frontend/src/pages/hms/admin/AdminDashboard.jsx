import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HMS_STATS, HMS_RECENT_ADMISSIONS, HMS_ALERTS } from '../../../data/hmsData.js'

const STATUS_COLORS = {
  Critical: 'bg-amber-100 text-amber-700',
  Stable: 'bg-emerald-100 text-emerald-700',
  Recovering: 'bg-blue-100 text-blue-700',
}

const ALERT_STYLES = {
  red: { bg: 'bg-red-50 border-red-500', title: 'text-red-800', desc: 'text-red-700', time: 'text-red-500' },
  amber: { bg: 'bg-amber-50 border-amber-500', title: 'text-amber-800', desc: 'text-amber-700', time: 'text-amber-500' },
  blue: { bg: 'bg-blue-50 border-blue-500', title: 'text-blue-800', desc: 'text-blue-700', time: 'text-blue-500' },
}

const ICON_COLORS = {
  red: 'text-red-600', amber: 'text-amber-600', blue: 'text-blue-600',
}

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState(HMS_ALERTS)
  const [chartPeriod, setChartPeriod] = useState('Last 7 Days')

  const stats = [
    { label: 'Total Patients', value: HMS_STATS.totalPatients.toLocaleString(), icon: 'group', color: 'bg-[#0f4b80]/10 text-[#0f4b80]', trend: '+5.2%', trendLabel: 'from last month', up: true },
    { label: 'Appointments', value: HMS_STATS.appointmentsToday, icon: 'event_note', color: 'bg-blue-100 text-blue-600', trend: '+12%', trendLabel: 'expected today', up: true },
    { label: 'Doctors Available', value: HMS_STATS.doctorsAvailable, icon: 'medical_information', color: 'bg-indigo-100 text-indigo-600', trend: '3 On leave', trendLabel: 'today', up: null },
    { label: 'Revenue Today', value: HMS_STATS.revenueToday, icon: 'payments', color: 'bg-emerald-100 text-emerald-600', trend: '-2.4%', trendLabel: 'vs yesterday', up: false },
    { label: 'Bed Occupancy', value: HMS_STATS.bedOccupancy, icon: 'bed', color: 'bg-amber-100 text-amber-600', trend: '+8%', trendLabel: 'High demand', up: true },
  ]

  const chartBars = [
    { label: '08:00', opd: 30, lab: 70 },
    { label: '10:00', opd: 40, lab: 60 },
    { label: '12:00', opd: 50, lab: 50 },
    { label: '14:00', opd: 80, lab: 20 },
    { label: '16:00', opd: 40, lab: 60 },
    { label: '18:00', opd: 30, lab: 70 },
    { label: '20:00', opd: 50, lab: 50 },
  ]

  const linePoints = [80, 30, 50, 90, 40, 70, 20]

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Overview of hospital operations — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/hms/admin/appointments"
            className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold shadow-md hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-lg">add</span>
            New Appointment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{s.label}</p>
                <h3 className="text-2xl font-bold mt-1">{s.value}</h3>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-xs font-bold ${s.up === true ? 'text-emerald-500' : s.up === false ? 'text-red-500' : 'text-slate-400'}`}>{s.trend}</span>
              <span className="text-slate-400 text-[10px]">{s.trendLabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800">Daily Patient Visits</h4>
            <select value={chartPeriod} onChange={e => setChartPeriod(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg py-1 px-2 focus:ring-[#0f4b80] outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-48">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <polyline fill="none" stroke="#0f4b80" strokeWidth="2"
                points={linePoints.map((y, i) => `${(i / 6) * 100},${y}`).join(' ')} />
              <path fill="rgba(15,75,128,0.1)"
                d={`M0,${linePoints[0]} ${linePoints.map((y, i) => `L${(i / 6) * 100},${y}`).join(' ')} L100,100 L0,100 Z`} />
            </svg>
          </div>
          <div className="flex justify-between text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-100">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800">Revenue Trends</h4>
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-[#0f4b80] inline-block" /> OPD
              </span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Lab
              </span>
            </div>
          </div>
          <div className="h-48 flex items-end justify-between gap-2 px-2">
            {chartBars.map(b => (
              <div key={b.label} className="flex-1 flex flex-col gap-1">
                <div className="relative bg-slate-100 rounded-t-sm flex-1 min-h-[40px] flex flex-col justify-end">
                  <div className="w-full bg-[#0f4b80]/30 rounded-t-sm" style={{ height: `${b.lab}%` }} />
                  <div className="w-full bg-[#0f4b80] rounded-t-sm" style={{ height: `${b.opd}%` }} />
                </div>
                <p className="text-[10px] text-center font-bold text-slate-400 uppercase">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Admissions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-bold text-slate-800">Recent Admissions</h4>
            <Link to="/hms/admin/patients" className="text-[#0f4b80] text-xs font-bold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Patient', 'Room', 'Status', 'Doctor', 'Admitted'].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {HMS_RECENT_ADMISSIONS.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">{p.initials}</div>
                        <span className="text-sm font-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium">{p.room}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[p.status] || 'bg-slate-100 text-slate-600'}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{p.doctor}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{p.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-bold text-slate-800">System Alerts</h4>
            {alerts.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{alerts.length} New</span>
            )}
          </div>
          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-72">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-slate-300 text-4xl">check_circle</span>
                <p className="text-slate-500 text-sm mt-2">No active alerts</p>
              </div>
            ) : alerts.map((a, i) => {
              const s = ALERT_STYLES[a.type]
              return (
                <div key={i} className={`flex gap-3 p-3 rounded-lg border-l-4 ${s.bg}`}>
                  <span className={`material-symbols-outlined ${ICON_COLORS[a.type]}`}>{a.icon}</span>
                  <div>
                    <p className={`text-xs font-bold uppercase ${s.title}`}>{a.title}</p>
                    <p className={`text-xs mt-0.5 ${s.desc}`}>{a.desc}</p>
                    <p className={`text-[10px] mt-1 ${s.time}`}>{a.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="p-4 border-t border-slate-100">
            <button onClick={() => setAlerts([])}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors">
              Clear All Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
