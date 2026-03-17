import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Modal from '../../../components/Modal.jsx'
import { hmsService } from '../../../services/api.js'

const STATUS_COLORS = {
  SCHEDULED:  'bg-slate-100 text-slate-600',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  COMPLETED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-600',
}

export default function ReceptionAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelId, setCancelId] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [checkingIn, setCheckingIn] = useState(null)
  const [completing, setCompleting] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    hmsService.getAppointments()
      .then(setAppointments)
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }, [])

  const handleCheckin = async (id) => {
    setCheckingIn(id)
    try {
      await hmsService.checkinAppointment(id)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CONFIRMED' } : a))
      toast.success('Patient checked in')
    } catch {
      toast.error('Failed to check in patient')
    } finally {
      setCheckingIn(null)
    }
  }

  const handleComplete = async (id) => {
    setCompleting(id)
    try {
      await hmsService.completeAppointment(id)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'COMPLETED' } : a))
      toast.success('Appointment marked as completed')
    } catch {
      toast.error('Failed to complete appointment')
    } finally {
      setCompleting(null)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await hmsService.cancelAppointment(cancelId)
      setAppointments(prev => prev.map(a => a.id === cancelId ? { ...a, status: 'CANCELLED' } : a))
      toast.success('Appointment cancelled')
      setCancelId(null)
    } catch {
      toast.error('Failed to cancel appointment')
    } finally {
      setCancelling(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const filtered = appointments.filter(a => {
    const matchFilter = filter === 'ALL' ? true
      : filter === 'TODAY' ? a.appointment_date === today
      : a.status === filter
    const matchSearch = a.patient?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor?.toLowerCase().includes(search.toLowerCase()) ||
      a.department?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Appointments</h1>
          <p className="text-slate-500 text-sm">{appointments.length} total appointment(s)</p>
        </div>
        <Link to="/hms/reception/registration"
          className="inline-flex items-center gap-2 bg-[#0f4b80] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 shadow-sm self-start sm:self-auto">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          New Patient + Appointment
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient, doctor, department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'TODAY', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${filter === f ? 'bg-[#0f4b80] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          <p className="mt-2 text-sm">Loading appointments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-slate-300 text-5xl">event_busy</span>
          <p className="text-slate-500 mt-2">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[#0f4b80] font-bold shrink-0">
                  {(a.patient || 'P').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-sm">{a.patient}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                      {a.status}
                    </span>
                    {a.token_number && <span className="text-xs text-slate-400">Token #{a.token_number}</span>}
                  </div>
                  <p className="text-xs text-slate-500">{a.doctor} · {a.department} · {a.appointment_date} {a.appointment_time}</p>
                  {a.reason && <p className="text-xs text-slate-400 mt-0.5">{a.reason}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {a.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleCheckin(a.id)}
                      disabled={checkingIn === a.id}
                      className="px-3 py-1.5 bg-[#0f4b80] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
                      {checkingIn === a.id
                        ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        : null
                      }
                      Check In
                    </button>
                  )}
                  {a.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleComplete(a.id)}
                      disabled={completing === a.id}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
                      {completing === a.id
                        ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        : <span className="material-symbols-outlined text-sm">check_circle</span>
                      }
                      Complete
                    </button>
                  )}
                  {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                    <button onClick={() => setCancelId(a.id)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Appointment">
        <p className="text-slate-600 mb-6">Are you sure you want to cancel this appointment?</p>
        <div className="flex gap-3">
          <button onClick={handleCancel} disabled={cancelling}
            className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50">
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
          <button onClick={() => setCancelId(null)}
            className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50">
            Keep It
          </button>
        </div>
      </Modal>
    </div>
  )
}
