import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-4 gap-10 mb-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[#0f4b80]">
            <Logo height={36} />
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Leading provider of advanced medical services, dedicated to delivering exceptional care and patient satisfaction.
          </p>
        </div>
        <div>
          <h4 className="text-slate-900 font-bold mb-4">Quick Links</h4>
          <ul className="space-y-3 text-slate-500 text-sm">
            {[['About Us', '/about'], ['Our Doctors', '/doctors'], ['Departments', '/departments'], ['Contact', '/contact']].map(([label, to]) => (
              <li key={to}><Link to={to} className="hover:text-[#0f4b80] transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-slate-900 font-bold mb-4">Services</h4>
          <ul className="space-y-3 text-slate-500 text-sm">
            {[['Emergency Care', '/emergency'], ['Book Appointment', '/book-appointment'], ['FAQ', '/faq'], ['Services', '/services']].map(([label, to]) => (
              <li key={to}><Link to={to} className="hover:text-[#0f4b80] transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-slate-900 font-bold mb-4">Contact Us</h4>
          <div className="space-y-3 text-slate-500 text-sm">
            <p className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#0f4b80] text-xl">location_on</span>
              123 Health Ave, Medical District,<br />City Name, State 560001
            </p>
            <p className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0f4b80] text-xl">phone</span>
              +91 80 4567 8900
            </p>
            <div className="bg-red-50 p-3 rounded-xl border border-red-100 mt-2">
              <p className="text-red-600 font-bold text-sm mb-1">Emergency (24/7)</p>
              <p className="text-red-700 text-2xl font-black">1066</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-400">
        <span>© 2026 Deepthi Hospitals Group. All rights reserved.</span>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-[#0F4C81] transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-[#0F4C81] transition-colors">Terms & Conditions</Link>
          <Link to="/hms" className="hover:text-[#0F4C81] transition-colors">Staff Portal</Link>
        </div>
      </div>
    </footer>
  )
}
