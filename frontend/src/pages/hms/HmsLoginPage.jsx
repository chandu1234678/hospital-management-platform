import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import HmsHeader from '../../components/HmsHeader.jsx'
import { authService } from '../../services/api.js'

const schema = z.object({
  email: z.string().min(1, 'Email or ID is required'),
  password: z.string().min(1, 'Password is required'),
})

const ROLE_CONFIG = {
  admin: {
    title: 'Admin Login',
    subtitle: 'Enter your credentials to manage the healthcare portal.',
    badge: 'Admin Access',
    panelTitle: 'Managing Excellence in Healthcare',
    panelDesc: 'Secure access to the integrated management system for administrators.',
    panelIcon: 'security',
    panelFeatures: [
      { icon: 'bar_chart', label: 'Analytics' },
      { icon: 'manage_accounts', label: 'Staff Mgmt' },
      { icon: 'receipt_long', label: 'Billing' },
      { icon: 'inventory_2', label: 'Inventory' },
    ],
    demo: 'admin@deepthihospitals.com / admin123',
    credentials: { email: 'admin@deepthihospitals.com', password: 'admin123' },
    redirect: '/hms/admin/dashboard',
    altLinks: [
      { label: 'Doctor Login', to: '/hms/staff/login', icon: 'medical_services' },
      { label: 'Reception Login', to: '/hms/reception/login', icon: 'desk' },
    ],
  },
  staff: {
    title: 'Doctor Login',
    subtitle: 'Welcome back, healthcare professional. Please enter your credentials.',
    badge: 'Clinical Access',
    panelTitle: 'Patient Coordination Hub',
    panelDesc: 'Centralized platform for clinical management, prescriptions, and patient care.',
    panelIcon: 'stethoscope',
    panelFeatures: [
      { icon: 'calendar_month', label: 'Schedules' },
      { icon: 'person_search', label: 'Patients' },
      { icon: 'medication', label: 'Prescriptions' },
      { icon: 'lab_profile', label: 'Lab Reports' },
    ],
    demo: 'rajesh@deepthi.com / doctor123',
    credentials: { email: 'rajesh@deepthi.com', password: 'doctor123' },
    redirect: '/hms/doctor/dashboard',
    altLinks: [
      { label: 'Admin Login', to: '/hms/admin/login', icon: 'security' },
      { label: 'Back to Portal', to: '/hms', icon: 'home' },
    ],
  },
  reception: {
    title: 'Reception Login',
    subtitle: 'Access the reception panel to manage patient registrations and appointments.',
    badge: 'Reception Access',
    panelTitle: 'Patient Coordination Hub',
    panelDesc: 'Centralized platform for admissions, scheduling, and patient flow management.',
    panelIcon: 'desk',
    panelFeatures: [
      { icon: 'calendar_month', label: 'Schedules' },
      { icon: 'person_search', label: 'Patient Info' },
      { icon: 'payments', label: 'Billing' },
      { icon: 'how_to_reg', label: 'Check-in' },
    ],
    demo: 'reception@deepthihospitals.com / admin123',
    credentials: { email: 'reception@deepthihospitals.com', password: 'admin123' },
    redirect: '/hms/reception/dashboard',
    altLinks: [
      { label: 'Staff Login', to: '/hms/staff/login', icon: 'medical_services' },
      { label: 'Back to Portal', to: '/hms', icon: 'home' },
    ],
  },
}

export default function HmsLoginPage({ role = 'admin' }) {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const config = ROLE_CONFIG[role]

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const fillDemo = () => {
    setValue('email', config.credentials.email)
    setValue('password', config.credentials.password)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await authService.login(data.email.trim(), data.password.trim())
      localStorage.setItem('hms-token', user.token)
      if (user.refresh_token) localStorage.setItem('hms-refresh-token', user.refresh_token)
      localStorage.setItem('hms-user', JSON.stringify(user))
      toast.success('Welcome back!')
      navigate(config.redirect)
    } catch (err) {
      toast.error(err.message || `Invalid credentials. Demo: ${config.demo}`)
    }
    setLoading(false)
  }

  return (
    <div className="h-screen bg-[#f6f7f8] flex flex-col overflow-hidden">
      <HmsHeader
        rightSlot={
          <div className="flex items-center gap-3">
            <Link to="/hms" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#0f4b80]/10 text-[#0f4b80] rounded-lg text-sm font-semibold hover:bg-[#0f4b80]/20 transition-colors">
              Back to Portal
            </Link>
            <a href="mailto:it@deepthihospitals.com"
              className="bg-[#0f4b80] hover:bg-[#0f4b80]/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm">
              Contact Support
            </a>
          </div>
        }
      />

      <main className="flex-1 flex items-center justify-center p-4 md:p-6 min-h-0">
        <div className="max-w-[1000px] w-full bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200/60 flex flex-col md:flex-row h-full max-h-[calc(100vh-5rem)]">

          {/* ── Form Side ── */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center overflow-y-auto">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f4b80]/5 text-[#0f4b80] text-[10px] font-bold uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f4b80] animate-pulse" />
                {config.badge}
              </div>
              <h1 className="text-slate-900 text-2xl font-black leading-tight tracking-tight mb-2">{config.title}</h1>
              <p className="text-slate-500 text-sm font-medium">{config.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 text-sm font-bold ml-1">
                  {role === 'admin' ? 'Admin ID or Email' : 'Email or Employee ID'}
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0f4b80] transition-colors text-xl">account_circle</span>
                  <input {...register('email')} type="text"
                    placeholder={config.credentials.email}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-4 focus:ring-[#0f4b80]/10 focus:border-[#0f4b80] outline-none transition-all text-sm font-medium placeholder:text-slate-400" />
                </div>
                {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-slate-700 text-sm font-bold">Password</label>
                  <Link to={`/hms/${role}/forgot-password`} className="text-[#0f4b80] text-xs font-bold hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0f4b80] transition-colors text-xl">lock</span>
                  <input {...register('password')} type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-4 focus:ring-[#0f4b80]/10 focus:border-[#0f4b80] outline-none transition-all text-sm font-medium placeholder:text-slate-400" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined text-xl">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center gap-3 ml-1">
                <input type="checkbox" id="remember"
                  className="w-4 h-4 rounded border-slate-300 text-[#0f4b80] focus:ring-[#0f4b80] cursor-pointer" />
                <label htmlFor="remember" className="text-sm text-slate-600 font-medium cursor-pointer">Keep me logged in</label>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#0f4b80] hover:bg-[#0f4b80]/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-[#0f4b80]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                {loading && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
                <span>{loading ? 'Signing in...' : `Login to ${config.title.split(' ')[0]} Dashboard`}</span>
                {!loading && <span className="material-symbols-outlined text-lg">login</span>}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col items-center gap-3">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Other Access Points</p>
              <div className="flex flex-wrap justify-center gap-2">
                {config.altLinks.map(l => (
                  <Link key={l.to} to={l.to}
                    className="flex items-center gap-1.5 text-slate-600 font-bold text-xs bg-slate-100 px-4 py-2 rounded-full hover:bg-[#0f4b80] hover:text-white transition-all border border-slate-200">
                    <span className="material-symbols-outlined text-base">{l.icon}</span>
                    {l.label}
                  </Link>
                ))}
              </div>
              <button type="button" onClick={fillDemo}
                className="text-xs text-[#0f4b80] font-semibold hover:underline">
                Use demo credentials
              </button>
            </div>
          </div>

          {/* ── Visual Side ── */}
          <div className="hidden md:flex w-1/2 relative bg-[#0f4b80] overflow-hidden flex-col items-center justify-center p-10 text-center text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f4b80] via-[#0f4b80] to-[#08345a]" />
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4)_0%,transparent_60%)]" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-8 w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 rotate-3">
                <span className="material-symbols-outlined text-4xl">{config.panelIcon}</span>
              </div>
              <h2 className="text-2xl font-black mb-3 leading-tight">{config.panelTitle}</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs font-medium">{config.panelDesc}</p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                {config.panelFeatures.map(f => (
                  <div key={f.label} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col items-center hover:-translate-y-1 transition-transform">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined text-xl text-white">{f.icon}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.15em] font-black text-white/90">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-8 right-8 opacity-5 scale-150">
              <span className="material-symbols-outlined text-[160px]">health_and_safety</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
