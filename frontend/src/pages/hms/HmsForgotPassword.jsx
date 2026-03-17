import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import HmsHeader from '../../components/HmsHeader.jsx'

const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

const ROLE_LABELS = { admin: 'Admin', staff: 'Doctor / Staff', reception: 'Reception' }

export default function HmsForgotPassword() {
  const { role = 'admin' } = useParams()
  const [step, setStep] = useState('request')
  const [sentEmail, setSentEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(emailSchema) })

  const onSubmit = async (data) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setSentEmail(data.email)
    setStep('sent')
    toast.success('Reset link sent to your email')
    setLoading(false)
  }

  const roleLabel = ROLE_LABELS[role] || 'Staff'
  const loginPath = role === 'staff' ? '/hms/staff/login' : `/hms/${role}/login`

  return (
    <div className="h-screen bg-[#f6f7f8] flex flex-col overflow-hidden">
      <HmsHeader
        rightSlot={
          <div className="flex items-center gap-3">
            <Link to={loginPath}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#0f4b80]/10 text-[#0f4b80] rounded-lg text-sm font-semibold hover:bg-[#0f4b80]/20 transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Login
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

            {step === 'request' ? (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f4b80]/5 text-[#0f4b80] text-[10px] font-bold uppercase tracking-widest mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f4b80] animate-pulse" />
                    {roleLabel} — Password Reset
                  </div>
                  <h1 className="text-slate-900 text-2xl font-black leading-tight tracking-tight mb-2">Forgot Password?</h1>
                  <p className="text-slate-500 text-sm font-medium">
                    Enter your registered email and we'll send you a secure reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 text-sm font-bold ml-1">Email Address</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0f4b80] transition-colors text-xl">mail</span>
                      <input {...register('email')} type="email"
                        placeholder="your@deepthihospitals.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-4 focus:ring-[#0f4b80]/10 focus:border-[#0f4b80] outline-none transition-all text-sm font-medium placeholder:text-slate-400" />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-[#0f4b80] hover:bg-[#0f4b80]/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-[#0f4b80]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                    {loading
                      ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      : <span className="material-symbols-outlined text-lg">send</span>
                    }
                    <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                  </button>
                </form>

                <div className="mt-5 pt-5 border-t border-slate-100 flex justify-center">
                  <Link to={loginPath}
                    className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-100 px-5 py-2.5 rounded-full hover:bg-[#0f4b80] hover:text-white transition-all border border-slate-200">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-green-600 text-3xl">mark_email_read</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Email Sent
                </div>
                <h1 className="text-slate-900 text-2xl font-black leading-tight tracking-tight mb-2">Check your inbox</h1>
                <p className="text-slate-500 text-sm font-medium mb-1">A password reset link has been sent to:</p>
                <p className="text-[#0f4b80] font-bold text-sm mb-4">{sentEmail}</p>
                <p className="text-slate-400 text-xs max-w-xs">
                  Click the link in the email to reset your password. The link expires in 30 minutes.
                </p>

                <div className="mt-6 flex flex-col gap-3 w-full max-w-xs">
                  <button onClick={() => setStep('request')}
                    className="w-full border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Resend Email
                  </button>
                  <Link to={loginPath}
                    className="w-full bg-[#0f4b80] text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Visual Side ── */}
          <div className="hidden md:flex w-1/2 relative bg-[#0f4b80] overflow-hidden flex-col items-center justify-center p-10 text-center text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f4b80] via-[#0f4b80] to-[#08345a]" />
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4)_0%,transparent_60%)]" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-8 w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 rotate-3">
                <span className="material-symbols-outlined text-4xl">lock_reset</span>
              </div>
              <h2 className="text-2xl font-black mb-3 leading-tight">Secure Account Recovery</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs font-medium">
                We take the security of your account seriously. Follow the steps to regain access safely.
              </p>
              <div className="space-y-3 w-full max-w-xs text-left">
                {[
                  { icon: 'mail', label: 'Enter your registered email' },
                  { icon: 'mark_email_read', label: 'Receive a secure reset link' },
                  { icon: 'lock_open', label: 'Set your new password' },
                  { icon: 'verified_user', label: 'Access restored securely' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-lg text-white">{s.icon}</span>
                    </div>
                    <span className="text-sm font-semibold text-white/90">{s.label}</span>
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
