import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Logo from '../../components/Logo.jsx'
import BackButton from '../../components/BackButton.jsx'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export default function HmsForgotPassword() {
  const { role = 'admin' } = useParams()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    toast.success('Reset link sent to your email')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f8]">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 md:px-10 py-4">
        <Logo height={36} />
        <div className="ml-auto"><BackButton /></div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[440px] bg-white rounded-xl shadow-xl border border-slate-200 p-8 md:p-10">
          {!sent ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#0f4b80] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">lock_reset</span>
                </div>
                <div>
                  <h1 className="text-slate-900 text-2xl font-black">Forgot Password</h1>
                  <p className="text-slate-500 text-xs mt-0.5">We'll send a reset link to your email</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 text-sm font-semibold">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                    <input {...register('email')} type="email" placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] outline-none transition-all placeholder:text-slate-400" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-[#0f4b80] hover:opacity-90 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading && <span className="material-symbols-outlined animate-spin">progress_activity</span>}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-green-600 text-3xl">mark_email_read</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">Check your inbox</h2>
              <p className="text-slate-500 text-sm">A password reset link has been sent. Check your email and follow the instructions.</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to={`/hms/${role}/login`}
              className="inline-flex items-center gap-2 text-[#0f4b80] font-semibold text-sm hover:gap-3 transition-all">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
