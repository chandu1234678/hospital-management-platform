import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal.jsx'
import { reportService } from '../../services/api.js'

const STATUS = {
  ready: 'bg-green-50 text-green-700',
  processing: 'bg-amber-50 text-amber-700',
}

export default function LabReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    reportService.getAll()
      .then(data => { setReports(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleDownload = (report) => {
    if (report.status !== 'ready') return toast.error('Report is still processing')
    reportService.download(report)
    toast.success('Downloading report...')
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Lab Reports</h2>
        <p className="text-slate-500">View and download your diagnostic reports</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-100 p-6 h-24" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 text-center">
          <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">lab_panel</span>
          <h3 className="text-slate-700 font-bold text-lg mb-1">No reports available</h3>
          <p className="text-slate-500 text-sm">Your lab reports will appear here once ready</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Report Name</th>
                <th className="px-6 py-4 hidden sm:table-cell">Type</th>
                <th className="px-6 py-4 hidden md:table-cell">Doctor</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#0f4b80]/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#0f4b80] text-lg">description</span>
                      </div>
                      <span className="font-semibold text-slate-900">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-slate-500 text-sm">{r.type}</td>
                  <td className="px-6 py-4 hidden md:table-cell text-slate-500 text-sm">{r.doctor}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{r.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${STATUS[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {r.status === 'ready' && (
                        <button onClick={() => setPreview(r)}
                          className="flex items-center gap-1 text-slate-600 font-bold text-sm hover:text-[#0f4b80] transition-colors">
                          <span className="material-symbols-outlined text-lg">visibility</span>
                          <span className="hidden sm:inline">Preview</span>
                        </button>
                      )}
                      <button onClick={() => handleDownload(r)}
                        disabled={r.status !== 'ready'}
                        className="flex items-center gap-1 text-[#0f4b80] font-bold text-sm hover:underline disabled:text-slate-300 disabled:cursor-not-allowed">
                        <span className="material-symbols-outlined text-lg">download</span>
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Report Preview">
        {preview && (
          <div className="space-y-4">
            <div className="bg-[#0f4b80]/5 rounded-xl p-5 space-y-3">
              {[
                { icon: 'description', label: 'Report', value: preview.name },
                { icon: 'category', label: 'Type', value: preview.type },
                { icon: 'person', label: 'Doctor', value: preview.doctor },
                { icon: 'calendar_today', label: 'Date', value: preview.date },
                { icon: 'check_circle', label: 'Status', value: preview.status.charAt(0).toUpperCase() + preview.status.slice(1) },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#0f4b80] text-lg">{item.icon}</span>
                  <span className="text-slate-500 text-sm w-20">{item.label}</span>
                  <span className="font-semibold text-slate-900 text-sm">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
              <span className="material-symbols-outlined text-slate-300 text-4xl block mb-2">lab_panel</span>
              <p className="text-slate-500 text-sm">Full report available as PDF download</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { handleDownload(preview); setPreview(null) }}
                className="flex-1 bg-[#0f4b80] text-white font-bold py-2.5 rounded-lg hover:opacity-90 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">download</span>
                Download PDF
              </button>
              <button onClick={() => setPreview(null)}
                className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
