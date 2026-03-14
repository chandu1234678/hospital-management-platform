import { useState } from 'react'
import toast from 'react-hot-toast'
import { HMS_BILLING } from '../../../data/hmsData.js'

const STATUS_COLORS = { Paid: 'bg-green-100 text-green-700', Pending: 'bg-amber-100 text-amber-700', Partial: 'bg-blue-100 text-blue-700' }

export default function ReceptionBilling() {
  const [invoices] = useState(HMS_BILLING)
  const [search, setSearch] = useState('')

  const filtered = invoices.filter(i => i.patient.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Billing & Payments</h1>
          <p className="text-slate-500 text-sm">Process payments and manage invoices</p>
        </div>
        <button onClick={() => toast.success('New invoice form opened')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          New Invoice
        </button>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient name..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none" />
      </div>

      <div className="space-y-3">
        {filtered.map(inv => (
          <div key={inv.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-bold text-slate-900">{inv.patient}</p>
                  <span className="text-xs font-mono text-[#0f4b80]">{inv.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[inv.status]}`}>{inv.status}</span>
                </div>
                <p className="text-sm text-slate-500">{inv.type} · {inv.date}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <p className="text-xl font-black text-slate-900">{inv.amount}</p>
                {inv.status === 'Pending' && (
                  <button onClick={() => toast.success(`Processing payment for ${inv.patient}`)}
                    className="px-4 py-2 bg-[#0f4b80] text-white text-xs font-bold rounded-lg hover:opacity-90">
                    Collect Payment
                  </button>
                )}
                <button onClick={() => toast.success(`Downloading invoice ${inv.id}`)}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
                  <span className="material-symbols-outlined text-sm">download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
