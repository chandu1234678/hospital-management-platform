import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton.jsx'

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-[#0f4b80] py-20 text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="mb-6">
              <BackButton className="text-white/70 hover:text-white" />
            </div>
            <span className="text-white/60 font-semibold uppercase tracking-wider text-sm">About Us</span>
            <h1 className="text-5xl font-black mt-2 mb-4">Caring for You Since 1999</h1>
            <p className="text-white/80 text-lg max-w-2xl">Deepthi Hospitals has been a beacon of healthcare excellence for over 25 years, serving thousands of patients with compassion and cutting-edge medical technology.</p>
          </div>
        </div>

        {/* Mission */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed mb-4">To provide world-class healthcare services that are accessible, affordable, and compassionate. We believe every patient deserves the best medical care delivered with dignity and respect.</p>
              <p className="text-slate-600 leading-relaxed">Our team of 250+ experienced doctors, nurses, and healthcare professionals work tirelessly to ensure the best outcomes for every patient who walks through our doors.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[['250+', 'Expert Doctors'], ['500+', 'Bed Capacity'], ['25+', 'Years of Service'], ['100k+', 'Happy Patients']].map(([v, l]) => (
                <div key={l} className="bg-[#0f4b80]/5 p-6 rounded-2xl text-center">
                  <p className="text-[#0f4b80] text-4xl font-black">{v}</p>
                  <p className="text-slate-600 font-medium mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Our Core Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: 'favorite', title: 'Compassion', desc: 'We treat every patient with empathy, kindness, and respect.' },
                { icon: 'verified', title: 'Excellence', desc: 'We strive for the highest standards in medical care and service.' },
                { icon: 'groups', title: 'Teamwork', desc: 'Our multidisciplinary teams collaborate for the best patient outcomes.' },
                { icon: 'lightbulb', title: 'Innovation', desc: 'We embrace the latest medical technologies and research.' },
              ].map(v => (
                <div key={v.title} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <div className="w-14 h-14 bg-[#0f4b80]/10 rounded-xl flex items-center justify-center text-[#0f4b80] mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">{v.icon}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-slate-500 text-sm">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to experience the Deepthi difference?</h2>
          <p className="text-slate-500 mb-8">Book an appointment today and take the first step towards better health.</p>
          <Link to="/book-appointment"
            className="inline-flex items-center gap-2 bg-[#0f4b80] text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity">
            Book Appointment <span className="material-symbols-outlined">calendar_today</span>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
