import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton.jsx'

export default function EmergencyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Emergency Banner */}
        <div className="bg-red-600 py-16 text-white text-center">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex justify-start mb-6">
              <BackButton className="text-white/70 hover:text-white" />
            </div>
            <span className="material-symbols-outlined text-6xl mb-4 block">emergency</span>
            <h1 className="text-5xl font-black mb-4">Emergency Services</h1>
            <p className="text-white/90 text-xl mb-8">Our emergency department is open 24 hours a day, 7 days a week</p>
            <a href="tel:1066"
              className="inline-flex items-center gap-3 bg-white text-red-600 font-black text-3xl px-10 py-5 rounded-2xl hover:opacity-90 transition-opacity shadow-2xl">
              <span className="material-symbols-outlined text-4xl">call</span>
              Call 1066
            </a>
            <p className="text-white/70 mt-4 text-sm">Toll-free emergency helpline</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: 'ambulance', title: 'Ambulance', desc: 'Fully equipped ambulances dispatched within minutes', action: 'Call Now', href: 'tel:1066', color: 'bg-red-50 text-red-600' },
              { icon: 'local_hospital', title: 'Emergency Room', desc: '24/7 emergency room with trauma specialists on standby', action: 'Get Directions', href: '/contact', color: 'bg-blue-50 text-blue-600' },
              { icon: 'video_call', title: 'Tele-Emergency', desc: 'Speak to an emergency doctor immediately via video', action: 'Connect Now', href: '/book-appointment', color: 'bg-green-50 text-green-600' },
            ].map(item => (
              <div key={item.title} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${item.color}`}>
                  <span className="material-symbols-outlined text-4xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm mb-5">{item.desc}</p>
                <a href={item.href}
                  className="inline-flex items-center gap-1 bg-[#0f4b80] text-white font-bold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm">
                  {item.action} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-2xl p-10 text-white">
            <h2 className="text-2xl font-bold mb-6">What to do in an emergency</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Stay Calm', desc: 'Keep yourself and the patient calm. Panic can worsen the situation.' },
                { step: '2', title: 'Call 1066', desc: 'Call our emergency helpline immediately for guidance and ambulance dispatch.' },
                { step: '3', title: 'First Aid', desc: 'Apply basic first aid if trained. Do not move the patient if spinal injury is suspected.' },
                { step: '4', title: 'Head to ER', desc: 'If possible, head directly to our emergency room at 123 Health Ave.' },
              ].map(s => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-black text-lg shrink-0">{s.step}</div>
                  <div>
                    <h4 className="font-bold mb-1">{s.title}</h4>
                    <p className="text-slate-400 text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
