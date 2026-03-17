import { useState, useRef, useEffect } from 'react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { adminService } from '../../../services/api.js'

// ─── Constants ────────────────────────────────────────────────────────────────
const PERIODS = [
  { value: 'today',      label: 'Today' },
  { value: 'yesterday',  label: 'Yesterday' },
  { value: 'this_week',  label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'all',        label: 'All Time' },
  { value: 'custom',     label: 'Custom Range' },
]

const REPORTS = [
  { type: 'revenue',      icon: 'payments',    title: 'Revenue',         desc: 'Paid bills & collection summary',         accent: '#059669', light: '#ecfdf5', text: '#059669' },
  { type: 'appointments', icon: 'event_note',  title: 'Appointments',    desc: 'Scheduled, completed & cancelled visits', accent: '#2563eb', light: '#eff6ff', text: '#2563eb' },
  { type: 'beds',         icon: 'bed',         title: 'Bed Occupancy',   desc: 'Ward-wise utilization & availability',    accent: '#d97706', light: '#fffbeb', text: '#d97706' },
  { type: 'patients',     icon: 'group',       title: 'Patients',        desc: 'Registered patients & demographics',      accent: '#7c3aed', light: '#f5f3ff', text: '#7c3aed' },
  { type: 'lab',          icon: 'lab_panel',   title: 'Lab Reports',     desc: 'Diagnostic tests ordered & completed',    accent: '#0891b2', light: '#ecfeff', text: '#0891b2' },
  { type: 'discharge',    icon: 'exit_to_app', title: 'Discharge',       desc: 'Completed appointments by department',    accent: '#e11d48', light: '#fff1f2', text: '#e11d48' },
]

const COLUMNS = {
  revenue:      [{ key: 'bill_number', label: 'Bill No.', w: 18 }, { key: 'patient', label: 'Patient Name', w: 24 }, { key: 'amount', label: 'Amount (₹)', w: 14, num: true }, { key: 'method', label: 'Payment Method', w: 18 }, { key: 'paid_at', label: 'Paid At', w: 22 }],
  appointments: [{ key: 'patient', label: 'Patient', w: 22 }, { key: 'doctor', label: 'Doctor', w: 22 }, { key: 'department', label: 'Department', w: 18 }, { key: 'date', label: 'Date', w: 14 }, { key: 'time', label: 'Time', w: 12 }, { key: 'status', label: 'Status', w: 14, badge: true }],
  beds:         [{ key: 'ward', label: 'Ward', w: 24 }, { key: 'total', label: 'Total', w: 10, num: true }, { key: 'occupied', label: 'Occupied', w: 12, num: true }, { key: 'available', label: 'Available', w: 12, num: true }, { key: 'occupancy_pct', label: 'Occupancy %', w: 14, num: true }],
  patients:     [{ key: 'name', label: 'Full Name', w: 22 }, { key: 'email', label: 'Email', w: 28 }, { key: 'phone', label: 'Phone', w: 16 }, { key: 'gender', label: 'Gender', w: 10 }, { key: 'blood_group', label: 'Blood Group', w: 12 }, { key: 'registered', label: 'Registered On', w: 22 }],
  lab:          [{ key: 'patient', label: 'Patient', w: 22 }, { key: 'test_name', label: 'Test Name', w: 26 }, { key: 'test_type', label: 'Type', w: 16 }, { key: 'date', label: 'Date', w: 14 }, { key: 'status', label: 'Status', w: 14, badge: true }, { key: 'remarks', label: 'Remarks', w: 32 }],
  discharge:    [{ key: 'patient', label: 'Patient', w: 22 }, { key: 'doctor', label: 'Doctor', w: 22 }, { key: 'department', label: 'Department', w: 20 }, { key: 'date', label: 'Discharge Date', w: 16 }],
}

const STATUS_STYLE = {
  COMPLETED: 'bg-emerald-100 text-emerald-700', SCHEDULED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-600',         PENDING:   'bg-amber-100 text-amber-700',
  ACTIVE:    'bg-emerald-100 text-emerald-700', EXPIRED:   'bg-slate-100 text-slate-500',
}

const PIE_COLORS = ['#0f4b80', '#2563eb', '#059669', '#d97706', '#7c3aed', '#e11d48']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_NAMES   = ['Su','Mo','Tu','We','Th','Fr','Sa']

function toISO(d) {
  if (!d) return ''
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ startDate, endDate, onSelect }) {
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [hovered, setHovered] = useState(null)
  const firstDay = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const go = (n) => setView(v => { const d = new Date(v.year, v.month + n, 1); return { year: d.getFullYear(), month: d.getMonth() } })
  const pick = (day) => {
    const c = new Date(view.year, view.month, day)
    if (!startDate || (startDate && endDate)) return onSelect({ start: c, end: null })
    onSelect(c < startDate ? { start: c, end: startDate } : { start: startDate, end: c })
  }
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  return (
    <div className="p-4 select-none">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => go(-1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>
        <span className="text-sm font-bold text-slate-800">{MONTH_NAMES[view.month]} {view.year}</span>
        <button onClick={() => go(1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`_${i}`} />
          const dt = new Date(view.year, view.month, day)
          const iso = toISO(dt)
          const isSt = startDate && toISO(startDate) === iso
          const isEn = endDate && toISO(endDate) === iso
          const inRng = startDate && endDate && dt > startDate && dt < endDate
          const inHov = startDate && !endDate && hovered && dt > startDate && dt <= hovered
          const isTdy = toISO(today) === iso
          return (
            <button key={day} onClick={() => pick(day)} onMouseEnter={() => setHovered(dt)} onMouseLeave={() => setHovered(null)}
              className={[
                'h-8 w-8 mx-auto text-xs font-medium flex items-center justify-center transition-all',
                isSt || isEn ? 'bg-[#0f4b80] text-white rounded-full shadow' : '',
                inRng || inHov ? 'bg-[#0f4b80]/10 text-[#0f4b80]' : '',
                !isSt && !isEn && !inRng && !inHov ? 'hover:bg-slate-100 text-slate-700 rounded-full' : '',
                isTdy && !isSt && !isEn ? 'ring-2 ring-[#0f4b80]/40 rounded-full' : '',
              ].join(' ')}>
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Excel Export ─────────────────────────────────────────────────────────────
function exportExcel(data, periodLabel, meta) {
  const cols = COLUMNS[data.type] || []
  const wb = XLSX.utils.book_new()
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
  const totalCols = cols.length + 1
  const rows = []

  rows.push(['DEEPTHI HOSPITALS — OFFICIAL REPORT'])
  rows.push([meta.title.toUpperCase()])
  rows.push([`Period: ${periodLabel}`])
  rows.push([`Date Range: ${data.start || '—'}  to  ${data.end || '—'}`])
  rows.push([`Generated on: ${now}`])
  rows.push([])
  rows.push(['SUMMARY'])

  const summary = data.summary || {}
  for (const [k, v] of Object.entries(summary)) {
    if (typeof v !== 'object') {
      const label = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const val = (k.toLowerCase().includes('revenue') || k.toLowerCase().includes('amount'))
        ? `INR ${Number(v).toLocaleString('en-IN')}` : String(v)
      rows.push([label, val])
    }
  }
  for (const [k, v] of Object.entries(summary)) {
    if (typeof v === 'object' && v !== null) {
      rows.push([])
      rows.push([k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())])
      for (const [sk, sv] of Object.entries(v)) rows.push([`  ${sk}`, String(sv)])
    }
  }
  rows.push([])
  rows.push(['S.No.', ...cols.map(c => c.label)])

  const dataRows = data.rows || []
  if (dataRows.length === 0) {
    rows.push(['No data available for this period.'])
  } else {
    dataRows.forEach((row, idx) => {
      rows.push([idx + 1, ...cols.map(c => {
        const v = row[c.key]
        if (v === null || v === undefined) return ''
        if (c.num) return Number(v) || 0
        return String(v)
      })])
    })
  }
  rows.push([])
  rows.push([`Total Records: ${dataRows.length}`])
  rows.push(['This report is system-generated by Deepthi Hospitals HMS.'])

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 7 }, ...cols.map(c => ({ wch: Math.max(c.w || 18, 14) }))]
  const merges = []
  for (let r = 0; r < 5; r++) merges.push({ s: { r, c: 0 }, e: { r, c: totalCols - 1 } })
  ws['!merges'] = merges
  XLSX.utils.book_append_sheet(wb, ws, meta.title.slice(0, 31))
  const safeDate = (data.start || toISO(new Date())).replace(/\//g, '-')
  XLSX.writeFile(wb, `Deepthi-${data.type}-${safeDate}.xlsx`)
}

// ─── Print HTML ───────────────────────────────────────────────────────────────
function buildPrintHTML(data, periodLabel, meta) {
  const cols = COLUMNS[data.type] || []
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'medium' })
  const summaryFlat = Object.entries(data.summary || {}).filter(([, v]) => typeof v !== 'object')
  const summaryNested = Object.entries(data.summary || {}).filter(([, v]) => typeof v === 'object')
  const statusBadge = (val) => {
    const map = { COMPLETED: '#dcfce7|#15803d', SCHEDULED: '#dbeafe|#1d4ed8', CANCELLED: '#fee2e2|#dc2626', PENDING: '#fef3c7|#b45309', ACTIVE: '#dcfce7|#15803d', EXPIRED: '#f1f5f9|#64748b' }
    const [bg, color] = (map[val] || '#f1f5f9|#475569').split('|')
    return `<span style="background:${bg};color:${color};padding:2px 10px;border-radius:999px;font-size:10px;font-weight:700">${val || '—'}</span>`
  }
  const tableRows = (data.rows || []).map((row, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:9px 14px;color:#94a3b8;font-size:11px;border-bottom:1px solid #f1f5f9">${i + 1}</td>
      ${cols.map(c => `<td style="padding:9px 14px;font-size:12px;color:#334155;border-bottom:1px solid #f1f5f9;white-space:nowrap">
        ${c.badge ? statusBadge(row[c.key]) : (row[c.key] ?? '—')}</td>`).join('')}
    </tr>`).join('')

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Deepthi Hospitals — ${meta.title}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;background:#fff;color:#1e293b;padding:32px 40px}@media print{body{padding:16px 20px}@page{margin:1cm;size:A4 landscape}}</style>
  </head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #0f4b80;margin-bottom:28px">
    <div>
      <div style="font-size:24px;font-weight:900;color:#0f4b80">Deepthi Hospitals</div>
      <div style="font-size:12px;color:#64748b;margin-top:3px">Compassionate Care, Advanced Medicine</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:2px">admin@deepthihospitals.com</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:18px;font-weight:900;color:#1e293b">${meta.title}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px">Period: <strong style="color:#0f4b80">${periodLabel}</strong></div>
      <div style="font-size:11px;color:#94a3b8">${data.start || ''} — ${data.end || ''}</div>
      <div style="font-size:10px;color:#94a3b8;margin-top:4px">Generated: ${now}</div>
    </div>
  </div>
  ${summaryFlat.length > 0 ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:24px">
    ${summaryFlat.map(([k, v]) => `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px">
      <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;font-weight:600">${k.replace(/_/g,' ')}</div>
      <div style="font-size:22px;font-weight:900;color:#0f4b80;margin-top:4px">${k.includes('revenue') ? `₹${Number(v).toLocaleString('en-IN')}` : v}</div>
    </div>`).join('')}</div>` : ''}
  ${summaryNested.length > 0 ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:24px">
    ${summaryNested.map(([k, v]) => `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px">
      <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:10px">${k.replace(/_/g,' ')}</div>
      ${Object.entries(v).map(([sk, sv]) => `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">${statusBadge(sk)}<span style="font-weight:700;font-size:13px">${sv}</span></div>`).join('')}
    </div>`).join('')}</div>` : ''}
  <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px">
    <div style="padding:14px 20px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between">
      <span style="font-weight:700;font-size:13px">Detailed Records</span>
      <span style="font-size:11px;color:#94a3b8">${(data.rows||[]).length} records</span>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:#0f4b80">
        <th style="padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#fff">#</th>
        ${cols.map(c => `<th style="padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#fff;white-space:nowrap">${c.label}</th>`).join('')}
      </tr></thead>
      <tbody>${tableRows || `<tr><td colspan="${cols.length+1}" style="text-align:center;padding:32px;color:#94a3b8">No records found</td></tr>`}</tbody>
    </table>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;padding-top:12px;border-top:1px solid #e2e8f0">
    <span>Deepthi Hospitals — Confidential System Report</span><span>Generated: ${now}</span>
  </div></body></html>`
}

// ─── Chart component — picks the right chart for each report type ─────────────
function ReportChart({ data, meta }) {
  const rows = data.rows || []
  const summary = data.summary || {}

  // Revenue → area chart of amounts
  if (data.type === 'revenue') {
    const chartData = rows.slice(0, 20).map((r, i) => ({ name: `#${i+1}`, amount: Number(r.amount) || 0 }))
    if (chartData.length === 0) return null
    return (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
          <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Area type="monotone" dataKey="amount" stroke="#059669" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#059669' }} />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  // Appointments → bar chart by status
  if (data.type === 'appointments') {
    const byStatus = summary.by_status || {}
    const chartData = Object.entries(byStatus).map(([name, value]) => ({ name, value }))
    if (chartData.length === 0) return null
    const colors = { SCHEDULED: '#2563eb', COMPLETED: '#059669', CANCELLED: '#e11d48', PENDING: '#d97706' }
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, i) => <Cell key={i} fill={colors[entry.name] || '#0f4b80'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Beds → horizontal bar chart
  if (data.type === 'beds') {
    const chartData = rows.map(r => ({ name: r.ward, occupied: Number(r.occupied)||0, available: Number(r.available)||0 }))
    if (chartData.length === 0) return null
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={55} />
          <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="occupied" name="Occupied" fill="#0f4b80" radius={[0, 4, 4, 0]} />
          <Bar dataKey="available" name="Available" fill="#bfdbfe" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Lab → pie chart by status
  if (data.type === 'lab') {
    const byStatus = summary.by_status || {}
    const chartData = Object.entries(byStatus).map(([name, value]) => ({ name, value }))
    if (chartData.length === 0) return null
    return (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
            {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // Patients → bar chart by gender or blood group
  if (data.type === 'patients') {
    const byGender = summary.by_gender || {}
    const chartData = Object.entries(byGender).map(([name, value]) => ({ name, value }))
    if (chartData.length === 0) return null
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }} barSize={50}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Discharge → bar chart by department
  if (data.type === 'discharge') {
    const byDept = summary.by_department || {}
    const chartData = Object.entries(byDept).slice(0, 8).map(([name, value]) => ({ name: name.length > 12 ? name.slice(0,12)+'…' : name, value }))
    if (chartData.length === 0) return null
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Bar dataKey="value" fill="#e11d48" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return null
}

// ─── Full-Screen Report Viewer ────────────────────────────────────────────────
function ReportViewer({ data, meta, periodLabel, onClose }) {
  const cols = COLUMNS[data.type] || []
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'medium' })
  const summaryFlat   = Object.entries(data.summary || {}).filter(([, v]) => typeof v !== 'object')
  const summaryNested = Object.entries(data.summary || {}).filter(([, v]) => typeof v === 'object')
  const hasChart = ReportChart({ data, meta }) !== null

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=1200,height=900')
    win.document.write(buildPrintHTML(data, periodLabel, meta))
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#0f4b80] transition-colors">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              Reports
            </button>
            <span className="text-slate-200 text-lg">|</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: meta.light }}>
              <span className="material-symbols-outlined text-base" style={{ color: meta.accent }}>{meta.icon}</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">{meta.title}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{periodLabel} · {data.rows?.length || 0} records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { exportExcel(data, periodLabel, meta); toast.success('Excel downloaded') }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors">
              <span className="material-symbols-outlined text-base">table_view</span>
              Export Excel
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f4b80] hover:bg-[#0d3f6e] text-white text-xs font-bold transition-colors">
              <span className="material-symbols-outlined text-base">print</span>
              Print / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

          {/* Letterhead */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1" style={{ background: meta.accent }} />
            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xl font-black text-[#0f4b80]">Deepthi Hospitals</p>
                <p className="text-slate-400 text-xs mt-0.5">Compassionate Care, Advanced Medicine · admin@deepthihospitals.com</p>
              </div>
              <div className="sm:text-right">
                <p className="text-lg font-black text-slate-900">{meta.title}</p>
                <div className="flex sm:justify-end items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: meta.light, color: meta.accent }}>{periodLabel}</span>
                  {data.start && <span className="text-xs text-slate-400">{data.start} — {data.end}</span>}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Generated: {now}</p>
              </div>
            </div>
          </div>

          {/* Stats + Chart row */}
          <div className={`grid gap-5 ${hasChart ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>
            {/* Summary stats */}
            {summaryFlat.length > 0 && (
              <div className={`${hasChart ? 'lg:col-span-2' : ''} grid grid-cols-2 gap-3 content-start`}>
                {summaryFlat.map(([k, v]) => (
                  <div key={k} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{k.replace(/_/g,' ')}</p>
                    <p className="text-2xl font-black" style={{ color: meta.accent }}>
                      {k.includes('revenue') ? `₹${Number(v).toLocaleString('en-IN')}` : v}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Chart */}
            {hasChart && (
              <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="text-sm font-black text-slate-800 mb-4">Visual Overview</p>
                <ReportChart data={data} meta={meta} />
              </div>
            )}
          </div>

          {/* Breakdown cards */}
          {summaryNested.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summaryNested.map(([k, v]) => (
                <div key={k} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">{k.replace(/_/g,' ')}</p>
                  <div className="space-y-3">
                    {Object.entries(v).map(([sk, sv]) => {
                      const total = Object.values(v).reduce((a, b) => a + b, 0)
                      const pct = total ? Math.round(sv / total * 100) : 0
                      return (
                        <div key={sk}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_STYLE[sk] || 'bg-slate-100 text-slate-600'}`}>{sk}</span>
                            <span className="text-sm font-black text-slate-800">{sv} <span className="text-xs font-normal text-slate-400">({pct}%)</span></span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: meta.accent }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Data table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Detailed Records</h3>
                <p className="text-xs text-slate-400 mt-0.5">All entries for the selected period</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                {(data.rows||[]).length} rows
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ background: '#0f4b80' }}>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-white/60 tracking-wider w-12">#</th>
                    {cols.map(c => (
                      <th key={c.key} className="px-5 py-3.5 text-left text-[11px] font-bold text-white tracking-wider whitespace-nowrap">{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.rows||[]).length === 0 ? (
                    <tr><td colSpan={cols.length + 1} className="text-center py-16 text-slate-400">
                      <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">inbox</span>
                      No records found for this period
                    </td></tr>
                  ) : (data.rows||[]).map((row, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                      <td className="px-5 py-3 text-xs text-slate-400 font-medium">{idx + 1}</td>
                      {cols.map(c => (
                        <td key={c.key} className="px-5 py-3 text-slate-700 whitespace-nowrap text-sm">
                          {c.badge
                            ? <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[row[c.key]] || 'bg-slate-100 text-slate-600'}`}>{row[c.key] || '—'}</span>
                            : (row[c.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(data.rows||[]).length > 0 && (
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex justify-between items-center">
                <p className="text-xs text-slate-400">Showing all {(data.rows||[]).length} records</p>
                <p className="text-xs text-slate-400">Deepthi Hospitals — Confidential</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminReports() {
  const [period, setPeriod]           = useState('this_month')
  const [loading, setLoading]         = useState({})
  const [results, setResults]         = useState({})
  const [viewer, setViewer]           = useState(null)
  const [calOpen, setCalOpen]         = useState(false)
  const [customRange, setCustomRange] = useState({ start: null, end: null })
  const calRef = useRef(null)

  useEffect(() => {
    const h = (e) => { if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handlePeriod = (val) => { setPeriod(val); if (val === 'custom') setCalOpen(true) }

  const handleCalSelect = ({ start, end }) => {
    setCustomRange({ start, end })
    if (start && end) setCalOpen(false)
  }

  const customLabel = customRange.start && customRange.end
    ? `${toISO(customRange.start)} – ${toISO(customRange.end)}`
    : customRange.start ? `${toISO(customRange.start)} → pick end` : 'Pick range'

  const periodLabel = period === 'custom' ? customLabel : PERIODS.find(p => p.value === period)?.label

  const generate = async (type) => {
    if (period === 'custom' && (!customRange.start || !customRange.end))
      return toast.error('Please select a complete date range first')
    setLoading(l => ({ ...l, [type]: true }))
    try {
      const data = period === 'custom'
        ? await adminService.getReportCustom(type, toISO(customRange.start), toISO(customRange.end))
        : await adminService.getReport(type, period)
      setResults(r => ({ ...r, [type]: data }))
      const meta = REPORTS.find(r => r.type === type)
      setViewer({ data, meta })
    } catch {
      toast.error('Failed to generate report')
    } finally {
      setLoading(l => ({ ...l, [type]: false }))
    }
  }

  if (viewer) {
    return <ReportViewer data={viewer.data} meta={viewer.meta} periodLabel={periodLabel} onClose={() => setViewer(null)} />
  }

  return (
    <div className="p-4 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Generate, view and export hospital reports</p>
        </div>

        {/* Period selector */}
        <div className="relative" ref={calRef}>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm flex-wrap">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => handlePeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                  ${period === p.value ? 'bg-[#0f4b80] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                {p.value === 'custom' && period === 'custom' && customRange.start
                  ? <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">calendar_month</span>{customLabel}</span>
                  : p.label}
              </button>
            ))}
          </div>

          {calOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden w-72">
              <div className="px-4 pt-3 pb-2 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-bold text-slate-700">Custom Date Range</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {customRange.start && !customRange.end ? '✓ Start selected — pick end date' : 'Click to select start date'}
                </p>
              </div>
              <MiniCalendar startDate={customRange.start} endDate={customRange.end} onSelect={handleCalSelect} />
              {customRange.start && customRange.end && (
                <div className="px-4 pb-3 flex gap-2">
                  <div className="flex-1 bg-[#0f4b80]/5 border border-[#0f4b80]/10 rounded-lg px-3 py-2 text-center">
                    <p className="text-[10px] text-slate-400 font-medium">FROM</p>
                    <p className="text-xs font-black text-[#0f4b80]">{toISO(customRange.start)}</p>
                  </div>
                  <div className="flex-1 bg-[#0f4b80]/5 border border-[#0f4b80]/10 rounded-lg px-3 py-2 text-center">
                    <p className="text-[10px] text-slate-400 font-medium">TO</p>
                    <p className="text-xs font-black text-[#0f4b80]">{toISO(customRange.end)}</p>
                  </div>
                </div>
              )}
              {customRange.start && (
                <div className="px-4 pb-3">
                  <button onClick={() => setCustomRange({ start: null, end: null })}
                    className="w-full text-xs text-slate-400 hover:text-red-500 py-1 transition-colors">
                    Clear selection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active period banner */}
      <div className="flex items-center gap-3 bg-[#0f4b80]/5 border border-[#0f4b80]/10 rounded-xl px-5 py-3">
        <span className="material-symbols-outlined text-[#0f4b80] text-lg">schedule</span>
        <p className="text-sm text-[#0f4b80]">
          Reporting period: <span className="font-black">{periodLabel}</span>
        </p>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {REPORTS.map(r => {
          const res = results[r.type]
          const isLoading = loading[r.type]
          const flatSummary = res ? Object.entries(res.summary || {}).filter(([,v]) => typeof v !== 'object') : []
          return (
            <div key={r.type} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="h-1" style={{ background: r.accent }} />
              <div className="p-6">
                {/* Card header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: r.light }}>
                    <span className="material-symbols-outlined text-xl" style={{ color: r.accent }}>{r.icon}</span>
                  </div>
                  {res && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>Ready
                    </span>
                  )}
                </div>

                <h3 className="font-black text-slate-900 text-base mb-1">{r.title}</h3>
                <p className="text-slate-400 text-xs mb-5 leading-relaxed">{r.desc}</p>

                {/* Summary preview */}
                {res && flatSummary.length > 0 && (
                  <div className="rounded-xl p-3 mb-5 space-y-2 border" style={{ background: r.light, borderColor: `${r.accent}20` }}>
                    {flatSummary.slice(0, 3).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 capitalize">{k.replace(/_/g,' ')}</span>
                        <span className="text-xs font-black text-slate-800">
                          {k.includes('revenue') ? `₹${Number(v).toLocaleString('en-IN')}` : v}
                        </span>
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-slate-200/60 flex justify-between">
                      <span className="text-[10px] text-slate-400">{res.rows?.length || 0} records</span>
                      <span className="text-[10px] text-slate-400">{periodLabel}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => generate(r.type)} disabled={isLoading}
                    className="flex-1 py-2.5 text-white text-xs font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all shadow-sm hover:opacity-90"
                    style={{ background: r.accent }}>
                    {isLoading
                      ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Generating...</>
                      : <><span className="material-symbols-outlined text-sm">bar_chart</span>Generate</>}
                  </button>
                  {res && (
                    <button onClick={() => setViewer({ data: res, meta: r })}
                      title="View full report"
                      className="w-10 h-10 flex items-center justify-center border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-[#0f4b80] transition-colors">
                      <span className="material-symbols-outlined text-base">open_in_full</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
