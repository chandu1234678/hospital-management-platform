import { useLocation, Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton.jsx'

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
  .page { display: flex; flex-direction: column; height: 100%; }
  /* ── Header ── */
  .header { display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 14px; border-bottom: 3px solid #0F4C81; }
  .brand-name { font-size: 22px; font-weight: 900; color: #0F4C81; }
  .brand-sub  { font-size: 10px; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
  .brand-addr { font-size: 10px; color: #94a3b8; margin-top: 4px; }
  .slip-title { text-align: right; }
  .slip-title h2 { font-size: 20px; font-weight: 900; color: #0F4C81; letter-spacing: 2px; }
  .slip-title p  { font-size: 11px; color: #64748b; margin-top: 3px; }
  .badge { display: inline-block; margin-top: 6px; padding: 3px 12px;
    border-radius: 20px; font-size: 10px; font-weight: 700;
    background: ${paid ? '#dcfce7' : '#fef9c3'}; color: ${paid ? '#15803d' : '#92400e'}; }
  /* ── Body: two columns ── */
  .body { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 18px; flex: 1; }
  .card { background: #f8fafc; border-radius: 10px; padding: 16px; }
  .card-title { font-size: 10px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
  .icon-box { width: 30px; height: 30px; background: #e0eaf5; border-radius: 7px;
    display: flex; align-items: center; justify-content: center; shrink: 0; }
  .icon-box svg { width: 16px; height: 16px; fill: #0F4C81; }
  .row-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
  .row-value { font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 1px; }
  /* ── Token box ── */
  .token-box { border: 2px dashed #0F4C81; border-radius: 10px; padding: 16px;
    text-align: center; margin-top: 18px; }
  .token-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
  .token-num   { font-size: 52px; font-weight: 900; color: #0F4C81; line-height: 1; margin: 4px 0; }
  .token-sub   { font-size: 10px; color: #94a3b8; }
  /* ── Footer ── */
  .footer { margin-top: 18px; padding-top: 12px; border-top: 1px solid #e2e8f0;
    display: flex; justify-content: space-between; align-items: center; }
  .footer p { font-size: 9px; color: #94a3b8; }
  .notice { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;
    padding: 10px 14px; margin-top: 18px; font-size: 10px; color: #92400e; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand-name">Deepthi Hospitals</div>
      <div class="brand-sub">Compassionate Care · Advanced Medicine</div>
      <div class="brand-addr">123 Health Avenue, Hyderabad — 500001 &nbsp;|&nbsp; Tel: 1-800-DEEPTHI</div>
    </div>
    <div class="slip-title">
      <h2>APPOINTMENT SLIP</h2>
      <p>Booking ID: #${appt.id}</p>
      <span class="badge">${paid ? '✓ Payment Confirmed' : 'Payment Pending'}</span>
    </div>
  </div>

  <div class="body">
    <!-- Left column -->
    <div>
      <div class="card">
        <div class="card-title">Appointment Details</div>
        <div class="row">
          <div class="icon-box"><svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg></div>
          <div><div class="row-label">Date</div><div class="row-value">${dateStr}</div></div>
        </div>
        <div class="row">
          <div class="icon-box"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg></div>
          <div><div class="row-label">Time</div><div class="row-value">${appt.time}</div></div>
        </div>
        <div class="row">
          <div class="icon-box"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>
          <div><div class="row-label">Location</div><div class="row-value">${appt.location || 'OPD Block, Ground Floor'}</div></div>
        </div>
        <div class="row">
          <div class="icon-box"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg></div>
          <div><div class="row-label">Department</div><div class="row-value">${appt.department}</div></div>
        </div>
      </div>

      ${paid ? `
      <div class="card" style="margin-top:14px;">
        <div class="card-title">Payment Info</div>
        <div class="row">
          <div class="icon-box"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg></div>
          <div><div class="row-label">Amount Paid</div><div class="row-value">₹${appt.fee || doctor?.fee || 500}</div></div>
        </div>
        ${paymentId ? `<div class="row">
          <div class="icon-box"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg></div>
          <div><div class="row-label">Payment ID</div><div class="row-value" style="font-size:11px;">${paymentId}</div></div>
        </div>` : ''}
      </div>` : ''}
    </div>

    <!-- Right column -->
    <div>
      <div class="card">
        <div class="card-title">Doctor Details</div>
        <div class="row">
          <div class="icon-box"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
          <div><div class="row-label">Consulting Doctor</div><div class="row-value">${appt.doctorName}</div></div>
        </div>
        <div class="row">
          <div class="icon-box"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg></div>
          <div><div class="row-label">Reason for Visit</div><div class="row-value">${appt.reason || 'General Consultation'}</div></div>
        </div>
      </div>

      <div class="token-box">
        <div class="token-label">Your Token Number</div>
        <div class="token-num">${String(appt.token_number || appt.tokenNumber || '—').padStart(2, '0')}</div>
        <div class="token-sub">Please wait for your token to be called</div>
      </div>

      <div class="notice">
        ⚠ Please arrive <strong>15 minutes early</strong>. Carry a valid photo ID and this slip.
        For queries call <strong>1-800-DEEPTHI</strong>.
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Deepthi Hospitals · 123 Health Avenue, Hyderabad · billing@deepthihospitals.com</p>
    <p>Printed on ${new Date().toLocaleString('en-IN')}</p>
  </div>
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
            <button
              onClick={() => printAppointmentSlip({ appt, doctor, paid, paymentId })}
              className="flex-1 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl text-center hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">print</span>
              Print Slip
            </button>
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
