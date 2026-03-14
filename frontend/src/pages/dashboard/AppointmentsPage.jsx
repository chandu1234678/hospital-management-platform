import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal.jsx'
import { useAppointmentStore } from '../../store/appointmentStore.js'
import { downloadInvoice } from '../../utils/invoiceGenerator.js'

const STATUS_COLORS = {
  upcoming: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
}

function openRazorpayForAppt(appt, onSuccess) {
  if (!window.Razorpay) {
    toast.error('Payment gateway not available')
    return
  }
  const fee = appt.fee || 500
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
    amount: fee * 100,
    currency: 'INR',
    name: 'Deepthi Hospitals',
    description: `Consultation — ${appt.doctorName}`,
    handler: (response) => {
      onSuccess(appt.id, response.razorpay_payment_id)
    },
    prefill: { name: appt.patientName || '' },
    theme: { color: '#0F4C81' },
    modal: {
      ondismiss: () => {
        toast.error(
          <span>
            Payment cancelled.{' '}
            <button className="underline font-bold" onClick={() => { toast.dismiss(); openRazorpayForAppt(appt, onSuccess) }}>
              Retry
            </button>
          </span>,
          { duration: 8000 }
        )
      }
    },
  }
  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (resp) => {
    const reason = resp?.error?.description || 'Payment failed'
    toast.error(
      <span>
        {reason}.{' '}
        <button className="underline font-bold" onClick={() => { toast.dismiss(); openRazorpayForAppt(appt, onSuccess) }}>
          Retry
        </button>
      </span>,
      { duration: 8000 }
    )
  })
  rzp.open()
}

export default function AppointmentsPage() {
  const { appointments, cancelAppointment, updateAppointment } = useAppointmentStore()
  const [filter, setFilter] = useState('all')
  const [cancelId, setCancelId] = useState(null)
  const [paying, setPaying] = useState(null)

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  const handleCancel = () => {
    cancelAppointment(cancelId)
    setCancelId(null)
    toast.success('Appointment cancelled.')
  }

  const handlePay = (appt) => {
    setPaying(appt.id)
    openRazorpayForAppt(appt, (id, paymentId) => {
      updateAppointment(id, { paymentStatus: 'paid', paymentId })
      setPaying(null)
      toast.success(`Payment successful! ID: ${paymentId}`)
    })
    // reset paying state if modal dismissed (handled inside openRazorpayForAppt)
    setTimeout(() => setPaying(null), 500)
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Appointments</h2>
          <p className="text-slate-500">Manage and track all your appointments</p>
        </div>
        <Link to="/book-appointment"
          className="flex items-center gap-2 bg-[#0f4b80] text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm self-start sm:self-auto">
          <span className="material-symbols-outlined text-base">add</span>
          Book New
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'upcoming', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
              filter === f ? 'bg-[#0f4b80] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0f4b80]'
            }`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200">
          <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">event_busy</span>
          <h3 className="text-slate-700 font-bold text-lg mb-1">No appointments scheduled</h3>
          <p className="text-slate-500 text-sm mb-4">Book an appointment with one of our specialists</p>
          <Link to="/book-appointment" className="bg-[#0f4b80] text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 text-sm">Book Appointment</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(appt => (
            <div key={appt.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#0f4b80]/5 border border-[#0f4b80]/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[#0f4b80] font-black text-xl">{new Date(appt.date + 'T00:00:00').getDate()}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">{new Date(appt.date + 'T00:00:00').toLocaleString('en', { month: 'short' })}</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">{appt.doctorName}</h4>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[appt.status]}`}>{appt.status}</span>
                    {appt.paymentStatus === 'paid'
                      ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 flex items-center gap-1"><span className="material-symbols-outlined text-xs">verified</span>Paid</span>
                      : appt.status === 'upcoming' && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">Payment Pending</span>
                    }
                  </div>
                  <p className="text-sm text-slate-500">{appt.department} • {appt.time}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>{appt.location}
                  </p>
                  {appt.paymentId && (
                    <p className="text-xs text-slate-400 mt-0.5">Payment ID: {appt.paymentId}</p>
                  )}
                </div>
                {appt.status === 'upcoming' && (
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {appt.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => handlePay(appt)}
                        disabled={paying === appt.id}
                        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity">
                        <span className="material-symbols-outlined text-base">payment</span>
                        {paying === appt.id ? 'Opening…' : `Pay ₹${appt.fee || 500}`}
                      </button>
                    )}
                    {appt.paymentStatus === 'paid' && (
                      <button
                        onClick={() => {
                          downloadInvoice({
                            invoiceId: `APPT-${appt.id}`,
                            date: appt.date,
                            description: `Consultation — ${appt.doctorName}`,
                            amount: appt.fee || 500,
                            status: 'Paid',
                            patientName: appt.patientName,
                            paymentId: appt.paymentId,
                          })
                          toast.success('Invoice ready to print')
                        }}
                        className="flex items-center gap-1 px-4 py-2 border border-[#0f4b80]/20 text-[#0f4b80] text-sm font-medium rounded-lg hover:bg-[#0f4b80]/5 transition-colors">
                        <span className="material-symbols-outlined text-base">download</span>
                        Invoice
                      </button>
                    )}
                    <Link to={`/book-appointment?reschedule=${appt.id}`}
                      className="px-4 py-2 bg-[#0f4b80] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors">
                      Reschedule
                    </Link>
                    <button onClick={() => setCancelId(appt.id)}
                      className="px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
                {(appt.status === 'completed' || appt.status === 'cancelled') && appt.paymentStatus === 'paid' && (
                  <button
                    onClick={() => {
                      downloadInvoice({
                        invoiceId: `APPT-${appt.id}`,
                        date: appt.date,
                        description: `Consultation — ${appt.doctorName}`,
                        amount: appt.fee || 500,
                        status: 'Paid',
                        patientName: appt.patientName,
                        paymentId: appt.paymentId,
                      })
                      toast.success('Invoice ready to print')
                    }}
                    className="flex items-center gap-1 px-4 py-2 border border-[#0f4b80]/20 text-[#0f4b80] text-sm font-medium rounded-lg hover:bg-[#0f4b80]/5 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-base">download</span>
                    Invoice
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Appointment">
        <p className="text-slate-600 mb-6">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={handleCancel}
            className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            Yes, Cancel
          </button>
          <button onClick={() => setCancelId(null)}
            className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            Keep It
          </button>
        </div>
      </Modal>

      {/* Payment History */}
      {appointments.some(a => a.paymentStatus === 'paid') && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0f4b80]">history</span>
            Payment History
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {appointments.filter(a => a.paymentStatus === 'paid').map(appt => (
                <div key={appt.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900">Consultation — {appt.doctorName}</p>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <p className="text-xs text-slate-500">{appt.department} · {appt.date}</p>
                      {appt.paymentId && <p className="text-xs text-slate-400">ID: {appt.paymentId}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-black text-slate-900">₹{(appt.fee || 500).toLocaleString('en-IN')}</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Paid</span>
                    <button
                      onClick={() => {
                        downloadInvoice({
                          invoiceId: `APPT-${appt.id}`,
                          date: appt.date,
                          description: `Consultation — ${appt.doctorName}`,
                          amount: appt.fee || 500,
                          status: 'Paid',
                          patientName: appt.patientName,
                          paymentId: appt.paymentId,
                        })
                        toast.success('Invoice ready to print')
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-[#0f4b80] border border-[#0f4b80]/20 px-3 py-1.5 rounded-lg hover:bg-[#0f4b80]/5 transition-colors">
                      <span className="material-symbols-outlined text-sm">download</span>
                      Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
