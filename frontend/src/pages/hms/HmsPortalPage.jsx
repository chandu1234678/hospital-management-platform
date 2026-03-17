import { Link } from 'react-router-dom'
import HmsHeader from '../../components/HmsHeader.jsx'

const PORTALS = [
  {
    role: 'Admin',
    to: '/hms/admin/login',
    icon: 'security',
    desc: 'Full system access and configuration.',
    features: ['Staff & Department Management', 'Security & Access Protocols', 'System Audit Logs'],
  },
  {
    role: 'Doctor',
    to: '/hms/staff/login',
    icon: 'medical_services',
    desc: 'Clinical management and patient records.',
    features: ['Patient EHR Access', 'E-Prescription Management', 'Lab & Diagnostic Results'],
  },
  {
    role: 'Reception',
    to: '/hms/reception/login',
    icon: 'person_pin',
    desc: 'Front-desk and appointment scheduling.',
    features: ['Patient Check-in/Check-out', 'Appointment Scheduling', 'Billing & Registration'],
  },
]

export default function HmsPortalPage() {
  return (
    <div className="min-h-screen bg-[#f6f7f8] flex flex-col">
      <HmsHeader />

      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-900 py-16 sm:py-24">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(15,75,128,0.95) 0%, rgba(10,50,85,0.85) 100%)' }} />
          <img
            alt="Hospital interior"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1600&h=600&fit=crop"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6">HMS Staff Portal</h1>
          <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Select your role to access the Deepthi Hospitals Management System. Use your assigned credentials to log in.
          </p>
        </div>
      </div>

      {/* Portal cards — overlap hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-16 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PORTALS.map(p => (
            <div key={p.role}
              className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100 flex flex-col hover:shadow-2xl hover:-translate-y-2 hover:border-[#0f4b80] duration-300 transition-all">
              <div className="p-8 flex-1">
                <div className="w-14 h-14 bg-[#0f4b80]/10 rounded-xl flex items-center justify-center mb-6 text-[#0f4b80]">
                  <span className="material-symbols-outlined text-4xl">{p.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{p.role} Portal</h3>
                <p className="text-slate-500 font-medium mb-6">{p.desc}</p>
                <ul className="space-y-4 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 shrink-0">check_circle</span>
                      <span className="text-slate-600 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 pt-0 mt-auto">
                <Link to={p.to}
                  className="w-full bg-[#0f4b80] hover:bg-[#0f4b80]/90 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 group transition-all">
                  Login as {p.role}
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div className="mt-12 bg-slate-100 border border-slate-200 rounded-lg px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <span className="material-symbols-outlined text-lg">info</span>
            <span>Need access? Contact the IT Department at{' '}
              <a href="mailto:it@deepthihospitals.com" className="text-[#0f4b80] font-semibold hover:underline">
                it@deepthihospitals.com
              </a>
            </span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            All systems operational
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">© 2024 Deepthi Hospitals Management System. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-slate-500 hover:text-[#0f4b80] text-sm transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-500 hover:text-[#0f4b80] text-sm transition-colors">Terms of Use</Link>
            <a href="mailto:it@deepthihospitals.com" className="text-slate-500 hover:text-[#0f4b80] text-sm transition-colors">Support Portal</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
