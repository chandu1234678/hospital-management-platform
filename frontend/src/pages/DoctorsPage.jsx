import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import BackButton from '../components/BackButton.jsx'
import { doctorService } from '../services/api.js'
import { DEPARTMENTS } from '../data/mockData.js'

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="w-full aspect-4/3 bg-slate-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-1/3 mt-1" />
        <div className="flex gap-2 mt-3">
          <div className="flex-1 h-8 bg-slate-100 rounded-lg" />
          <div className="flex-1 h-8 bg-slate-200 rounded-lg" />
        </div>
      </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
                {/* Photo */}
                <div className="relative overflow-hidden aspect-4/3 bg-slate-100">
                  <img
                    src={doc.image} alt={doc.name}
                    className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                  {doc.department && (
                    <span className="absolute top-3 left-3 bg-white/90 text-[#0f4b80] text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {doc.department}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-slate-900 font-black text-base leading-tight">{doc.name}</h3>
                  <p className="text-[#0f4b80] text-xs font-semibold mt-0.5">{doc.specialty}</p>

                  <div className="flex items-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                    <span className="text-sm font-bold text-slate-700">{doc.rating}</span>
                    <span className="text-slate-400 text-xs ml-0.5">({doc.reviews})</span>
                    <span className="text-slate-300 mx-1">·</span>
                    <span className="text-slate-500 text-xs">{doc.experience}</span>
                  </div>

                  {/* Always-visible actions */}
                  <div className="flex gap-2 mt-4">
                    <Link to={`/doctors/${doc.id}`}
                      className="flex-1 py-2 border border-[#0f4b80] text-[#0f4b80] text-xs font-bold rounded-lg hover:bg-[#0f4b80]/5 transition-colors text-center">
                      View Profile
                    </Link>
                    <Link to={`/book-appointment?doctor=${doc.id}`}
                      className="flex-1 py-2 bg-[#0f4b80] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity text-center">
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
