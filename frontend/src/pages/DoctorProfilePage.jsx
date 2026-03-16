import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import BackButton from '../components/BackButton.jsx'
import { doctorService } from '../services/api.js'

const TABS = ['Overview', 'Education', 'Experience', 'Reviews']

function getNextDays(n = 5) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return { date: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) }
  })
}

export default function DoctorProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Overview')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const days = getNextDays()

  useEffect(() => {
    doctorService.getById(id).then(d => { setDoctor(d); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex flex-col min-h-screen"><Navbar />
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[#0f4b80] text-4xl">progress_activity</span>
      </div>
    </div>
  )

  if (!doctor) return (
    <div className="flex flex-col min-h-screen"><Navbar />
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <p className="text-slate-500 text-lg">Doctor not found</p>
        <Link to="/doctors" className="text-[#0f4b80] font-bold hover:underline">Back to Doctors</Link>
      </div>
    </div>
  )

  const handleBook = () => {
    if (!selectedDate || !selectedSlot) return
    navigate(`/book-appointment?doctor=${doctor.id}&date=${selectedDate}&time=${encodeURIComponent(selectedSlot)}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f7f8]">
      <Navbar />
      <main className="flex-1 px-4 md:px-12 lg:px-20 py-8 max-w-7xl mx-auto w-full">
        <div className="mb-4"><BackButton /></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Hero card */}
            <div className="bg-white p-6 rounded-xl border border-[#0f4b80]/5 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0f4b80]/10 overflow-hidden bg-slate-100">
                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-green-500 border-2 border-white w-5 h-5 rounded-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold text-slate-900">{doctor.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                    <span className="bg-[#0f4b80]/10 text-[#0f4b80] px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider">{doctor.department}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-600 font-medium">{doctor.experience} Experience</span>
                  </div>
                  <p className="flex items-center gap-1 text-slate-500 text-sm justify-center md:justify-start">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {doctor.location}
                  </p>
                  <div className="flex items-center gap-1 mt-1 justify-center md:justify-start">
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="font-bold">{doctor.rating}</span>
                    <span className="text-slate-500">({doctor.reviews} Reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-[#0f4b80]/5 overflow-hidden shadow-sm">
              <div className="flex border-b border-[#0f4b80]/5 px-4 overflow-x-auto">
                {TABS.map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                      tab === t ? 'border-[#0f4b80] text-[#0f4b80]' : 'border-transparent text-slate-500 hover:text-[#0f4b80]'
                    }`}>{t}</button>
                ))}
              </div>
              <div className="p-6">
                {tab === 'Overview' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">About {doctor.name}</h2>
                    <p className="text-slate-600 leading-relaxed">{doctor.about}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {[['2k+', 'Patients'], [doctor.experience.replace('+', ''), 'Experience'], ['15+', 'Awards'], [doctor.rating, 'Rating']].map(([v, l]) => (
                        <div key={l} className="bg-[#0f4b80]/5 p-4 rounded-lg text-center">
                          <p className="text-[#0f4b80] text-2xl font-bold">{v}</p>
                          <p className="text-xs text-slate-500 uppercase tracking-tight">{l}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tab === 'Education' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Education</h2>
                    {(doctor.education || []).map((e, i) => (
                      <div key={i} className="flex gap-4 mb-4">
                        <div className="mt-1 shrink-0 bg-[#0f4b80]/10 p-2 rounded-lg text-[#0f4b80]">
                          <span className="material-symbols-outlined">school</span>
                        </div>
                        <div>
                          <h4 className="font-bold">{e.degree}</h4>
                          <p className="text-slate-600">{e.institution}</p>
                          <p className="text-sm text-[#0f4b80] font-medium mt-1">{e.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'Experience' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Professional Experience</h2>
                    <div className="space-y-6">
                      {[
                        { title: `Senior ${doctor.specialty}`, org: 'Deepthi Hospitals, Main Branch', period: '2020 – Present' },
                        { title: doctor.specialty, org: 'City Medical Centre', period: '2016 – 2020' },
                      ].map((exp, i) => (
                        <div key={i} className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-[#0f4b80]/20">
                          <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white ${i === 0 ? 'bg-[#0f4b80]' : 'bg-[#0f4b80]/40'}`} />
                          <h4 className="font-bold">{exp.title}</h4>
                          <p className="text-slate-600">{exp.org}</p>
                          <p className={`text-sm font-medium mt-1 ${i === 0 ? 'text-[#0f4b80]' : 'text-slate-500'}`}>{exp.period}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tab === 'Reviews' && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">Patient Reviews</h2>
                    {[
                      { initials: 'JD', name: 'Jane Doe', time: '2 days ago', stars: 5, text: '"Dr. was incredibly thorough and empathetic. Took time to explain my condition in detail."' },
                      { initials: 'MS', name: 'Mark Smith', time: '1 week ago', stars: 4, text: '"Excellent experience. Minimal wait time and professional staff. Highly recommend."' },
                    ].map((r, i) => (
                      <div key={i} className={`${i < 1 ? 'border-b border-[#0f4b80]/5 pb-6 mb-6' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{r.initials}</div>
                            <div><p className="font-bold">{r.name}</p><p className="text-xs text-slate-500">{r.time}</p></div>
                          </div>
                          <div className="flex text-yellow-400">
                            {[...Array(r.stars)].map((_, j) => <span key={j} className="material-symbols-outlined text-sm">star</span>)}
                          </div>
                        </div>
                        <p className="mt-3 text-slate-600 italic">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl border border-[#0f4b80]/10 shadow-lg overflow-hidden">
              <div className="bg-[#0f4b80] p-6 text-white">
                <h3 className="text-lg font-bold">Book Appointment</h3>
                <p className="text-white/80 text-sm mt-1">Consultation fee: ₹{doctor.fee}</p>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <div>
                  <p className="text-sm font-bold mb-3">Select Date</p>
                  <div className="grid grid-cols-5 gap-2">
                    {days.map(d => (
                      <button key={d.date} onClick={() => setSelectedDate(d.date)}
                        className={`p-2 rounded-lg text-center transition-all ${
                          selectedDate === d.date ? 'bg-[#0f4b80] text-white' : 'border border-[#0f4b80]/10 hover:bg-[#0f4b80]/5'
                        }`}>
                        <p className="text-[10px] uppercase font-bold">{d.label.split(' ')[1]}</p>
                        <p className="text-lg font-bold leading-tight">{d.label.split(' ')[0]}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold mb-3">Select Time Slot</p>
                  <div className="flex flex-wrap gap-2">
                    {doctor.slots.map(slot => (
                      <button key={slot} onClick={() => setSelectedSlot(slot)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          selectedSlot === slot ? 'bg-[#0f4b80]/20 text-[#0f4b80] border-[#0f4b80]' : 'border-[#0f4b80]/10 hover:border-[#0f4b80]'
                        }`}>{slot}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleBook} disabled={!selectedDate || !selectedSlot}
                  className="w-full bg-[#0f4b80] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  Book Now
                </button>
                <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  Insurance Accepted: Aetna, Blue Cross, Cigna
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
