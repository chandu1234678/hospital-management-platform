import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Logo from '../../components/Logo.jsx'
import BackButton from '../../components/BackButton.jsx'
import { authService } from '../../services/api.js'

const schema = z.object({
  email: z.string().min(1, 'Email or ID is required'),
  password: z.string().min(1, 'Password is required'),
})

const ROLE_CONFIG = {
  admin: {
    title: 'Admin Login — HMS',
    subtitle: 'Access the administrative control center for Deepthi Hospitals Management System.',
    icon: 'admin_panel_settings',
    color: 'bg-[#0f4b80]',
    demo: 'admin@deepthihospitals.com / admin123',
    credentials: { email: 'admin@deepthihospitals.com', password: 'admin123' },
    redirect: '/hms/admin/dashboard',
    altLink: { label: 'Staff Login', to: '/hms/staff/login' },
  },
  staff: {
    title: 'Staff Login',
    subtitle: 'Welcome back, healthcare professional. Please enter your credentials.',
    icon: 'badge',
    color: 'bg-emerald-600',
    demo: 'staff@deepthihospitals.com / staff123',
    credentials: { email: 'staff@deepthihospitals.com', password: 'staff123' },
    redirect: '/hms/doctor/dashboard',
    altLink: { label: 'Admin Login', to: '/hms/admin/login' },
  },
  reception: {
    title: 'Reception Login',
    subtitle: 'Access the reception panel to manage patient registrations and appointments.',
    icon: 'support_agent',
    color: 'bg-violet-600',
    demo: 'reception@deepthihospitals.com / reception123',
    credentials: { email: 'reception@deepthihospitals.com', password: 'reception123' },
    redirect: '/hms/reception/dashboard',
    altLink: { label: 'Admin Login', to: '/hms/admin/login' },
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
      // Store token for HMS portal use
      localStorage.setItem('hms-token', user.token)
      localStorage.setItem('hms-user', JSON.stringify(user))
      toast.success(`Welcome to ${config.title}!`)
      navigate(config.redirect)
    } catch (err) {
      toast.error(err.message || `Invalid credentials. Demo: ${config.demo}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f8]">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 md:px-10 py-4">
        <div className="flex items-center gap-3">
          <Logo height={36} />
        </div>
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-slate-500 text-sm hover:text-[#0f4b80]">Support</a>
            <Link to="/emergency" className="text-slate-500 text-sm hover:text-[#0f4b80]">Emergency</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[480px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl ${config.color} text-white flex items-center justify-center`}>
                <span className="material-symbols-outlined text-2xl">{config.icon}</span>
              </div>
              <div>
                <h1 className="text-slate-900 text-2xl font-black leading-tight">{config.title}</h1>
                <p className="text-slate-500 text-xs mt-0.5">{config.subtitle}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-slate-800 text-sm font-semibold">
                  {role === 'admin' ? 'Admin ID or Email' : 'Email or Employee ID'}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                  <input {...register('email')} type="text"
                    placeholder={config.credentials.email}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none transition-all placeholder:text-slate-400" />
                </div>
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-slate-800 text-sm font-semibold">Password</label>
                  <Link to={`/hms/${role}/forgot-password`} className="text-xs text-[#0f4b80] font-medium hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                  <input {...register('password')} type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none transition-all placeholder:text-slate-400" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className={`w-full ${config.color} hover:opacity-90 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60`}>
                {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : null}
                {loading ? 'Signing in...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                {!loading && <span className="material-symbols-outlined">login</span>}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
              <p className="text-xs text-slate-400">Demo: <span className="font-mono font-bold text-slate-600">{config.demo}</span></p>
              <button type="button" onClick={fillDemo}
                className="text-xs text-[#0f4b80] underline hover:no-underline font-medium">
                Use demo credentials
              </button>
              <Link to={config.altLink.to} className="inline-flex items-center gap-2 text-[#0f4b80] font-semibold text-sm hover:gap-3 transition-all">
                {config.altLink.label}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          </div>
          <div className="bg-[#0f4b80]/5 p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Secured Management Portal v4.2.0</p>
          </div>
        </div>
      </main>

      <footer className="px-6 py-5 bg-white border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-slate-500">System Status: All systems operational</span>
          </div>
          <p className="text-xs text-slate-400">© 2024 Deepthi Hospitals Group</p>
        </div>
      </footer>
    </div>
  )
}
