import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl w-full">
          <div className="relative w-full aspect-video mb-10 overflow-hidden rounded-2xl shadow-xl border border-slate-100 bg-[#0F4C81]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0F4C81] opacity-10 select-none" style={{ fontSize: '180px' }}>sentiment_dissatisfied</span>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-100 max-w-md">
                <p className="text-[#0F4C81] font-black text-8xl mb-2">404</p>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Page Not Found</h1>
                <p className="text-slate-500 text-sm">The page you're looking for doesn't exist or has been moved.</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-slate-600 text-lg">Let's get you back on track.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/" className="bg-[#0F4C81] hover:opacity-90 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">home</span>
                Back to Home
              </Link>
              <Link to="/doctors" className="border border-[#0F4C81]/20 text-[#0F4C81] hover:bg-[#0F4C81]/5 px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">stethoscope</span>
                Find a Doctor
              </Link>
              <Link to="/contact" className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">support_agent</span>
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
