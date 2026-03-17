import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Link } from 'react-router-dom'

// Deepthi Hospitals — Jubilee Hills, Hyderabad
const HOSPITAL_LAT = 17.4318
const HOSPITAL_LNG = 78.4071
const MAP_EMBED = `https://maps.google.com/maps?q=17.4318,78.4071&t=&z=15&ie=UTF8&iwloc=&output=embed`

const EMERGENCY_CONTACTS = [
  { label: 'Emergency Helpline', number: '1066', icon: 'emergency', color: 'bg-red-600' },
  { label: 'Ambulance', number: '108', icon: 'ambulance', color: 'bg-orange-500' },
  { label: 'Hospital Direct', number: '+91 40 2355 6789', icon: 'call', color: 'bg-[#0f4b80]' },
  { label: 'WhatsApp', number: '+91 98765 43210', icon: 'chat', color: 'bg-green-600' },
]

const SERVICES = [
  {
    icon: 'ambulance',
    title: 'Ambulance Services',
    desc: 'Fully equipped ALS & BLS ambulances with trained paramedics dispatched within 8 minutes.',
    action: 'Call 108',
    href: 'tel:108',
    color: 'text-red-600 bg-red-50',
  },
  {
    icon: 'local_hospital',
    title: '24/7 Emergency Room',
    desc: 'Level-1 trauma centre with 40+ emergency bays, ICU step-down, and on-call specialists round the clock.',
    action: 'Get Directions',
    href: '#map',
    color: 'text-[#0f4b80] bg-blue-50',
  },
  {
    icon: 'video_call',
    title: 'Tele-Emergency',
    desc: 'Connect instantly with an emergency physician via video for immediate guidance before reaching the hospital.',
    action: 'Connect Now',
    href: '/book-appointment',
    color: 'text-green-600 bg-green-50',
  },
  {
    icon: 'bloodtype',
    title: 'Blood Bank',
    desc: '24/7 blood bank with all blood groups available. Platelet and plasma components on request.',
    action: 'Call Now',
    href: 'tel:+914023556789',
    color: 'text-rose-600 bg-rose-50',
  },
  {
    icon: 'monitor_heart',
    title: 'Cardiac Emergency',
    desc: 'Dedicated cath lab with door-to-balloon time under 60 minutes for STEMI patients.',
    action: 'Learn More',
    href: '/departments',
    color: 'text-violet-600 bg-violet-50',
  },
  {
    icon: 'child_care',
    title: 'Paediatric Emergency',
    desc: 'Separate paediatric emergency unit with dedicated neonatology and PICU support.',
    action: 'Learn More',
    href: '/departments',
    color: 'text-amber-600 bg-amber-50',
  },
]

const STEPS = [
  { step: '01', title: 'Stay Calm', desc: 'Keep yourself and the patient calm. Panic can worsen the situation.' },
  { step: '02', title: 'Call 1066', desc: 'Call our emergency helpline immediately for guidance and ambulance dispatch.' },
  { step: '03', title: 'Basic First Aid', desc: 'Apply basic first aid if trained. Do not move the patient if spinal injury is suspected.' },
  { step: '04', title: 'Head to ER', desc: 'Head directly to our emergency room at Jubilee Hills, Hyderabad — open 24/7.' },
]

export default function EmergencyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1">

        {/* ── Emergency Banner ── */}
        <section className="bg-linear-to-br from-red-700 via-red-600 to-red-800 py-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="text-white/80 text-sm font-semibold uppercase tracking-widest">Emergency Services — 24/7</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
                  Emergency<br />Services
                </h1>
                <p className="text-white/80 text-lg max-w-lg">
                  Our emergency department is open 24 hours a day, 7 days a week with trauma specialists always on standby.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <a href="tel:1066"
                  className="flex items-center gap-4 bg-white text-red-600 font-black text-2xl px-8 py-5 rounded-2xl hover:opacity-90 transition-opacity shadow-2xl">
                  <span className="material-symbols-outlined text-3xl">call</span>
                  Call 1066
                </a>
                <p className="text-white/60 text-xs text-center">Toll-free emergency helpline</p>
                <a href="tel:108"
                  className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white font-bold text-lg px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined">ambulance</span>
                  Ambulance: 108
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick Contact Numbers ── */}
        <section className="bg-slate-900 py-6">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {EMERGENCY_CONTACTS.map(c => (
                <a key={c.label} href={`tel:${c.number.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}>
                    <span className="material-symbols-outlined text-white text-[18px]">{c.icon}</span>
                  </div>
                  <div>
                    <p className="text-white/50 text-[10px] font-semibold uppercase">{c.label}</p>
                    <p className="text-white font-bold text-sm">{c.number}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Emergency Services Grid ── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Emergency Care Services</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Comprehensive emergency care across all specialities, available around the clock.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(s => (
              <div key={s.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:shadow-md transition-shadow flex flex-col">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${s.color}`}>
                  <span className="material-symbols-outlined text-3xl">{s.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-5">{s.desc}</p>
                <a href={s.href}
                  className="inline-flex items-center gap-1.5 text-[#0f4b80] font-bold text-sm hover:gap-2.5 transition-all">
                  {s.action}
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── What to do in an emergency ── */}
        <section className="bg-slate-900 py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white">What to do in an emergency</h2>
              <p className="text-slate-400 mt-3">Follow these steps while help is on the way</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map(s => (
                <div key={s.step} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-5xl font-black text-red-500/30 mb-3">{s.step}</p>
                  <h4 className="font-bold text-white text-lg mb-2">{s.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Hospital Location + Map ── */}
        <section id="map" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900">Find Us</h2>
            <p className="text-slate-500 mt-2">Deepthi Hospitals — Jubilee Hills, Hyderabad</p>
          </div>
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Address card */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-red-600">location_on</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Deepthi Hospitals Main Wing</p>
                    <p className="text-slate-500 text-sm mt-1">Block B, 4th Floor, Health City,<br />Jubilee Hills, Hyderabad — 500033</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#0f4b80]">schedule</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Emergency Hours</p>
                    <p className="text-slate-500 text-sm mt-1">Open 24 hours · 7 days a week<br />365 days a year</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-green-600">local_parking</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Parking</p>
                    <p className="text-slate-500 text-sm mt-1">Free emergency parking available<br />Valet service at main entrance</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-amber-600">directions_bus</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Public Transport</p>
                    <p className="text-slate-500 text-sm mt-1">TSRTC Bus: Routes 5, 10, 49<br />Metro: Jubilee Hills Check Post</p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${HOSPITAL_LAT},${HOSPITAL_LNG}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#0f4b80] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]">directions</span>
                  Get Directions
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[420px] relative">
              <iframe
                title="Deepthi Hospitals Location"
                src={MAP_EMBED}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
              <a
                href={`https://www.google.com/maps/search/Jubilee+Hills+Hospital+Hyderabad`}
                target="_blank" rel="noopener noreferrer"
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-white text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-slate-200">
                <span className="material-symbols-outlined text-[16px] text-[#0f4b80]">open_in_new</span>
                Open in Maps
              </a>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-red-600 py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-black text-white mb-2">Not an emergency? Book a regular appointment.</h2>
            <p className="text-white/70 mb-6">Our OPD is open Monday–Saturday, 8 AM to 8 PM.</p>
            <Link to="/book-appointment"
              className="inline-flex items-center gap-2 bg-white text-red-600 font-black px-8 py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg">
              <span className="material-symbols-outlined">calendar_today</span>
              Book Appointment
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
