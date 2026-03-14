import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { authService } from '../services/api.js'
import { useAuthStore } from '../store/authStore.js'
import Logo from '../components/Logo.jsx'
import BackButton from '../components/BackButton.jsx'

const schema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await authService.login(data.identifier, data.password)
      login(user)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(from, { replace: true })
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
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-slate-500">Need help?</span>
            <Link to="/contact" className="text-sm font-semibold text-[#0f4b80] hover:underline">Contact Support</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-xl shadow-xl overflow-hidden border border-[#0f4b80]/5">
          {/* Left image */}
          <div className="hidden lg:block relative min-h-[500px]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDelZ5qcrghOWmGuQdVRp8uIzFirjdFIS7LaOzm2nb1bP4ecpSxAELc8oS57HVULTnC9oLwe_oHK2g9a73dvkuAWOIHTRftTzk5MzCfNgRu-0zifPwXrXlYZwNU9eMEbDYnE0KZExuntzehTgzgjLEFjidt8H05FcmdndjSWwP4McXB5KqtWQfZiRAZ7vXSuHS8tMtTnZ7KyFILdgV3uwQk72OZwXYeKoNFGpcSyiyuH8Si9wyvzfjEiz-EMjqKlRvszN1O-dAeA3sl"
              alt="Hospital" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-[#0f4b80]/80 to-transparent flex flex-col justify-end p-12">
              <h3 className="text-white text-3xl font-bold mb-4">Quality care, right at your fingertips.</h3>
              <p className="text-white/80 text-lg">Access your medical records, book appointments, and connect with your healthcare providers securely.</p>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <div className="mb-8">
              <h1 className="text-slate-900 text-3xl font-bold">Welcome Back</h1>
              <p className="text-slate-500 mt-2">Please login to your patient portal account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 text-sm font-semibold">Email or Phone</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                  <input {...register('identifier')}
                    className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none transition-all placeholder:text-slate-400"
                    placeholder="e.g. arjun@deepthi.com" />
                </div>
                {errors.identifier && <p className="text-red-500 text-xs">{errors.identifier.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-900 text-sm font-semibold">Password</label>
                  <Link to="/forgot-password" className="text-sm font-semibold text-[#0f4b80] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                  <input {...register('password')} type={showPass ? 'text' : 'password'}
                    className="w-full pl-12 pr-12 py-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0f4b80]">
                    <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-[#0f4b80] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#0f4b80]/20 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : null}
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <span className="material-symbols-outlined text-sm">login</span>}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600 text-sm">
                New to Deepthi Hospitals?{' '}
                <Link to="/register" className="font-bold text-[#0f4b80] hover:underline">Create an account</Link>
              </p>
              <p className="text-xs text-slate-400 mt-3">Demo: arjun@deepthi.com / password123</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 bg-white border-t border-slate-100 text-center text-slate-500 text-sm">
        © 2024 Deepthi Hospitals. All rights reserved.
      </footer>
    </div>
  )
}
