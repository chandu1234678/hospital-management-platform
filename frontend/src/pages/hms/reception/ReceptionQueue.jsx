import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { hmsService } from '../../../services/api.js'

const STATUS_STYLE = {
  Waiting:   'bg-amber-100 text-amber-700',
  Called:    'bg-[#0F4C81]/10 text-[#0F4C81]',
  Done:      'bg-green-100 text-green-700',
}

export default function ReceptionQueue() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    hmsService.getAppointments()
      .then(appointments => {
        const todayAppts = appointments.filter(a =>
          a.appointment_date === today &&
          a.status !== 'CANCELLED' &&
          a.status !== 'COMPLETED'
        )
        setQueue(todayAppts.map((a, i) => ({
          token: `T-${String(i + 1).padStart(3, '0')}`,
          id: a.id,
          name: a.patient || 'Unknown',
          type: 'OPD',
          doctor: a.doctor || '—',
          department: a.department || '—',
          time: a.appointment_time || '—',
          status: a.status === 'CONFIRMED' ? 'Called' : 'Waiting',
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const callNext = () => {
    const nextIdx = queue.findIndex(q => q.status === 'Waiting')
    if (nextIdx === -1) return toast('No patients waiting')
    setQueue(prev => prev.map((q, i) => {
      if (q.status === 'Called') return { ...q, status: 'Done' }
      if (i === nextIdx) return { ...q, status: 'Called' }
      return q
    }))
    toast.success(`Calling ${queue[nextIdx].token} — ${queue[nextIdx].name}`)
  }

  const markDone = (token) => {
    setQueue(prev => prev.map(q => q.token === token ? { ...q, status: 'Done' } : q))
    toast.success(`${token} marked as done`)
  }

  const waiting = queue.filter(q => q.status === 'Waiting').length
  const called = queue.filter(q => q.status === 'Called').length
  const done = queue.filter(q => q.status === 'Done').length

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Queue Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading...' : `Live OPD token queue — ${waiting} waiting`}
          </p>
        </div>
        <button onClick={callNext}
          className="inline-flex items-center gap-2 bg-[#0F4C81] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-lg">
          <span className="material-symbols-outlined text-[18px]">campaign</span>
          Call Next Patient
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Waiting', value: waiting, color: 'text-amber-600 bg-amber-50' },
          { label: 'In Consultation', value: called, color: 'text-[#0F4C81] bg-[#0F4C81]/10' },
          { label: 'Done Today', value: done, color: 'text-green-600 bg-green-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className={`text-3xl font-black ${s.color.split(' ')[0]}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          <p className="mt-2 text-sm">Loading queue...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <span className="material-symbols-outlined text-slate-300 text-5xl">queue</span>
          <p className="text-slate-500 mt-2">No patients in queue today</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Token', 'Patient', 'Doctor', 'Dept', 'Time', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map(q => (
                  <tr key={q.token} className={`transition-colors ${q.status === 'Called' ? 'bg-[#0F4C81]/5' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3 font-black text-[#0F4C81]">{q.token}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{q.name}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{q.doctor}</td>
                    <td className="px-4 py-3 text-slate-600">{q.department}</td>
                    <td className="px-4 py-3 text-slate-600">{q.time}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[q.status]}`}>{q.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {q.status !== 'Done' && (
                          <button onClick={() => markDone(q.token)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:opacity-90">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => navigate('/hms/reception/billing', { state: { patientName: q.name, appointmentId: q.id } })}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#0f4b80] text-white text-xs font-bold rounded-lg hover:opacity-90">
                          <span className="material-symbols-outlined text-[13px]">payment</span>
                          Collect Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
