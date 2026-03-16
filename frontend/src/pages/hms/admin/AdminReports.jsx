import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '../../../services/api.js'

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom' },
]

// ── Mini Calendar ─────────────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa']

function toISO(d) {
  return d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : ''
}

function MiniCalendar({ startDate, endDate, onSelect }) {
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [hovered, setHovered] = useState(null)

  const firstDay = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()

  const prevMonth = () => setView(v => {
    const d = new Date(v.year, v.month - 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const nextMonth = () => setView(v => {
    const d = new Date(v.year, v.month + 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const handleDay = (day) => {
    const clicked = new Date(view.year, view.month, day)
    if (!startDate || (startDate && endDate)) {
      onSelect({ start: clicked, end: null })
    } else {
      if (clicked < startDate) {
        onSelect({ start: clicked, end: startDate })
      } else {
        onSelect({ start: startDate, end: clicked })
      }
    }
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="p-3 w-64">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg">
          <span className="material-symbols-outlined text-sm text-slate-600">chevron_left</span>
        </button>
        <span className="text-sm font-bold text-slate-800">{MONTH_NAMES[view.month]} {view.year}</span>
        <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg">
          <span className="material-symbols-outlined text-sm text-slate-600">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const date = new Date(view.year, view.month, day)
          const iso = toISO(date)
          const isStart = startDate && toISO(startDate) === iso
          const isEnd = endDate && toISO(endDate) === iso
          const inRange = startDate && endDate && date > startDate && date < endDate
          const isHoverRange = startDate && !endDate && hovered && date > startDate && date <= hovered
          const isToday = toISO(today) === iso
          return (
            <button key={day}
              onClick={() => handleDay(day)}
              onMouseEnter={() => setHovered(date)}
              onMouseLeave={() => setHovered(null)}
              className={`
                text-xs h-7 w-7 mx-auto rounded-full flex items-center justify-center transition-all font-medium
                ${isStart || isEnd ? 'bg-[#0f4b80] text-white' : ''}
                ${inRange || isHoverRange ? 'bg-[#0f4b80]/15 text-[#0f4b80] rounded-none' : ''}
                ${!isStart && !isEnd && !inRange && !isHoverRange ? 'hover:bg-slate-100 text-slate-700' : ''}
                ${isToday && !isStart && !isEnd ? 'ring-1 ring-[#0f4b80]' : ''}
              `}>
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const REPORTS = [
  { type: 'revenue',      icon: 'payments',           title: 'Revenue Report',          desc: 'Paid bills and collection summary',              color: 'bg-emerald-50 text-emerald-600' },
  { type: 'appointments', icon: 'event_note',          title: 'Appointments Report',     desc: 'Scheduled, completed and cancelled appointments', color: 'bg-blue-50 text-blue-600' },
  { type: 'beds',         icon: 'bed',                 title: 'Bed Occupancy Report',    desc: 'Ward-wise bed utilization and availability',      color: 'bg-amber-50 text-amber-600' },
  { type: 'patients',     icon: 'group',               title: 'Patient Records',         desc: 'Newly registered patients and demographics',      color: 'bg-[#0f4b80]/10 text-[#0f4b80]' },
  { type: 'lab',          icon: 'lab_panel',           title: 'Lab Reports Summary',     desc: 'Diagnostic tests ordered and completed',          color: 'bg-purple-50 text-purple-600' },
  { type: 'discharge',    icon: 'exit_to_app',         title: 'Discharge Summary',       desc: 'Completed appointments by department',            color: 'bg-red-50 text-red-600' },
]

// ── PDF generator ─────────────────────────────────────────────────────────────
function buildPdfContent(data) {
  const { type, period, start, end, summary, rows } = data
  const periodLabel = period === 'custom' ? `${start} to ${end}` : (PERIODS.find(p => p.value === period)?.label || period)
  const reportTitle = REPORTS.find(r => r.type === type)?.title || type
  const now = new Date().toLocaleString('en-IN')

  let summaryLines = ''
  for (const [k, v] of Object.entries(summary || {})) {
    if (typeof v === 'object') {
      summaryLines += `${k.replace(/_/g, ' ').toUpperCase()}:\n`
      for (const [sk, sv] of Object.entries(v)) {
        summaryLines += `  ${sk}: ${sv}\n`
      }
    } else {
      summaryLines += `${k.replace(/_/g, ' ').toUpperCase()}: ${typeof v === 'number' && k.includes('revenue') ? `₹${Number(v).toLocaleString('en-IN')}` : v}\n`
    }
  }

  let tableHeader = ''
  let tableRows = ''

  if (type === 'revenue') {
    tableHeader = 'Bill No.            Patient                  Amount      Method      Paid At\n' + '-'.repeat(80)
    tableRows = rows.map(r =>
      `${(r.bill_number||'').padEnd(20)}${(r.patient||'').padEnd(25)}₹${String(r.amount||0).padEnd(12)}${(r.method||'').padEnd(12)}${r.paid_at||''}`
    ).join('\n')
  } else if (type === 'appointments') {
    tableHeader = 'ID    Patient                  Doctor                   Dept            Date        Status\n' + '-'.repeat(90)
    tableRows = rows.map(r =>
      `${String(r.id||'').padEnd(6)}${(r.patient||'').padEnd(25)}${(r.doctor||'').padEnd(25)}${(r.department||'').padEnd(16)}${(r.date||'').padEnd(12)}${r.status||''}`
    ).join('\n')
  } else if (type === 'beds') {
    tableHeader = 'Ward                     Total   Occupied  Available  Occupancy%\n' + '-'.repeat(65)
    tableRows = rows.map(r =>
      `${(r.ward||'').padEnd(25)}${String(r.total||0).padEnd(8)}${String(r.occupied||0).padEnd(10)}${String(r.available||0).padEnd(11)}${r.occupancy_pct||0}%`
    ).join('\n')
  } else if (type === 'patients') {
    tableHeader = 'ID    Name                     Email                         Phone          Gender  Blood\n' + '-'.repeat(90)
    tableRows = rows.map(r =>
      `${String(r.id||'').padEnd(6)}${(r.name||'').padEnd(25)}${(r.email||'').padEnd(30)}${(r.phone||'').padEnd(15)}${(r.gender||'').padEnd(8)}${r.blood_group||''}`
    ).join('\n')
  } else if (type === 'lab') {
    tableHeader = 'ID    Patient                  Test Name                Type            Date        Status\n' + '-'.repeat(90)
    tableRows = rows.map(r =>
      `${String(r.id||'').padEnd(6)}${(r.patient||'').padEnd(25)}${(r.test_name||'').padEnd(25)}${(r.test_type||'').padEnd(16)}${(r.date||'').padEnd(12)}${r.status||''}`
    ).join('\n')
  } else if (type === 'discharge') {
    tableHeader = 'ID    Patient                  Doctor                   Department      Date\n' + '-'.repeat(75)
    tableRows = rows.map(r =>
      `${String(r.id||'').padEnd(6)}${(r.patient||'').padEnd(25)}${(r.doctor||'').padEnd(25)}${(r.department||'').padEnd(16)}${r.date||''}`
    ).join('\n')
  }

  return [
    '='.repeat(80),
    `DEEPTHI HOSPITALS — ${reportTitle.toUpperCase()}`,
    `Period: ${periodLabel}  |  From: ${start}  To: ${end}`,
    `Generated: ${now}`,
    '='.repeat(80),
    '',
    'SUMMARY',
    '-'.repeat(40),
    summaryLines,
    '',
    `DETAILS (${rows.length} records)`,
    '-'.repeat(40),
    tableHeader,
    tableRows || '  No records found for this period.',
    '',
    '='.repeat(80),
    'Deepthi Hospitals — Compassionate Care, Advanced Medicine',
    'This is a system-generated report. For queries: admin@deepthihospitals.com',
    '='.repeat(80),
  ].join('\n')
}

function downloadReport(data) {
  const content = buildPdfContent(data)
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const periodLabel = PERIODS.find(p => p.value === data.period)?.label?.replace(/\s+/g, '-') || data.period
  a.download = `Deepthi-${data.type}-report-${periodLabel}-${data.start}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminReports() {
  const [period, setPeriod] = useState('today')
  const [loading, setLoading] = useState({})
  const [results, setResults] = useState({})
  const [calOpen, setCalOpen] = useState(false)
  const [customRange, setCustomRange] = useState({ start: null, end: null })
  const calRef = useRef(null)

  // Close calendar on outside click
  useEffect(() => {
    const handler = (e) => { if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handlePeriod = (val) => {
    setPeriod(val)
    if (val === 'custom') setCalOpen(true)
    else setCalOpen(false)
  }

  const handleCalSelect = ({ start, end }) => {
    setCustomRange({ start, end })
    if (start && end) setCalOpen(false)
  }

  const customLabel = customRange.start && customRange.end
    ? `${toISO(customRange.start)} → ${toISO(customRange.end)}`
    : customRange.start ? `${toISO(customRange.start)} → ...` : 'Pick range'

  const generate = async (type) => {
    if (period === 'custom' && (!customRange.start || !customRange.end)) {
      return toast.error('Please select a date range first')
    }
    setLoading(l => ({ ...l, [type]: true }))
    try {
      let data
      if (period === 'custom') {
        data = await adminService.getReportCustom(type, toISO(customRange.start), toISO(customRange.end))
      } else {
        data = await adminService.getReport(type, period)
      }
      setResults(r => ({ ...r, [type]: data }))
      toast.success(`${REPORTS.find(r => r.type === type)?.title} generated`)
    } catch {
      toast.error('Failed to generate report')
    } finally {
      setLoading(l => ({ ...l, [type]: false }))
    }
  }

  const download = (type) => {
    const data = results[type]
    if (!data) return toast.error('Generate the report first')
    downloadReport(data)
    toast.success('Downloading report...')
  }

  const periodLabel = period === 'custom' ? customLabel : PERIODS.find(p => p.value === period)?.label

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm">Generate and download hospital reports</p>
        </div>

        {/* Period selector + calendar */}
        <div className="relative" ref={calRef}>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 flex-wrap">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => handlePeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${period === p.value ? 'bg-[#0f4b80] text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}>
                {p.value === 'custom' && period === 'custom' && customRange.start
                  ? <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">calendar_month</span>{customLabel}</span>
                  : p.label}
              </button>
            ))}
          </div>

          {/* Calendar dropdown */}
          {calOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-4 pt-3 pb-1 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-700">Select date range</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {customRange.start && !customRange.end ? 'Now pick end date' : 'Click start date'}
                </p>
              </div>
              <MiniCalendar
                startDate={customRange.start}
                endDate={customRange.end}
                onSelect={handleCalSelect}
              />
              {customRange.start && customRange.end && (
                <div className="px-3 pb-3 flex gap-2">
                  <div className="flex-1 bg-[#0f4b80]/5 rounded-lg px-3 py-2 text-xs text-center">
                    <p className="text-slate-400">From</p>
                    <p className="font-bold text-[#0f4b80]">{toISO(customRange.start)}</p>
                  </div>
                  <div className="flex-1 bg-[#0f4b80]/5 rounded-lg px-3 py-2 text-xs text-center">
                    <p className="text-slate-400">To</p>
                    <p className="font-bold text-[#0f4b80]">{toISO(customRange.end)}</p>
                  </div>
                </div>
              )}
              {customRange.start && (
                <div className="px-3 pb-3">
                  <button onClick={() => { setCustomRange({ start: null, end: null }); setCalOpen(true) }}
                    className="w-full text-xs text-slate-500 hover:text-red-500 py-1">
                    Clear selection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0f4b80]/5 border border-[#0f4b80]/10 rounded-xl px-5 py-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#0f4b80] text-lg">info</span>
        <p className="text-sm text-[#0f4b80] font-medium">Showing data for: <span className="font-black">{periodLabel}</span></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORTS.map(r => {
          const res = results[r.type]
          const isLoading = loading[r.type]
          return (
            <div key={r.type} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.color}`}>
                  <span className="material-symbols-outlined text-2xl">{r.icon}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{r.title}</h3>
                <p className="text-slate-500 text-sm mb-4">{r.desc}</p>

                {/* Summary preview */}
                {res && (
                  <div className="bg-slate-50 rounded-lg p-3 mb-4 space-y-1">
                    {Object.entries(res.summary || {}).slice(0, 3).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-slate-800">
                          {typeof v === 'object' ? Object.keys(v).length + ' categories' :
                           (k.includes('revenue') ? `₹${Number(v).toLocaleString('en-IN')}` : v)}
                        </span>
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-400 pt-1">{res.rows?.length || 0} records · {periodLabel}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => generate(r.type)} disabled={isLoading}
                    className="flex-1 py-2 bg-[#0f4b80] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5">
                    {isLoading
                      ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Generating...</>
                      : <><span className="material-symbols-outlined text-sm">bar_chart</span> Generate</>
                    }
                  </button>
                  <button onClick={() => download(r.type)} disabled={!res}
                    className="px-3 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
