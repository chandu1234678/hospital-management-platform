import { useState } from 'react'
import toast from 'react-hot-toast'
import { HMS_BILLING } from '../../../data/hmsData.js'

const STATUS_COLORS = {
  Paid: 'bg-green-100 text-green-700',
  Pending: 'bg-amber-100 text-amber-700',
  Partial: 'bg-blue-100 text-blue-700',
}

export default function AdminBilling() {
  const [search, setSearch] = useState('')
  const [invoices] = useState(HMS_BILLING)

  const filtered = invoices.filter(i =>
    i.patient.toLowerCase().includes(search.toLowerCase()) ||
    i.id.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = '₹1,10,450'
  const pendingAmount = '₹97,000'
  const paidToday = '₹13,450'

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Billing & Payments</h1>
          <p className="text-slate-500 text-sm">Manage invoices and payment records</p>
        </div>
        <button onClick={() => toast.success('New invoice form opened')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          New Invoice
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: totalRevenue, icon: 'account_balance_wallet', color: 'bg-[#0f4b80]/10 text-[#0f4b80]', trend: '+12.5% vs yesterday', up: true },
          { label: 'Pending Amount', value: pendingAmount, icon: 'pending_actions', color: 'bg-amber-100 text-amber-600', trend: '3 invoices pending', up: null },
          { label: 'Collected Today', value: paidToday, icon: 'payments', color: 'bg-green-100 text-green-600', trend: '+8.2% vs yesterday', up: true },
        ].map(s => (
          <div key={s.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase">{s.label}</span>
              <span className={`material-symbols-outlined p-2 rounded-lg ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className={`text-sm font-medium mt-1 ${s.up === true ? 'text-green-600' : 'text-slate-500'}`}>{s.trend}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search invoices by patient or ID..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                {['Invoice ID', 'Patient', 'Date', 'Type', 'Amount', 'Method', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono text-[#0f4b80] font-bold">{inv.id}</td>
                  <td className="px-5 py-4 text-sm font-semibold">{inv.patient}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{inv.date}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{inv.type}</td>
                  <td className="px-5 py-4 text-sm font-bold">{inv.amount}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{inv.method}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[inv.status]}`}>{inv.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => toast.success(`Downloading invoice ${inv.id}`)}
                        className="text-[#0f4b80] hover:underline text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">download</span>PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
