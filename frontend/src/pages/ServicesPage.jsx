import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton.jsx'

const SERVICES = [
  { icon: 'emergency_home', title: '24/7 Emergency Care', desc: 'Round-the-clock critical care with immediate trauma response and specialized ICU units.', color: 'bg-red-50 text-red-600' },
  { icon: 'biotech', title: 'Diagnostic Labs', desc: 'Fully automated diagnostic services providing accurate results with minimal wait times.', color: 'bg-blue-50 text-blue-600' },
  { icon: 'video_call', title: 'Tele-Consultation', desc: 'Consult with our expert doctors from the comfort of your home via secure video call.', color: 'bg-purple-50 text-purple-600' },
  { icon: 'home_health', title: 'Home Care Services', desc: 'Professional nursing and physiotherapy at your doorstep.', color: 'bg-green-50 text-green-600' },
  { icon: 'local_pharmacy', title: 'Pharmacy Services', desc: '24/7 in-house pharmacy for all medical requirements.', color: 'bg-amber-50 text-amber-600' },
  { icon: 'health_and_safety', title: 'Health Check-up Packages', desc: 'Regular wellness assessments for every age group.', color: 'bg-teal-50 text-teal-600' },
  { icon: 'ambulance', title: 'Ambulance Services', desc: 'Fully equipped ambulances available 24/7 for emergency transport.', color: 'bg-orange-50 text-orange-600' },
  { icon: 'psychology', title: 'Mental Health', desc: 'Comprehensive mental health support and counseling services.', color: 'bg-pink-50 text-pink-600' },
]

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="bg-[#0f4b80] py-16 text-white text-center">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-start mb-6">
              <BackButton className="text-white/70 hover:text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black mb-3">Our Services</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">Comprehensive healthcare services designed to meet all your medical needs</p>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map(s => (
              <div key={s.title} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${s.color}`}>
                  <span className="material-symbols-outlined text-3xl">{s.icon}</span>
                </div>
                <h3 className="text-slate-900 text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 bg-[#0f4b80] rounded-2xl p-10 text-white text-center">
            <h2 className="text-3xl font-black mb-3">Ready to get started?</h2>
            <p className="text-white/80 mb-6">Book an appointment with our specialists today</p>
            <Link to="/book-appointment"
              className="inline-flex items-center gap-2 bg-white text-[#0f4b80] font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity">
              Book Appointment <span className="material-symbols-outlined">calendar_today</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
