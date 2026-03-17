import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { adminService } from '../../../services/api.js'
import { HMS_RECENT_ADMISSIONS, HMS_ALERTS } from '../../../data/hmsData.js'

const STATUS_COLORS = {
  Critical:   'bg-red-100 text-red-700',
  Stable:     'bg-emerald-100 text-emerald-700',
  Recovering: 'bg-blue-100 text-blue-700',
}

const ALERT_STYLES = {
  red:   { bg: 'bg-red-50 border-red-400',   icon: 'text-red-500',   title: 'text-red-800',   desc: 'text-red-600',   time: 'text-red-400' },
  amber: { bg: 'bg-amber-50 border-amber-400', icon: 'text-amber-500', title: 'text-amber-800', desc: 'text-amber-600', time: 'text-amber-400' },
  blue:  { bg: 'bg-blue-50 border-blue-400',  icon: 'text-blue-500',  title: 'text-blue-800',  desc: 'text-blue-600',  time: 'text-blue-400' },
}

// Static visit data — Mon–Sun
const VISIT_DATA_7 = [
  { day: 'Mon', visits: 42 }, { day: 'Tue', visits: 68 },
  { day: 'Wed', visits: 55 }, { day: 'Thu', visits: 28 },
  { day: 'Fri', visits: 61 }, { day: 'Sat', visits: 47 },
  { day: 'Sun', visits: 74 },
]
const VISIT_DATA_30 = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`, visits: Math.floor(25 + Math.random() * 60),
}))

// Revenue bar data
const REVENUE_DATA = [
  { time: '08:00', opd: 12400, lab: 8200 },
  { time: '10:00', opd: 18600, lab: 11400 },
  { time: '12:00', opd: 22100, lab: 9800 },
  { time: '14:00', opd: 31500, lab: 7600 },
  { time: '16:00', opd: 19200, lab: 13100 },
  { time: '18:00', opd: 14800, lab: 16400 },
  { time: '20:00', opd: 9600,  lab: 11200 },
]

const fmt = (v) => `₹${(v / 1000).toFixed(0)}k`

export default function AdminDashboard() {
  const [alerts, setAlerts]       = useState(HMS_ALERTS)
  const [visitPeriod, setVisitPeriod] = useState('7')
  const [dbStats, setDbStats]     = useState(null)

  useEffect(() => {
    adminService.getStats().then(setDbStats).catch(() => {})
  }, [])

  const stats = [
    {
      label: 'Total Patients',
      value: dbStats ? dbStats.total_patients.toLocaleString() : '—',
      icon: 'group',
      color: 'text-[#0f4b80] bg-[#0f4b80]/10',
      sub: 'Registered patients',
    },
    {
      label: "Today's Appointments",
      value: dbStats ? dbStats.today_appointments : '—',
      icon: 'event_note',
      color: 'text-blue-600 bg-blue-100',
      sub: 'Scheduled today',
    },
    {
      label: 'Doctors',
      value: dbStats ? dbStats.total_doctors : '—',
      icon: 'medical_information',
      color: 'text-indigo-600 bg-indigo-100',
      sub: 'Active doctors',
    },
    {
      label: 'Revenue (Paid)',
      value: dbStats ? `₹${Number(dbStats.total_revenue).toLocaleString('en-IN')}` : '—',
      icon: 'payments',
      color: 'text-emerald-600 bg-emerald-100',
      sub: 'Total collected',
    },
    {
      label: 'Bed Occupancy',
      value: dbStats ? `${dbStats.total_beds - dbStats.available_beds}/${dbStats.total_beds}` : '—',
      icon: 'bed',
      color: 'text-amber-600 bg-amber-100',
      sub: `${dbStats?.available_beds ?? '—'} available`,
    },
  ]

  const visitData = visitPeriod === '7' ? VISIT_DATA_7 : VISIT_DATA_30

  return (
    <div className="p-4 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/hms/admin/appointments"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0f4b80] text-white rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          New Appointment
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-xl">{s.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 leading-tight">{s.value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{s.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Daily Patient Visits */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="font-black text-slate-900 text-sm">Daily Patient Visits</h4>
              <p className="text-xs text-slate-400 mt-0.5">Outpatient visits over time</p>
            </div>
            <select value={visitPeriod} onChange={e => setVisitPeriod(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none bg-white text-slate-600 font-medium">
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={visitData
} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0f4b80" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0f4b80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
                formatter={v => [v, 'Visits']}
              />
              <Area type="monotone" dataKey="visits" stroke="#0f4b80" strokeWidth={2.5}
                fill="url(#visitGrad)" dot={false} activeDot={{ r: 5, fill: '#0f4b80', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trends */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="font-black text-slate-900 text-sm">Revenue Trends</h4>
              <p className="text-xs text-slate-400 mt-0.5">OPD vs Lab collections today</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0f4b80] inline-block" />OPD
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#93c5fd] inline-block" />Lab
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REVENUE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
                formatter={(v, name) => [`₹${Number(v).toLocaleString('en-IN')}`, name.toUpperCase()]}
              />
              <Bar dataKey="opd" name="opd" fill="#0f4b80" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lab" name="lab" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Admissions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-black text-slate-900 text-sm">Recent Admissions</h4>
            <Link to="/hms/admin/patients" className="text-[#0f4b80] text-xs font-bold hover:underline flex items-center gap-1">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Patient', 'Room', 'Status', 'Doctor', 'Admitted'].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {HMS_RECENT_ADMISSIONS.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0f4b80]/10 text-[#0f4b80] flex items-center justify-center text-[10px] font-black shrink-0">
                          {p.initials}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{p.room}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[p.status] || 'bg-slate-100 text-slate-600'}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{p.doctor}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{p.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-black text-slate-900 text-sm">System Alerts</h4>
            {alerts.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{alerts.length} New</span>
            )}
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-64">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-slate-300 text-4xl">check_circle</span>
                <p className="text-slate-400 text-sm mt-2">No active alerts</p>
              </div>
            ) : alerts.map((a, i) => {
              const s = ALERT_STYLES[a.type]
              return (
                <div key={i} className={`flex gap-3 p-3 rounded-xl border-l-4 ${s.bg}`}>
                  <span className={`material-symbols-outlined text-xl shrink-0 ${s.icon}`}>{a.icon}</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-black uppercase tracking-wide ${s.title}`}>{a.title}</p>
                    <p className={`text-xs mt-0.5 leading-relaxed ${s.desc}`}>{a.desc}</p>
                    <p className={`text-[10px] mt-1 font-medium ${s.time}`}>{a.time}</p>
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
