import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'

export default function MaintenancePage() {
  const navigate = useNavigate()

  // Poll every 3s — if admin turns off maintenance, redirect users to home
  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem('deepthi-maintenance') !== '1') {
        navigate('/', { replace: true })
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [navigate])
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 50%, #e8f4fd 100%)',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,75,128,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,75,128,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1 w-full bg-linear-to-r from-[#0f4b80] via-[#1a6bb5] to-[#0f4b80]" />

          <div className="px-10 py-10 flex flex-col items-center text-center gap-6">

            {/* Logo */}
            <Logo variant="default" height={48} />

            {/* Status badge */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              Scheduled Maintenance
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">
                We'll be back soon
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                We're performing scheduled maintenance to improve our systems and services.
                Thank you for your patience.
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-slate-100" />

            {/* Emergency helpline */}
            <div className="w-full bg-[#0f4b80]/5 border border-[#0f4b80]/10 rounded-2xl px-6 py-4 flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Emergency Helpline</p>
                <a
                  href="tel:1066"
                  className="text-2xl font-black text-[#0f4b80] hover:text-blue-700 transition-colors tracking-tight"
                >
                  1066
                </a>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#0f4b80]/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#0f4b80]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>

            {/* CTA */}
            <a
              href="mailto:support@deepthihospitals.com"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0f4b80] text-white text-sm font-semibold rounded-xl hover:bg-[#0d3f6e] active:scale-[0.98] transition-all shadow-lg shadow-blue-900/25"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </a>

          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-10 py-4 flex items-center justify-between bg-slate-50/60">
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} Deepthi Hospitals</p>
            <div className="flex gap-4">
              <a href="#" aria-label="Facebook" className="text-slate-300 hover:text-[#0f4b80] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-slate-300 hover:text-[#0f4b80] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="text-slate-300 hover:text-[#0f4b80] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Below card note */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Estimated downtime: less than 2 hours &nbsp;·&nbsp; We apologize for the inconvenience
        </p>
      </div>
    </div>
  )
}
