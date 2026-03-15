import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { hmsService } from '../../../services/api.js'

const STATUS_STYLE = {
  OCCUPIED:    'bg-[#0F4C81] text-white border-[#0F4C81]',
  AVAILABLE:   'bg-green-50 text-green-700 border-green-200',
  MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200',
}
const STATUS_DOT = { OCCUPIED: 'bg-[#0F4C81]', AVAILABLE: 'bg-green-500', MAINTENANCE: 'bg-amber-500' }

export default function AdminBeds() {
  const [beds, setBeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [ward, setWard] = useState('All')

  useEffect(() => {
    hmsService.getBeds()
      .then(setBeds)
      .catch(() => toast.error('Failed to load beds'))
      .finally(() => setLoading(false))
  }, [])

  const wards = [...new Set(beds.map(b => b.ward))].filter(Boolean)
  const filtered = ward === 'All' ? beds : beds.filter(b => b.ward === ward)
  const counts = {
    OCCUPIED: beds.filter(b => b.status === 'OCCUPIED').length,
    AVAILABLE: beds.filter(b => b.status === 'AVAILABLE').length,
    MAINTENANCE: beds.filter(b => b.status === 'MAINTENANCE').length,
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Bed Management</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time ward and bed occupancy overview</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Occupied', key: 'OCCUPIED', color: 'text-[#0F4C81]' },
          { label: 'Available', key: 'AVAILABLE', color: 'text-green-600' },
          { label: 'Maintenance', key: 'MAINTENANCE', color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className={`text-3xl font-black ${s.color}`}>{counts[s.key]}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {Object.entries(STATUS_DOT).map(([label, dot]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${dot}`} />
              <span className="text-xs text-slate-600 font-medium capitalize">{label.toLowerCase()}</span>
            </div>
          ))}
        </div>
        <select value={ward} onChange={e => setWard(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] outline-none bg-white">
          <option value="All">All Wards</option>
          {wards.map(w => <option key={w}>{w}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          <p className="mt-2 text-sm">Loading beds...</p>
        </div>
      ) : (
        (ward === 'All' ? wards : [ward]).map(w => {
          const wardBeds = filtered.filter(b => b.ward === w)
          if (!wardBeds.length) return null
          return (
            <div key={w} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">{w}</h2>
                <span className="text-xs text-slate-500">{wardBeds.filter(b => b.status === 'AVAILABLE').length} available</span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {wardBeds.map(bed => (
                  <button key={bed.id}
                    onClick={() => bed.status === 'AVAILABLE' ? toast.success(`Bed ${bed.bed_number} selected`) : toast(`Bed ${bed.bed_number}: ${bed.status}`)}
                    className={`rounded-xl border-2 p-3 text-center transition-all hover:scale-105 ${STATUS_STYLE[bed.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    <span className="material-symbols-outlined text-[22px] block mb-1">bed</span>
                    <p className="text-xs font-bold">{bed.bed_number}</p>
                    <p className="text-[10px] mt-0.5 opacity-70 capitalize">{(bed.status || '').toLowerCase()}</p>
                  </button>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
