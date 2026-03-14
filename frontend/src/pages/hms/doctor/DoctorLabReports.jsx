import { useState } from 'react'
import toast from 'react-hot-toast'
import { HMS_LAB_QUEUE } from '../../../data/hmsData.js'

const STATUS_COLORS = { Processing: 'bg-blue-100 text-blue-700', Pending: 'bg-amber-100 text-amber-700', Ready: 'bg-green-100 text-green-700' }

export default function DoctorLabReports() {
  const [reports] = useState(HMS_LAB_QUEUE)

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Lab Reports</h1>
          <p className="text-slate-500 text-sm">Diagnostic reports for your patients</p>
        </div>
        <button onClick={() => toast.success('New lab order form opened')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          Order Test
        </button>
      </div>

      <div className="space-y-4">
        {reports.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#0f4b80]/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#0f4b80]">lab_profile</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-900">{r.test}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                </div>
                <p className="text-sm text-slate-500">Patient: {r.patient} · {r.time}</p>
              </div>
              {r.status === 'Ready' && (
                <button onClick={() => toast.success(`Downloading ${r.id}`)}
                  className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:opacity-90 shrink-0">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
