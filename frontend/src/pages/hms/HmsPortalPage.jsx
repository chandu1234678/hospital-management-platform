import { Link } from 'react-router-dom'
import Logo from '../../components/Logo.jsx'

const PORTALS = [
  {
    role: 'Admin',
    to: '/hms/admin/login',
    icon: 'admin_panel_settings',
    color: 'bg-[#0F4C81]',
    lightColor: 'bg-[#0F4C81]/10 text-[#0F4C81]',
    border: 'border-[#0F4C81]/20 hover:border-[#0F4C81]',
    desc: 'Full system access — manage patients, staff, billing, inventory and hospital operations.',
    features: ['Patient & Doctor Management', 'Billing & Inventory', 'Reports & Analytics', 'System Settings'],
  },
  {
    role: 'Doctor',
    to: '/hms/staff/login',
    icon: 'stethoscope',
    color: 'bg-emerald-600',
    lightColor: 'bg-emerald-50 text-emerald-700',
    border: 'border-emerald-200 hover:border-emerald-500',
    desc: 'Clinical portal — manage appointments, patients, prescriptions and lab reports.',
    features: ['Appointment Schedule', 'Patient Records', 'Prescriptions', 'Lab Reports'],
  },
  {
    role: 'Reception',
    to: '/hms/reception/login',
    icon: 'support_agent',
    color: 'bg-violet-600',
    lightColor: 'bg-violet-50 text-violet-700',
    border: 'border-violet-200 hover:border-violet-500',
    desc: 'Front desk portal — handle registrations, queue, appointments and billing.',
    features: ['Patient Registration', 'Queue Management', 'Appointments', 'Billing & Discharge'],
  },
]

export default function HmsPortalPage() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex items-center justify-between">
        <Link to="/">
          <Logo height={36} />
        </Link>
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0F4C81] transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Website
        </Link>
      </header>

      {/* Hero */}
      <div className="bg-[#0F4C81] text-white py-14 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold uppercase tracking-widest mb-4">
          <span className="material-symbols-outlined text-sm">lock</span>
          Staff Access Only
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-3">HMS Staff Portal</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Select your role to access the Deepthi Hospitals Management System. Use your assigned credentials to log in.
        </p>
      </div>

      {/* Portal cards */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {PORTALS.map(p => (
            <div key={p.role} className={`bg-white rounded-2xl border-2 ${p.border} p-6 flex flex-col transition-all duration-200 hover:shadow-lg`}>
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${p.lightColor} flex items-center justify-center mb-5`}>
                <span className="material-symbols-outlined text-3xl">{p.icon}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-black text-slate-900 mb-2">{p.role} Portal</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">{p.desc}</p>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-[16px] text-green-500">check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to={p.to}
                className={`${p.color} text-white font-bold py-3 rounded-xl text-sm text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}>
                Login as {p.role}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Info strip */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined">info</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Need access?</p>
              <p className="text-slate-500 text-xs">Contact your system administrator to get your login credentials.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              All systems operational
            </div>
            <Link to="/contact" className="text-[#0F4C81] font-semibold hover:underline">Contact IT Support</Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400">
        © 2026 Deepthi Hospitals Group · Secured Management Portal v4.2.0
      </footer>
    </div>
  )
}
