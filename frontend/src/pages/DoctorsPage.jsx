import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import BackButton from '../components/BackButton.jsx'
import { doctorService } from '../services/api.js'
import { DEPARTMENTS } from '../data/mockData.js'

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-slate-100 p-6">
      <div className="w-full aspect-3/4 bg-slate-200 rounded-xl mb-4" />
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
  )
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [searchParams] = useSearchParams()

  // Pre-fill department from URL query param (?dept=Cardiology)
  useEffect(() => {
    const deptParam = searchParams.get('dept')
    if (deptParam) setDept(deptParam)
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    doctorService.getAll({ search, department: dept }).then(data => {
      setDoctors(data)
      setLoading(false)
    })
  }, [search, dept])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12">
        <BackButton className="mb-4" />
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Our Expert Doctors</h1>
          <p className="text-slate-500">Find and book appointments with our specialist doctors</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or specialty..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none" />
          </div>
          <select value={dept} onChange={e => setDept(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] outline-none text-slate-700 min-w-[200px]">
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">person_search</span>
            <h3 className="text-slate-700 font-bold text-xl mb-2">No doctors found</h3>
            <p className="text-slate-500">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {doctors.map(doc => (
              <div key={doc.id} className="flex flex-col group">
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-3/4 bg-slate-200">
                  <img src={doc.image} alt={doc.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-[#0f4b80]/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/doctors/${doc.id}`}
                      className="bg-white text-[#0f4b80] px-4 py-2 rounded-lg font-bold text-sm w-full block text-center">
                      View Profile
                    </Link>
                  </div>
                </div>
                <h3 className="text-slate-900 text-lg font-bold">{doc.name}</h3>
                <p className="text-[#0f4b80] text-sm font-medium">{doc.specialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                  <span className="text-sm font-bold text-slate-700">{doc.rating}</span>
                  <span className="text-slate-400 text-xs">({doc.reviews} reviews)</span>
                </div>
                <p className="text-slate-500 text-xs mt-1">{doc.experience} Experience</p>
                <Link to={`/book-appointment?doctor=${doc.id}`}
                  className="mt-3 px-4 py-2 bg-[#0f4b80] text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity text-center">
                  Book Appointment
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
