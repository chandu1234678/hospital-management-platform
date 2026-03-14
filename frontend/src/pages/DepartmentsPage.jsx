import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import BackButton from '../components/BackButton.jsx'
import { DEPARTMENTS } from '../data/mockData.js'

export default function DepartmentsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12">
        <div className="mb-10">
          <BackButton className="mb-3" />
          <h1 className="text-3xl font-black text-slate-900 mb-2">Our Departments</h1>
          <p className="text-slate-500">Specialized treatment across all medical domains</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DEPARTMENTS.map(d => (
            <div key={d.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-[#0f4b80]/10 rounded-xl flex items-center justify-center text-[#0f4b80] mb-5 group-hover:bg-[#0f4b80] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">{d.icon}</span>
              </div>
              <h3 className="text-slate-900 text-lg font-bold mb-2">{d.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{d.desc}</p>
              <Link to={`/doctors?dept=${d.name}`}
                className="text-[#0f4b80] text-sm font-bold hover:underline flex items-center gap-1">
                View Doctors <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
