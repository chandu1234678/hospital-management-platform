import toast from 'react-hot-toast'

const REPORTS = [
  { icon: 'bar_chart', title: 'Department Report', desc: 'Patient distribution and revenue by department', color: 'bg-blue-50 text-blue-600' },
  { icon: 'bed', title: 'Bed Occupancy Report', desc: 'Current bed utilization and availability', color: 'bg-amber-50 text-amber-600' },
  { icon: 'people', title: 'Staff Attendance', desc: 'Staff attendance and shift management', color: 'bg-green-50 text-green-600' },
  { icon: 'payments', title: 'Revenue Report', desc: 'Daily, weekly and monthly revenue analysis', color: 'bg-[#0f4b80]/10 text-[#0f4b80]' },
  { icon: 'medical_information', title: 'Patient Records Archive', desc: 'Historical patient data and medical records', color: 'bg-purple-50 text-purple-600' },
  { icon: 'exit_to_app', title: 'Discharge Summary', desc: 'Patient discharge statistics and reports', color: 'bg-red-50 text-red-600' },
]

export default function AdminReports() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-500 text-sm">Generate and download hospital reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORTS.map(r => (
          <div key={r.title} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.color}`}>
              <span className="material-symbols-outlined text-2xl">{r.icon}</span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{r.title}</h3>
            <p className="text-slate-500 text-sm mb-4">{r.desc}</p>
            <div className="flex gap-2">
              <button onClick={() => toast.success(`Generating ${r.title}...`)}
                className="flex-1 py-2 bg-[#0f4b80] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
                Generate
              </button>
              <button onClick={() => toast.success(`Downloading ${r.title}...`)}
                className="px-3 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
