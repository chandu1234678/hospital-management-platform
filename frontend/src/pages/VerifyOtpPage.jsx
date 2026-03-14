import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import Logo from '../components/Logo.jsx'
import BackButton from '../components/BackButton.jsx'

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const refs = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  const contact = location.state?.contact || '••••••••'

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Please enter the 6-digit OTP')
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    if (code === '123456') {
      toast.success('OTP verified successfully!')
      navigate('/login')
    } else {
      toast.error('Invalid OTP. Use 123456 for demo.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f8]">
      <header className="flex items-center justify-between border-b border-[#0f4b80]/10 bg-white px-6 py-4">
        <Link to="/" className="flex items-center">
          <Logo height={32} />
        </Link>
        <BackButton />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-[#0f4b80]/5">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-[#0f4b80]/10 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#0f4b80] text-3xl">phonelink_lock</span>
            </div>
            <h1 className="text-slate-900 text-3xl font-bold">Verify OTP</h1>
            <p className="text-slate-500 text-sm mt-2">
              We've sent a 6-digit code to <span className="font-semibold text-slate-700">{contact}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-2 md:gap-3">
              {otp.map((digit, i) => (
                <input key={i} ref={el => refs.current[i] = el}
                  value={digit} onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  maxLength={1} inputMode="numeric"
                  className="w-12 h-14 text-center text-xl font-bold rounded-lg border-2 border-slate-200 bg-transparent focus:border-[#0f4b80] focus:ring-0 outline-none transition-colors" />
              ))}
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-12 bg-[#0f4b80] text-white rounded-lg font-bold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Verifying...' : 'Verify and Continue'}
              {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
            </button>

            <p className="text-center text-xs text-slate-400">Demo OTP: <strong>123456</strong></p>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs">
              Having trouble? <Link to="/contact" className="text-[#0f4b80] font-medium hover:underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
