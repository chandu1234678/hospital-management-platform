import { useLocation, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

const HOSPITAL_LAT = 17.4318
const HOSPITAL_LNG = 78.4071
const MAP_EMBED = `https://maps.google.com/maps?q=Jubilee+Hills+Hyderabad+Hospital&t=&z=13&ie=UTF8&iwloc=&output=embed`

function printAppointmentSlip({ appt, doctor, paid, paymentId }) {
  const dateStr = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Appointment Slip</title>
<style>
  @page { size: A4 landscape; margin: 18mm 20mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 3px solid #0F4C81; }
  .brand-name { font-size: 22px; font-weight: 900; color: #0F4C81; }
  .brand-sub  { font-size: 10px; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
  .brand-addr { font-size: 10px; color: #94a3b8; margin-top: 4px; }
  .slip-title { text-align: right; }
  .slip-title h2 { font-size: 20px; font-weight: 900; color: #0F4C81; letter-spacing: 2px; }
  .slip-title p  { font-size: 11px; color: #64748b; margin-top: 3px; }
  .badge { display: inline-block; margin-top: 6px; padding: 3px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; background: ${paid ? '#dcfce7' : '#fef9c3'}; color: ${paid ? '#15803d' : '#92400e'}; }
  .body { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 18px; }
  .card { background: #f8fafc; border-radius: 10px; padding: 16px; }
  .card-title { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
  .row-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
  .row-value { font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 1px; }
  .token-box { border: 2px dashed #0F4C81; border-radius: 10px; padding: 16px; text-align: center; margin-top: 18px; }
  .token-num { font-size: 52px; font-weight: 900; color: #0F4C81; line-height: 1; margin: 4px 0; }
  .footer { margin-top: 18px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
  .footer p { font-size: 9px; color: #94a3b8; }
  .notice { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; margin-top: 18px; font-size: 10px; color: #92400e; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-name">Deepthi Hospitals</div>
      <div class="brand-sub">Compassionate Care · Advanced Medicine</div>
      <div class="brand-addr">Jubilee Hills, Hyderabad — 500033 | Tel: 1-800-DEEPTHI</div>
    </div>
    <div class="slip-title">
      <h2>APPOINTMENT SLIP</h2>
      <p>Booking ID: #${appt.id}</p>
      <span class="badge">${paid ? '✓ Payment Confirmed' : 'Payment Pending'}</span>
    </div>
  </div>
  <div class="body">
    <div>
      <div class="card">
        <div class="card-title">Appointment Details</div>
        <div class="row"><div><div class="row-label">Date</div><div class="row-value">${dateStr}</div></div></div>
        <div class="row"><div><div class="row-label">Time</div><div class="row-value">${appt.time}</div></div></div>
        <div class="row"><div><div class="row-label">Department</div><div class="row-value">${appt.department}</div></div></div>
        <div class="row"><div><div class="row-label">Location</div><div class="row-value">OPD Block, Ground Floor</div></div></div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-title">Doctor Details</div>
        <div class="row"><div><div class="row-label">Consulting Doctor</div><div class="row-value">${appt.doctorName}</div></div></div>
        <div class="row"><div><div class="row-label">Reason for Visit</div><div class="row-value">${appt.reason || 'General Consultation'}</div></div></div>
        ${paid ? `<div class="row"><div><div class="row-label">Amount Paid</div><div class="row-value">₹${appt.fee || doctor?.fee || 500}</div></div></div>` : ''}
      </div>
      <div class="token-box">
        <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Your Token Number</div>
        <div class="token-num">${String(appt.token_number || appt.tokenNumber || '—').padStart(2, '0')}</div>
        <div style="font-size:10px;color:#94a3b8;">Please wait for your token to be called</div>
      </div>
    </div>
  </div>
  <div class="notice">⚠ Please arrive <strong>15 minutes early</strong>. Carry a valid photo ID and this slip. For queries call <strong>1-800-DEEPTHI</strong>.</div>
  <div class="footer">
    <p>Deepthi Hospitals · Jubilee Hills, Hyderabad · help@deepthihospitals.com</p>
    <p>Printed on ${new Date().toLocaleString('en-IN')}</p>
  </div>
</body>
</html>`

  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;'
  document.body.appendChild(iframe)
  iframe.contentDocument.open()
  iframe.contentDocument.write(html)
  iframe.contentDocument.close()
  setTimeout(() => {
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
    setTimeout(() => document.body.removeChild(iframe), 1500)
  }, 400)
}

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

  const displayDate = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', {
    month: 'short', day: '2-digit', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#f6f7f8] flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 space-y-5">

        {/* ── Confirmed card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Appointment Confirmed!</h1>
          <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your visit has been successfully scheduled. We've sent a confirmation email with all the details to your registered address.
          </p>
          {paid && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Payment Successful {paymentId ? `· ${paymentId}` : ''}
            </div>
          )}
          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={() => printAppointmentSlip({ appt, doctor, paid, paymentId })}
              className="inline-flex items-center gap-2 bg-[#0f4b80] text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download PDF
            </button>
            <button
              onClick={() => {
                const icsContent = [
                  'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
                  `SUMMARY:Appointment — ${appt.doctorName}`,
                  `DTSTART:${appt.date.replace(/-/g, '')}T090000`,
                  `DTEND:${appt.date.replace(/-/g, '')}T100000`,
                  'LOCATION:Deepthi Hospitals, Jubilee Hills, Hyderabad',
                  `DESCRIPTION:${appt.department} consultation`,
                  'END:VEVENT', 'END:VCALENDAR',
                ].join('\r\n')
                const blob = new Blob([icsContent], { type: 'text/calendar' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = 'appointment.ics'; a.click()
                URL.revokeObjectURL(url)
              }}
              className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
              Add to Calendar
            </button>
          </div>
        </div>

        {/* ── Visit Details + Hospital Location ── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Visit Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-black text-slate-900 text-base mb-5">Visit Details</h2>

            {/* Doctor */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
              <div className="w-14 h-14 rounded-xl bg-[#0f4b80]/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#0f4b80] text-2xl">person</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#0f4b80] uppercase tracking-widest">{appt.department}</p>
                <p className="font-black text-slate-900 text-base">{appt.doctorName}</p>
                {doctor && (
                  <Link to={`/doctors/${doctor.id}`} className="text-xs text-[#0f4b80] hover:underline font-semibold">
                    View Profile
                  </Link>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1.5">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  DATE
                </div>
                <p className="font-black text-slate-900 text-sm">{displayDate}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1.5">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  TIME
                </div>
                <p className="font-black text-slate-900 text-sm">{appt.time}</p>
              </div>
            </div>

            {appt.reason && (
              <div className="mt-3 bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Reason</p>
                <p className="text-sm font-semibold text-slate-700">{appt.reason}</p>
              </div>
            )}

            {paid && (
              <div className="mt-3 bg-green-50 rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600">payments</span>
                <div>
                  <p className="text-[10px] font-bold text-green-600 uppercase">Fee Paid</p>
                  <p className="font-black text-slate-900">₹{appt.fee || doctor?.fee || 500}</p>
                </div>
              </div>
            )}
          </div>

          {/* Hospital Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-black text-slate-900 text-base mb-4">Hospital Location</h2>
            <div className="flex items-start gap-3 mb-4">
              <span className="material-symbols-outlined text-[#0f4b80] mt-0.5">location_on</span>
              <div>
                <p className="font-bold text-slate-900 text-sm">Deepthi Hospitals Main Wing</p>
                <p className="text-slate-500 text-xs mt-0.5">Block B, 4th Floor, Health City, Jubilee Hills,<br />Hyderabad - 500033</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 h-[180px] relative">
              <iframe
                title="Hospital Location"
                src={MAP_EMBED}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={`https://www.google.com/maps/search/Jubilee+Hills+Hospital+Hyderabad`}
                target="_blank" rel="noopener noreferrer"
                className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                <span className="material-symbols-outlined text-[14px] text-[#0f4b80]">open_in_new</span>
                Open in Maps
              </a>
            </div>
          </div>
        </div>

        {/* ── Manage health CTA ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-black text-slate-900">Manage your health on the go</p>
            <p className="text-slate-500 text-sm mt-0.5">Reschedule or cancel through our patient portal</p>
          </div>
          <Link to="/dashboard/appointments"
            className="shrink-0 bg-[#0f4b80] text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm whitespace-nowrap">
            View All Appointments
          </Link>
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-slate-400 text-sm pb-4">
          Need help? Contact our support at{' '}
          <a href="tel:18003337834" className="text-[#0f4b80] font-semibold hover:underline">1-800-DEEPTHI</a>
          {' '}or email{' '}
          <a href="mailto:help@deepthihospitals.com" className="text-[#0f4b80] font-semibold hover:underline">help@deepthihospitals.com</a>
        </p>
      </div>
    </div>
  )
}
