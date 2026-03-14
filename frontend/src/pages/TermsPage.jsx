import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton.jsx'

const SECTIONS = [
  { icon: 'gavel', title: '1. Acceptance of Terms', content: 'By accessing or using Deepthi Hospitals\' services, website, or patient portal, you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of our services immediately.' },
  { icon: 'medical_services', title: '2. Medical Services', content: 'Deepthi Hospitals provides healthcare services through qualified medical professionals. Information on our website is for general informational purposes only and does not constitute medical advice. Always consult a qualified physician for medical decisions.' },
  { icon: 'person', title: '3. User Obligations', content: 'You agree to provide accurate personal and medical information, maintain the confidentiality of your account credentials, use our services only for lawful purposes, and not attempt to access other patients\' records or disrupt our systems.' },
  { icon: 'calendar_today', title: '4. Appointments & Cancellations', content: 'Appointments must be cancelled at least 24 hours in advance. Repeated no-shows may result in restrictions on future bookings. Emergency appointments are subject to availability and clinical priority.' },
  { icon: 'payments', title: '5. Billing & Payments', content: 'Patients are responsible for all charges incurred. Insurance claims are processed on a best-effort basis. Deepthi Hospitals is not liable for insurance denials. Payment plans are available upon request.' },
  { icon: 'balance', title: '6. Limitation of Liability', content: 'Deepthi Hospitals shall not be liable for indirect, incidental, or consequential damages arising from the use of our services. Our liability is limited to the amount paid for the specific service in question.' },
  { icon: 'public', title: '7. Governing Law', content: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in the city where Deepthi Hospitals is headquartered.' },
  { icon: 'update', title: '8. Changes to Terms', content: 'We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Continued use of our services after changes constitutes acceptance of the new Terms.' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 lg:py-20">
        <nav className="flex items-center gap-2 text-sm mb-8 text-slate-500">
          <BackButton className="mr-2" />
          <Link to="/" className="hover:text-[#0F4C81] transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-900 font-medium">Terms & Conditions</span>
        </nav>
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F4C81]/10 text-[#0F4C81] text-xs font-bold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-sm">gavel</span>
            Legal
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight text-slate-900">Terms & Conditions</h1>
          <p className="text-slate-600 text-lg">Last updated: March 2026</p>
          <div className="h-1 w-20 bg-[#0F4C81] mt-6 rounded-full" />
        </div>
        <div className="space-y-8">
          {SECTIONS.map((s, i) => (
            <section key={i} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81] shrink-0">
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{s.title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">{s.content}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
