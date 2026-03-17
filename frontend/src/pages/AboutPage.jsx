import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Link } from 'react-router-dom'

const LEADERSHIP = [
  { name: 'Dr. Sarah Thompson', role: 'Chief Executive Officer', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face' },
  { name: 'Dr. Robert Chen', role: 'Executive Director', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face' },
  { name: 'Dr. Maria Rodriguez', role: 'Medical Director', img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop&crop=face' },
  { name: 'Dr. James Wilson', role: 'Chief of Surgery', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face' },
]

const ACCREDITATIONS = [
  { icon: 'verified', label: 'JCI Accredited' },
  { icon: 'workspace_premium', label: 'NABH Certified' },
  { icon: 'military_tech', label: 'ISO 9001:2015' },
  { icon: 'emoji_events', label: 'NABL Accredited' },
]

const FACILITIES = [
  { img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop', label: 'Advanced ICU' },
  { img: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=600&h=400&fit=crop', label: 'Diagnostic Lab' },
  { img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop', label: 'Operation Theatre' },
  { img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop', label: 'Patient Rooms' },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative h-[480px] md:h-[560px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1600&h=700&fit=crop"
            alt="Deepthi Hospitals"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#0a2e50]/90 via-[#0f4b80]/70 to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-center max-w-7xl mx-auto px-6 md:px-12">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-3">About Us</p>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight max-w-2xl">
              Excellence in Care,<br />Healing with Compassion
            </h1>
            <p className="text-white/75 mt-4 text-base md:text-lg max-w-xl leading-relaxed">
              A legacy of medical leadership and patient-first healthcare serving our community for over 25 years.
            </p>
          </div>
        </section>

        {/* ── Our Story ── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#0f4b80] text-xs font-bold uppercase tracking-widest mb-3">Our Story</p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-6">
                Providing world-class healthcare since 1998
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Deepthi Hospitals began with a simple vision: to bridge the gap between advanced medical technology and personalised patient care. What started as a modest clinic that has now evolved into a premier multi-speciality institution.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                Our journey has been defined by continuous innovation and an unwavering commitment to medical ethics. We take pride in our team of world-renowned specialists and our state-of-the-art diagnostic facilities that help us save lives every day.
              </p>
              <div className="flex gap-10">
                <div>
                  <p className="text-3xl font-black text-[#0f4b80]">500+</p>
                  <p className="text-slate-500 text-sm mt-1">Expert Doctors</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-[#0f4b80]">1M+</p>
                  <p className="text-slate-500 text-sm mt-1">Patients Served</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=700&h=500&fit=crop"
                alt="Hospital interior"
                className="rounded-2xl shadow-2xl w-full object-cover h-[380px]"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#0f4b80] text-white rounded-2xl p-5 shadow-xl">
                <p className="text-3xl font-black">25+</p>
                <p className="text-white/80 text-sm">Years of Excellence</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Mission & Vision ── */}
        <section className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-[#0f4b80]/10 rounded-xl flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-[#0f4b80] text-2xl">flag</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Our Mission</h3>
                <p className="text-slate-600 leading-relaxed">
                  To deliver cost-effective health services to the communities we serve through an integrated healthcare system. We are committed to standards of clinical excellence and a culture of compassion.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-[#0f4b80]/10 rounded-xl flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-[#0f4b80] text-2xl">visibility</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Our Vision</h3>
                <p className="text-slate-600 leading-relaxed">
                  To be the regional standard for patient-centric healthcare where clinical outcomes lead autonomously, and team members thrive in a hospital affiliated with dignity and care.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Leadership Team ── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Our Leadership Team</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Driven by a board of experienced medical physicians and administrative leaders dedicated to institutional excellence.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {LEADERSHIP.map(l => (
              <div key={l.name} className="text-center group">
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-square">
                  <img src={l.img} alt={l.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-linear-to-t from-[#0f4b80]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{l.name}</h4>
                <p className="text-slate-500 text-xs mt-0.5">{l.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Facilities ── */}
        <section className="bg-[#0a2e50] py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white">World-Class Facilities</h2>
                <p className="text-white/60 mt-2 max-w-md">
                  Equipped with ultra-modern medical and patient-centric amenities for a first-class healing environment.
                </p>
              </div>
              <Link to="/departments"
                className="hidden md:inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors">
                View All Facilities
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="md:row-span-2 relative overflow-hidden rounded-2xl">
                <img src={FACILITIES[0].img} alt={FACILITIES[0].label}
                  className="w-full h-full object-cover min-h-[280px] hover:scale-105 transition-transform duration-500" />
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
                  <p className="text-white font-bold text-sm">{FACILITIES[0].label}</p>
                </div>
              </div>
              {FACILITIES.slice(1).map(f => (
                <div key={f.label} className="relative overflow-hidden rounded-2xl aspect-video">
                  <img src={f.img} alt={f.label}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-3">
                    <p className="text-white font-bold text-sm">{f.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Accreditations ── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Global Accreditations & Quality Standards</h2>
            <p className="text-slate-500 mb-12 max-w-xl mx-auto">
              Recognised by leading international and national healthcare accreditation bodies.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {ACCREDITATIONS.map(a => (
                <div key={a.label} className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-100 hover:border-[#0f4b80]/20 hover:shadow-md transition-all">
                  <div className="w-14 h-14 bg-[#0f4b80]/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#0f4b80] text-2xl">{a.icon}</span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">{a.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#0f4b80] py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-black text-white mb-3">Ready to experience the Deepthi difference?</h2>
            <p className="text-white/70 mb-8">Book an appointment today and take the first step towards better health.</p>
            <Link to="/book-appointment"
              className="inline-flex items-center gap-2 bg-white text-[#0f4b80] font-black px-8 py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg">
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
