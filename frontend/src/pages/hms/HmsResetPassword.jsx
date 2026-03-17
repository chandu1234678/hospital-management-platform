import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import HmsHeader from '../../components/HmsHeader.jsx'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string().min(1, 'Please confirm your password'),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
})

const ROLE_LABELS = { admin: 'Admin', staff: 'Doctor / Staff', reception: 'Reception' }

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { label: '', color: '' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong', color: 'bg-green-500' },
  ]
  return { score, ...map[score] }
}

export default function HmsResetPassword() {
  const { role = 'admin' } = useParams()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
  const password = watch('password', '')
  const strength = getStrength(password)
  const loginPath = role === 'staff' ? '/hms/staff/login' : `/hms/${role}/login`

  const onSubmit = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setDone(true)
    toast.success('Password reset successfully!')
    setLoading(false)
  }

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
            {!done ? (
              <>
                <div className="mb-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f4b80]/5 text-[#0f4b80] text-[10px] font-bold uppercase tracking-widest mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f4b80] animate-pulse" />
                    {ROLE_LABELS[role] || 'Staff'} — Set New Password
                  </div>
                  <h1 className="text-slate-900 text-2xl font-black leading-tight tracking-tight mb-2">Set New Password</h1>
                  <p className="text-slate-500 text-sm font-medium">Choose a strong password to secure your account.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 text-sm font-bold ml-1">New Password</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0f4b80] transition-colors text-xl">lock</span>
                      <input {...register('password')} type={showPass ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-4 focus:ring-[#0f4b80]/10 focus:border-[#0f4b80] outline-none transition-all text-sm font-medium placeholder:text-slate-400" />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-xl">{showPass ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
                    {password && (
                      <div className="ml-1 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-slate-200'}`} />
                          ))}
                        </div>
                        {strength.label && (
                          <p className="text-xs text-slate-500">Strength: <span className="font-semibold">{strength.label}</span></p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 text-sm font-bold ml-1">Confirm Password</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0f4b80] transition-colors text-xl">lock_clock</span>
                      <input {...register('confirm')} type={showConfirm ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-4 focus:ring-[#0f4b80]/10 focus:border-[#0f4b80] outline-none transition-all text-sm font-medium placeholder:text-slate-400" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-xl">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {errors.confirm && <p className="text-red-500 text-xs ml-1">{errors.confirm.message}</p>}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Requirements</p>
                    {[
                      { label: 'At least 8 characters', met: password.length >= 8 },
                      { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
                      { label: 'One number', met: /[0-9]/.test(password) },
                      { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
                    ].map(r => (
                      <div key={r.label} className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[14px] ${r.met ? 'text-green-500' : 'text-slate-300'}`}>
                          {r.met ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={`text-xs ${r.met ? 'text-green-700 font-medium' : 'text-slate-400'}`}>{r.label}</span>
                      </div>
                    ))}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-[#0f4b80] hover:bg-[#0f4b80]/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-[#0f4b80]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                    {loading
                      ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      : <span className="material-symbols-outlined text-lg">lock_reset</span>
                    }
                    <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <Link to={loginPath}
                    className="inline-flex items-center gap-1.5 text-slate-500 text-xs font-semibold hover:text-[#0f4b80] transition-colors">
                    <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                    Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-green-600 text-3xl">verified_user</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Password Updated
                </div>
                <h1 className="text-slate-900 text-2xl font-black leading-tight tracking-tight mb-2">Password Reset!</h1>
                <p className="text-slate-500 text-sm font-medium mb-6 max-w-xs">
                  Your password has been updated. You can now log in with your new credentials.
                </p>
                <Link to={loginPath}
                  className="w-full max-w-xs bg-[#0f4b80] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0f4b80]/25">
                  <span className="material-symbols-outlined text-lg">login</span>
                  Go to Login
                </Link>
              </div>
            )}
          </div>

          {/* ── Visual Side ── */}
          <div className="hidden md:flex w-1/2 relative bg-[#0f4b80] overflow-hidden flex-col items-center justify-center p-10 text-center text-white">
            <div className="absolute inset-0 bg-linear-to-br from-[#0f4b80] via-[#0f4b80] to-[#08345a]" />
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4)_0%,transparent_60%)]" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-8 w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 rotate-3">
                <span className="material-symbols-outlined text-4xl">shield_lock</span>
              </div>
              <h2 className="text-2xl font-black mb-3 leading-tight">Secure Your Account</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs font-medium">
                A strong password keeps your patient data and hospital records safe.
              </p>
              <div className="space-y-3 w-full max-w-xs text-left">
                {[
                  { icon: 'password', label: 'Use 8+ characters' },
                  { icon: 'abc', label: 'Mix uppercase & lowercase' },
                  { icon: 'pin', label: 'Include numbers & symbols' },
                  { icon: 'sync_lock', label: 'Never reuse old passwords' },
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-lg text-white">{tip.icon}</span>
                    </div>
                    <span className="text-sm font-semibold text-white/90">{tip.label}</span>
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
