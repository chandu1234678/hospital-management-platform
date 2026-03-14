import { useLocation, Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton.jsx'

export default function AppointmentConfirmationPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const appt = state?.appointment
  const doctor = state?.doctor
  const paid = state?.paid
  const paymentId = state?.paymentId

  if (!appt) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center">
        <BackButton />
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Success header */}
        <div className="bg-[#0f4b80] p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-5xl">check_circle</span>
          </div>
          <h1 className="text-2xl font-black mb-1">Appointment Confirmed!</h1>
          <p className="text-white/80">Your booking has been successfully scheduled</p>
          <p className="text-white/60 text-sm mt-1">Booking ID: {appt.id}</p>
          {paid && (
            <div className="mt-3 inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-200 text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-sm">verified</span>
              Payment Successful
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-8 space-y-4">
          <h2 className="font-bold text-slate-900 text-lg mb-4">Appointment Details</h2>
          {[
            { icon: 'person', label: 'Doctor', value: appt.doctorName },
            { icon: 'local_hospital', label: 'Department', value: appt.department },
            { icon: 'calendar_today', label: 'Date', value: new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
            { icon: 'schedule', label: 'Time', value: appt.time },
            { icon: 'location_on', label: 'Location', value: appt.location },
            ...(paid ? [{ icon: 'payments', label: 'Fee Paid', value: `₹${appt.fee || doctor?.fee || 500}` }] : []),
            ...(paymentId ? [{ icon: 'receipt', label: 'Payment ID', value: paymentId }] : []),
          ].map(item => (
            <div key={item.label} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-[#0f4b80]/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#0f4b80]">{item.icon}</span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                <p className="font-semibold text-slate-900">{item.value}</p>
              </div>
            </div>
          ))}

          {!paid && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">info</span>
                Please arrive 15 minutes before your scheduled time. Bring a valid ID and insurance card.
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Link to="/dashboard/appointments"
              className="flex-1 bg-[#0f4b80] text-white font-bold py-3 rounded-xl text-center hover:opacity-90 transition-opacity">
              View Appointments
            </Link>
            <Link to="/"
              className="flex-1 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl text-center hover:bg-slate-50 transition-colors">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
