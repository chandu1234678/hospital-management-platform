import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton.jsx'

const SECTIONS = [
  { icon: 'info', title: 'Introduction', content: 'At Deepthi Hospitals, we recognize the importance of your privacy. This Privacy Policy describes our practices regarding the collection, use, and protection of your personal and medical information when you use our services.' },
  { icon: 'database', title: 'Information We Collect', content: 'We collect personal identification information (name, email, phone, address), medical history and records, appointment and billing data, and usage data from our digital platforms. All data is collected with your explicit consent.' },
  { icon: 'manage_accounts', title: 'How We Use Your Information', content: 'Your information is used to provide and improve healthcare services, process appointments and billing, communicate important health updates, comply with legal and regulatory requirements, and enhance patient safety.' },
  { icon: 'lock', title: 'Data Security', content: 'We implement industry-standard security measures including encryption, secure servers, access controls, and regular audits. Medical records are stored in compliance with applicable healthcare data protection regulations.' },
  { icon: 'share', title: 'Third-Party Sharing', content: 'We do not sell your personal data. We may share information with treating physicians, insurance providers (with consent), regulatory authorities as required by law, and technology partners under strict confidentiality agreements.' },
  { icon: 'verified_user', title: 'Your Rights', content: 'You have the right to access, correct, or delete your personal data. You may withdraw consent at any time. To exercise these rights, contact our Data Protection Officer at privacy@deepthihospitals.com.' },
  { icon: 'contact_mail', title: 'Contact Us', content: 'For privacy-related queries, contact our Data Protection Officer at privacy@deepthihospitals.com or visit our hospital at 123 Health Ave, Medical District. We respond to all requests within 30 days.' },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 lg:py-20">
        <nav className="flex items-center gap-2 text-sm mb-8 text-slate-500">
          <BackButton className="mr-2" />
          <Link to="/" className="hover:text-[#0F4C81] transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-900 font-medium">Privacy Policy</span>
        </nav>
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F4C81]/10 text-[#0F4C81] text-xs font-bold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-sm">shield</span>
            Legal
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight text-slate-900">Privacy Policy</h1>
          <p className="text-lg text-slate-600">Last updated: March 2026. Your privacy and the security of your medical records are our absolute priority.</p>
          <div className="h-1 w-20 bg-[#0F4C81] mt-6 rounded-full" />
        </div>
        <div className="space-y-10">
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
