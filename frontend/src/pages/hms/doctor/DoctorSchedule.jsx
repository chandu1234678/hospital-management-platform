import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { hmsService } from '../../../services/api.js'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' }

export default function DoctorSchedule() {
  const [schedule, setSchedule] = useState([])
  const [doctorId, setDoctorId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ day_of_week: 'Monday', start_time: '09:00', end_time: '17:00', slot_duration_minutes: 30 })

  useEffect(() => {
    hmsService.getDoctorProfile()
      .then(profile => {
        if (profile?.id) {
          setDoctorId(profile.id)
          return hmsService.getDoctorSchedule(profile.id)
        }
        return []
      })
      .then(setSchedule)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const addEntry = () => {
    const exists = schedule.find(s => s.day_of_week === form.day_of_week)
    if (exists) {
      toast.error(`Schedule for ${form.day_of_week} already exists`)
      return
    }
    setSchedule(prev => [...prev, { ...form, is_active: true, _local: true }])
    setShowAdd(false)
    setForm({ day_of_week: 'Monday', start_time: '09:00', end_time: '17:00', slot_duration_minutes: 30 })
  }

  const removeEntry = (day) => {
    setSchedule(prev => prev.filter(s => s.day_of_week !== day))
  }

  const toggleActive = (day) => {
    setSchedule(prev => prev.map(s => s.day_of_week === day ? { ...s, is_active: !s.is_active } : s))
  }

  const saveSchedule = async () => {
    if (!doctorId) return toast.error('Doctor profile not found')
    setSaving(true)
    try {
      const entries = schedule.map(({ day_of_week, start_time, end_time, slot_duration_minutes, is_active }) => ({
        day_of_week, start_time, end_time, slot_duration_minutes: Number(slot_duration_minutes), is_active,
      }))
      const saved = await hmsService.setDoctorSchedule(doctorId, entries)
      setSchedule(saved)
      toast.success('Schedule saved successfully')
    } catch {
      toast.error('Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  const activeDays = schedule.filter(s => s.is_active).length

  if (loading) return (
    <div className="p-8 text-center text-slate-400">
      <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      <p className="mt-2 text-sm">Loading schedule...</p>
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Schedule</h1>
          <p className="text-slate-500 text-sm">{activeDays} active day(s) configured</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50">
            <span className="material-symbols-outlined text-lg">add</span>
            Add Day
          </button>
          <button onClick={saveSchedule} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
            {saving
              ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
              : <span className="material-symbols-outlined text-lg">save</span>
            }
            Save Schedule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Days', value: activeDays, color: 'text-[#0f4b80] bg-[#0f4b80]/10' },
          { label: 'Off Days', value: schedule.filter(s => !s.is_active).length, color: 'text-slate-500 bg-slate-100' },
          { label: 'Total Configured', value: schedule.length, color: 'text-green-600 bg-green-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className={`text-3xl font-black ${s.color.split(' ')[0]}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Schedule list */}
      {schedule.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <span className="material-symbols-outlined text-slate-300 text-5xl">calendar_month</span>
          <p className="text-slate-500 mt-2">No schedule configured yet</p>
          <button onClick={() => setShowAdd(true)}
            className="mt-4 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90">
            Add Your First Day
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Day', 'Start Time', 'End Time', 'Slot Duration', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DAYS.filter(d => schedule.find(s => s.day_of_week === d)).map(day => {
                  const s = schedule.find(e => e.day_of_week === day)
                  return (
                    <tr key={day} className={`transition-colors ${s.is_active ? 'hover:bg-slate-50' : 'bg-slate-50/50 opacity-60'}`}>
                      <td className="px-5 py-3 font-semibold text-slate-900">{DAY_SHORT[day] || day}</td>
                      <td className="px-5 py-3 font-mono text-slate-700">{s.start_time}</td>
                      <td className="px-5 py-3 font-mono text-slate-700">{s.end_time}</td>
                      <td className="px-5 py-3 text-slate-600">{s.slot_duration_minutes} min</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {s.is_active ? 'Active' : 'Off'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleActive(day)}
                            className="text-xs font-semibold text-[#0f4b80] hover:underline">
                            {s.is_active ? 'Mark Off' : 'Activate'}
                          </button>
                          <button onClick={() => removeEntry(day)}
                            className="text-xs font-semibold text-red-500 hover:underline">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Day Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Add Schedule Day</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Day of Week</label>
                <select value={form.day_of_week} onChange={e => setForm(p => ({ ...p, day_of_week: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Start Time</label>
                  <input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">End Time</label>
                  <input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Slot Duration (minutes)</label>
                <select value={form.slot_duration_minutes} onChange={e => setForm(p => ({ ...p, slot_duration_minutes: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                  {[15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} minutes</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={addEntry}
                className="flex-1 bg-[#0f4b80] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90">
                Add Day
              </button>
              <button onClick={() => setShowAdd(false)}
                className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
