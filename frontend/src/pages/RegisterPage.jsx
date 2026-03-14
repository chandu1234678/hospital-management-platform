import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import BackButton from '../components/BackButton.jsx'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { authService } from '../services/api.js'
import { useAuthStore } from '../store/authStore.js'
import Logo from '../components/Logo.jsx'

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await authService.register(data)
      login(user)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f8]">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
        <Link to="/" className="flex items-center">
          <Logo height={34} />
        </Link>
        <div className="flex items-center gap-4">
          <BackButton />
          <Link to="/login" className="text-sm font-semibold text-[#0f4b80] hover:underline">Sign In</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full">
        <div className="flex-1 px-6 py-10 lg:px-16 lg:py-16">
          <div className="max-w-md mx-auto lg:mx-0">
            <h1 className="text-slate-900 text-4xl font-black mb-2">Create Account</h1>
            <p className="text-slate-500 text-lg mb-8">Join our healthcare community today for better care.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {[
                { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
                { name: 'email', label: 'Email Address', type: 'email', placeholder: 'name@example.com' },
                { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' },
              ].map(f => (
                <div key={f.name} className="flex flex-col gap-2">
                  <label className="text-slate-900 text-sm font-semibold">{f.label}</label>
                  <input {...register(f.name)} type={f.type} placeholder={f.placeholder}
                    className="w-full rounded-xl border border-slate-200 bg-white h-14 px-4 text-slate-900 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none placeholder:text-slate-400" />
                  {errors[f.name] && <p className="text-red-500 text-xs">{errors[f.name].message}</p>}
                </div>
              ))}

              <div className="flex flex-col gap-2">
                <label className="text-slate-900 text-sm font-semibold">Password</label>
                <div className="relative">
                  <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Create a strong password"
                    className="w-full rounded-xl border border-slate-200 bg-white h-14 px-4 pr-12 text-slate-900 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none placeholder:text-slate-400" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0f4b80]">
                    <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                <p className="text-xs text-slate-500">Must be at least 8 characters long</p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#0f4b80] text-white font-bold h-14 rounded-xl hover:opacity-90 transition-opacity text-lg flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : null}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-center text-slate-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-[#0f4b80] font-bold hover:underline">Sign In</Link>
              </p>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 relative bg-[#0f4b80] items-center justify-center overflow-hidden">
          <div className="relative z-10 p-16 text-white text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl">health_metrics</span>
              </div>
            </div>
            <h2 className="text-4xl font-black mb-6 leading-tight">World-Class Healthcare<br />At Your Fingertips</h2>
            <div className="space-y-5 text-left max-w-sm mx-auto">
              {[
                { icon: 'verified_user', text: 'Verified medical professionals available 24/7' },
                { icon: 'calendar_month', text: 'Easy appointment scheduling and reminders' },
                { icon: 'history_edu', text: 'Secure access to your medical history and test results' },
              ].map(item => (
                <div key={item.icon} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <p className="text-white/80 font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
