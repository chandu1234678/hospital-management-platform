import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Logo from '../components/Logo.jsx'
import BackButton from '../components/BackButton.jsx'

export default function ForgotPasswordPage() {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!value) return toast.error('Please enter your email or phone')
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    toast.success('OTP sent successfully!')
    navigate('/verify-otp', { state: { contact: value } })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f8]">
      <header className="flex items-center justify-between border-b border-[#0f4b80]/10 bg-[#f6f7f8] px-6 py-4">
        <Link to="/" className="flex items-center">
          <Logo height={34} />
        </Link>
        <div className="flex items-center gap-3">
          <BackButton />
          <Link to="/login" className="p-2 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 md:p-16">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h1 className="text-slate-900 text-4xl font-black leading-tight">Forgot Password</h1>
              <p className="text-slate-600 text-lg mt-2">Enter your registered email or phone number to receive a reset OTP.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-slate-900 text-base font-semibold">Email or Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">contact_mail</span>
                  <input value={value} onChange={e => setValue(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#0f4b80] focus:border-transparent outline-none placeholder:text-slate-400"
                    placeholder="e.g. name@email.com or +91..." />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center rounded-xl h-14 bg-[#0f4b80] text-white text-lg font-bold hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60">
                {loading ? 'Sending...' : 'Send Reset OTP'}
              </button>
            </form>
            <div className="pt-4 border-t border-slate-200">
              <Link to="/login" className="flex items-center gap-2 text-[#0f4b80] font-semibold hover:underline">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Login
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-1/2 relative min-h-full bg-[#0f4b80]/10">
          <div className="absolute inset-0 flex items-end p-16">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 bg-[#0f4b80]/20 rounded-lg">
                  <span className="material-symbols-outlined text-[#0f4b80]">security</span>
                </div>
                <p className="font-bold text-slate-900">Secure Access</p>
              </div>
              <p className="text-sm text-slate-600">We prioritize the security of your medical data. Verification steps help keep your account safe.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
