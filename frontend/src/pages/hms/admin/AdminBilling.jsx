import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { hmsService } from '../../../services/api.js'

const STATUS_COLORS = {
  PAID: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  PARTIAL: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-600',
}

export default function AdminBilling() {
  const [search, setSearch] = useState('')
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hmsService.getBilling()
      .then(setInvoices)
      .catch(() => toast.error('Failed to load billing data'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = invoices.filter(i =>
    (i.patient || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.bill_number || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + (i.total || 0), 0)
  const pendingAmount = invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + (i.total || 0), 0)
  const paidCount = invoices.filter(i => i.status === 'PAID').length

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: 'account_balance_wallet', color: 'bg-[#0f4b80]/10 text-[#0f4b80]', trend: `${paidCount} paid invoices` },
          { label: 'Pending Amount', value: `₹${pendingAmount.toLocaleString('en-IN')}`, icon: 'pending_actions', color: 'bg-amber-100 text-amber-600', trend: `${invoices.filter(i => i.status === 'PENDING').length} invoices pending` },
          { label: 'Total Invoices', value: invoices.length, icon: 'receipt_long', color: 'bg-green-100 text-green-600', trend: 'All time' },
        ].map(s => (
          <div key={s.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase">{s.label}</span>
              <span className={`material-symbols-outlined p-2 rounded-lg ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search invoices by patient or bill number..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <p className="mt-2 text-sm">Loading billing data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Invoice ID', 'Patient', 'Date', 'Amount', 'Method', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-[#0f4b80] font-bold">{inv.bill_number}</td>
                    <td className="px-5 py-4 text-sm font-semibold">{inv.patient || 'Unknown'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold">₹{Number(inv.total).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{inv.payment_method || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[inv.status] || 'bg-slate-100 text-slate-600'}`}>{inv.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => toast.success(`Invoice ${inv.bill_number} details`)}
                        className="text-[#0f4b80] hover:underline text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">visibility</span>View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-slate-300 text-4xl">receipt_long</span>
                <p className="text-slate-500 mt-2">No invoices found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
