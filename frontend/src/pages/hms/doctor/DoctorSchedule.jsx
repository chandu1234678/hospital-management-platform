import { useState } from 'react'
import toast from 'react-hot-toast'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']

const INITIAL = {
  'Mon-09:00': { status: 'booked', patient: 'Ananya Rao' },
  'Mon-09:30': { status: 'booked', patient: 'Ravi Shankar' },
  'Mon-10:00': { status: 'available' },
  'Mon-10:30': { status: 'blocked' },
  'Tue-09:00': { status: 'booked', patient: 'Suresh Nair' },
  'Tue-10:00': { status: 'available' },
  'Wed-09:00': { status: 'available' },
  'Wed-14:00': { status: 'booked', patient: 'Kavitha Reddy' },
  'Thu-09:00': { status: 'booked', patient: 'Meena Pillai' },
  'Fri-10:00': { status: 'available' },
  'Fri-14:30': { status: 'available' },
  'Sat-09:00': { status: 'blocked' },
}

const SLOT_STYLE = {
  booked:    'bg-[#0F4C81] text-white border-[#0F4C81]',
  available: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  blocked:   'bg-slate-100 text-slate-400 border-slate-200',
  empty:     'bg-white text-slate-300 border-slate-100 hover:border-[#0F4C81]/30',
}

export default function DoctorSchedule() {
  const [slots, setSlots] = useState(INITIAL)
  const [view, setView] = useState('week')

  const toggleSlot = (key) => {
    const current = slots[key]
    if (current?.status === 'booked') return toast('Cannot modify booked slot')
    if (current?.status === 'blocked') {
      setSlots(p => { const n = { ...p }; delete n[key]; return n })
      toast.success('Slot opened')
    } else {
      setSlots(p => ({ ...p, [key]: { status: 'blocked' } }))
      toast.success('Slot blocked')
    }
  }

  const booked = Object.values(slots).filter(s => s?.status === 'booked').length
  const available = Object.values(slots).filter(s => s?.status === 'available').length
  const blocked = Object.values(slots).filter(s => s?.status === 'blocked').length

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">Week of 16 Mar – 21 Mar 2026</p>
        </div>
        <div className="flex gap-2">
          {['week', 'list'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${view === v ? 'bg-[#0F4C81] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Booked', value: booked, color: 'text-[#0F4C81] bg-[#0F4C81]/10' },
          { label: 'Available', value: available, color: 'text-green-600 bg-green-50' },
          { label: 'Blocked', value: blocked, color: 'text-slate-500 bg-slate-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className={`text-3xl font-black ${s.color.split(' ')[0]}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {[['Booked', 'bg-[#0F4C81]'], ['Available', 'bg-green-500'], ['Blocked', 'bg-slate-300']].map(([label, dot]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${dot}`} />
            <span className="text-xs text-slate-600 font-medium">{label}</span>
          </div>
        ))}
        <p className="text-xs text-slate-400 ml-2">Click available/blocked slots to toggle</p>
      </div>

      {/* Week grid */}
      {view === 'week' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 text-left text-slate-500 font-bold uppercase tracking-wider w-20">Time</th>
                  {DAYS.map(d => (
                    <th key={d} className="px-3 py-3 text-center text-slate-700 font-bold">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {SLOTS.map(slot => (
                  <tr key={slot}>
                    <td className="px-3 py-2 text-slate-400 font-mono whitespace-nowrap">{slot}</td>
                    {DAYS.map(day => {
                      const key = `${day}-${slot}`
                      const s = slots[key]
                      const style = SLOT_STYLE[s?.status || 'empty']
                      return (
                        <td key={day} className="px-2 py-1.5 text-center">
                          <button onClick={() => toggleSlot(key)}
                            className={`w-full rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-all ${style}`}>
                            {s?.status === 'booked' ? s.patient?.split(' ')[0] : s?.status === 'blocked' ? 'Blocked' : s?.status === 'available' ? 'Open' : '—'}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-3">
          {Object.entries(slots).filter(([, s]) => s?.status === 'booked').map(([key, s]) => {
            const [day, time] = key.split('-')
            return (
              <div key={key} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81]">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{s.patient}</p>
                    <p className="text-xs text-slate-500">{day} · {time}</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#0F4C81]/10 text-[#0F4C81]">Booked</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
