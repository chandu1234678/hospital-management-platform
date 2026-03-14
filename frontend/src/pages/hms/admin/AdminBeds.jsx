import { useState } from 'react'
import toast from 'react-hot-toast'

const WARDS = ['ICU', 'General Ward A', 'General Ward B', 'Pediatrics', 'Maternity']

const generateBeds = () => {
  const beds = []
  const statuses = ['Occupied', 'Available', 'Available', 'Maintenance', 'Occupied', 'Available']
  const patients = ['Ananya Rao', 'Ravi Shankar', '', '', 'Suresh Nair', '']
  WARDS.forEach((ward, wi) => {
    for (let i = 1; i <= 6; i++) {
      const idx = (wi * 2 + i) % statuses.length
      beds.push({ id: `${ward.replace(/\s/g, '-')}-${String(i).padStart(2, '0')}`, ward, bed: i, status: statuses[idx], patient: patients[idx] || '' })
    }
  })
  return beds
}

const STATUS_STYLE = {
  Occupied:    'bg-[#0F4C81] text-white border-[#0F4C81]',
  Available:   'bg-green-50 text-green-700 border-green-200',
  Maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
}
const STATUS_DOT = { Occupied: 'bg-[#0F4C81]', Available: 'bg-green-500', Maintenance: 'bg-amber-500' }

export default function AdminBeds() {
  const [beds] = useState(generateBeds)
  const [ward, setWard] = useState('All')

  const filtered = ward === 'All' ? beds : beds.filter(b => b.ward === ward)
  const counts = { Occupied: beds.filter(b => b.status === 'Occupied').length, Available: beds.filter(b => b.status === 'Available').length, Maintenance: beds.filter(b => b.status === 'Maintenance').length }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Bed Management</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time ward and bed occupancy overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Occupied', value: counts.Occupied, color: 'text-[#0F4C81] bg-[#0F4C81]/10' },
          { label: 'Available', value: counts.Available, color: 'text-green-600 bg-green-50' },
          { label: 'Maintenance', value: counts.Maintenance, color: 'text-amber-600 bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className={`text-3xl font-black ${s.color.split(' ')[0]}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Legend + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {Object.entries(STATUS_DOT).map(([label, dot]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${dot}`} />
              <span className="text-xs text-slate-600 font-medium">{label}</span>
            </div>
          ))}
        </div>
        <select value={ward} onChange={e => setWard(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] outline-none bg-white">
          <option value="All">All Wards</option>
          {WARDS.map(w => <option key={w}>{w}</option>)}
        </select>
      </div>

      {/* Bed grid by ward */}
      {(ward === 'All' ? WARDS : [ward]).map(w => {
        const wardBeds = filtered.filter(b => b.ward === w)
        if (!wardBeds.length) return null
        return (
          <div key={w} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">{w}</h2>
              <span className="text-xs text-slate-500">{wardBeds.filter(b => b.status === 'Available').length} available</span>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {wardBeds.map(bed => (
                <button key={bed.id} onClick={() => bed.status === 'Available' ? toast.success(`Bed ${bed.id} selected`) : toast(`Bed ${bed.id}: ${bed.status}`)}
                  className={`rounded-xl border-2 p-3 text-center transition-all hover:scale-105 ${STATUS_STYLE[bed.status]}`}>
                  <span className="material-symbols-outlined text-[22px] block mb-1">bed</span>
                  <p className="text-xs font-bold">Bed {bed.bed}</p>
                  {bed.patient && <p className="text-[10px] mt-0.5 opacity-80 truncate">{bed.patient.split(' ')[0]}</p>}
                  {!bed.patient && <p className="text-[10px] mt-0.5 opacity-70">{bed.status}</p>}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
