import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { DEPARTMENTS, DOCTORS } from '../data/mockData.js'

function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-white/80 text-sm font-medium">{label}</p>
      <p className="text-white text-4xl font-black mt-1">{value}</p>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex flex-col gap-8 flex-1">
            <span className="text-[#0f4b80] font-semibold tracking-wider uppercase text-sm">Welcome to Deepthi Hospitals</span>
            <h1 className="text-slate-900 text-5xl md:text-6xl font-black leading-tight">
              Compassionate Care.<br />Advanced Medicine.<br />Trusted Doctors.
            </h1>
            <p className="text-slate-600 text-lg max-w-xl">
              Providing world-class healthcare with a human touch. Your health is our priority, utilizing the latest technology and top medical experts.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/book-appointment"
                className="bg-[#0f4b80] text-white px-8 py-4 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                Book Appointment
                <span className="material-symbols-outlined">calendar_today</span>
              </Link>
              <Link to="/doctors"
                className="bg-slate-200 text-slate-900 px-8 py-4 rounded-lg font-bold hover:bg-slate-300 transition-colors flex items-center gap-2">
                Find Doctor
                <span className="material-symbols-outlined">person_search</span>
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl bg-[#0f4b80]/10">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA15M0WuGdBTx-8_Qe6okmKY5PSsNaSVVG1d2meRNyh0aIJVfYqorKZsKylEonRsEXABTTwNFa4IKDSHKjXaOUXK7zn4yigYDyQS98PwQBJyyIj9-ttal1TXhR9kW6QBQHS6aBdq33RDR_XecTB325M5EN2SuClk2i8I4t8AksuatmRzLxznAOSoEpRh76ZAAH_r1A-wWWKIOXgKPmwekNjyXjBSsgfLCUsx3o6gE5Ae3r1YiMI6QZbLNxDNgG1---_WRxWaGR501-W"
                alt="Hospital Interior" className="w-full h-full object-cover object-top" />
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-4 rounded-xl flex items-center gap-3 shadow-lg border border-slate-100">
                <div className="bg-[#0f4b80]/10 p-2 rounded-full">
                  <span className="material-symbols-outlined text-[#0f4b80]">verified_user</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Accredited by</p>
                  <p className="text-sm font-bold text-slate-900">NABH Certified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0f4b80] py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value="250+" label="Experienced Doctors" />
          <StatCard value="500+" label="Beds Capacity" />
          <StatCard value="25+" label="Years of Service" />
          <StatCard value="100k+" label="Happy Patients" />
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-12 py-20">
        <h2 className="text-slate-900 text-3xl font-bold mb-12 flex items-center gap-3">
          <span className="w-8 h-1 bg-[#0f4b80] rounded-full inline-block" />
          Hospital Highlights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: 'emergency_home', title: '24/7 Emergency', desc: 'Round-the-clock critical care with immediate trauma response and specialized ICU units.' },
            { icon: 'groups', title: 'Expert Specialists', desc: 'Highly qualified medical professionals across multiple disciplines with global expertise.' },
            { icon: 'biotech', title: 'Modern Labs', desc: 'Fully automated diagnostic services providing accurate results with minimal wait times.' },
            { icon: 'health_metrics', title: 'Advanced ICU', desc: 'Equipped with state-of-the-art monitoring systems for continuous patient observation.' },
          ].map(h => (
            <div key={h.title} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#0f4b80]/10 rounded-xl flex items-center justify-center text-[#0f4b80] mb-6">
                <span className="material-symbols-outlined text-3xl">{h.icon}</span>
              </div>
              <h3 className="text-slate-900 text-xl font-bold mb-2">{h.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section className="bg-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-slate-900 text-3xl font-bold mb-2">Our Departments</h2>
              <p className="text-slate-600">Specialized treatment across all medical domains</p>
            </div>
            <Link to="/departments" className="text-[#0f4b80] font-bold flex items-center gap-1 hover:underline">
              View All <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {DEPARTMENTS.slice(0, 8).map(d => (
              <Link key={d.id} to={`/departments`}
                className="group bg-white p-6 rounded-xl hover:bg-[#0f4b80] transition-all duration-300">
                <span className="material-symbols-outlined text-4xl text-[#0f4b80] group-hover:text-white mb-4 block">{d.icon}</span>
                <h3 className="text-slate-900 font-bold group-hover:text-white">{d.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-slate-900 text-3xl font-bold">Meet Our Expert Doctors</h2>
          <Link to="/doctors" className="text-[#0f4b80] font-bold flex items-center gap-1 hover:underline">
            View All <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {DOCTORS.slice(0, 4).map(doc => (
            <div key={doc.id} className="flex flex-col group">
              <div className="relative overflow-hidden rounded-2xl mb-4 aspect-3/4 bg-slate-200">
                <img src={doc.image} alt={doc.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-[#0f4b80]/80 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/doctors/${doc.id}`}
                    className="bg-white text-[#0f4b80] px-4 py-2 rounded-lg font-bold text-sm w-full block text-center">
                    View Profile
                  </Link>
                </div>
              </div>
              <h3 className="text-slate-900 text-lg font-bold">{doc.name}</h3>
              <p className="text-[#0f4b80] text-sm font-medium">{doc.specialty}</p>
              <p className="text-slate-500 text-xs mt-1">{doc.experience} Experience</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-slate-900 text-3xl font-bold mb-12 text-center">What Our Patients Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Arjun Verma', dept: 'Cardiac Dept', text: '"The care I received at Deepthi Hospitals was exceptional. The doctors were patient and the nursing staff was incredibly kind."' },
              { name: 'Meera Krishnan', dept: 'General Health Check-up', text: '"Excellent facility with state-of-the-art diagnostic equipment. The booking process was seamless and wait times were minimal."' },
              { name: 'Sanjay Rawat', dept: 'Orthopedics', text: '"During my surgery, I felt I was in very safe hands. The post-operative care was thorough. Thank you to the entire orthopedic team."' },
            ].map(t => (
              <div key={t.name} className="bg-white p-8 rounded-2xl border border-slate-200">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="material-symbols-outlined">star</span>)}
                </div>
                <p className="text-slate-600 italic mb-6">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.dept}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
