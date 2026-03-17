import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../../components/Modal.jsx'
import { hmsService } from '../../../services/api.js'

const STATUS_COLORS = {
  PAID: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  PARTIAL: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-600',
}

const BLANK_ITEM = { name: '', amount: '' }
const PAYMENT_METHODS = ['CASH','CARD','UPI','RAZORPAY','INSURANCE','OTHER']

export default function AdminBilling() {
  const [search, setSearch] = useState('')
  const [invoices, setInvoices] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ patient_id: '', items: [{ ...BLANK_ITEM }], tax: '0', discount: '0', notes: '', status: 'PENDING', payment_method: '' })
  const [saving, setSaving] = useState(false)
  const [viewInv, setViewInv] = useState(null)

  useEffect(() => {
    Promise.all([hmsService.getBilling(), hmsService.getPatients()])
      .then(([bills, pts]) => { setInvoices(bills); setPatients(pts) })
      .catch(() => toast.error('Failed to load billing data'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = invoices.filter(i =>
    (i.patient || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.bill_number || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + (i.total || 0), 0)
  const pendingAmount = invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + (i.total || 0), 0)

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...BLANK_ITEM }] }))
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  const updateItem = (idx, field, val) => setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }))

  const subtotal = form.items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0)
  const tax = parseFloat(form.tax) || 0
  const discount = parseFloat(form.discount) || 0
  const total = subtotal + tax - discount

  const handleCreate = async () => {
    if (!form.patient_id) return toast.error('Select a patient')
    if (form.items.some(it => !it.name || !it.amount)) return toast.error('Fill all item fields')
    setSaving(true)
    try {
      const created = await hmsService.createBill({
        patient_id: Number(form.patient_id),
        items: JSON.stringify(form.items.map(it => ({ name: it.name, amount: parseFloat(it.amount) }))),
        subtotal, tax, discount, total,
        notes: form.notes || undefined,
        status: form.status,
      })
      // Reload to get enriched patient name
      const updated = await hmsService.getBilling()
      setInvoices(updated)
      setShowNew(false)
      setForm({ patient_id: '', items: [{ ...BLANK_ITEM }], tax: '0', discount: '0', notes: '', status: 'PENDING', payment_method: '' })
      toast.success(`Invoice ${created.bill_number} created`)
    } catch (e) {
      toast.error(e.message || 'Failed to create invoice')
    } finally { setSaving(false) }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Billing & Payments</h1>
          <p className="text-slate-500 text-sm">Manage invoices and payment records</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0f4b80] text-white rounded-xl text-sm font-semibold hover:bg-[#0d3f6e] transition-colors shadow-md shadow-blue-900/20 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: 'account_balance_wallet', color: 'bg-[#0f4b80]/10 text-[#0f4b80]', trend: `${invoices.filter(i=>i.status==='PAID').length} paid invoices` },
          { label: 'Pending Amount', value: `₹${pendingAmount.toLocaleString('en-IN')}`, icon: 'pending_actions', color: 'bg-amber-100 text-amber-600', trend: `${invoices.filter(i=>i.status==='PENDING').length} invoices pending` },
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
              <thead className="bg-slate-50 border-b border-slate-200">
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
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewInv(inv)} className="text-[#0f4b80] hover:underline text-xs font-bold">View</button>
                      </div>
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

      {/* New Invoice Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Invoice">
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Patient <span className="text-red-500">*</span></label>
            <select value={form.patient_id} onChange={e => setForm(f => ({...f, patient_id: e.target.value}))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] bg-white">
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} — {p.phone || p.email}</option>)}
            </select>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600">Bill Items <span className="text-red-500">*</span></label>
              <button onClick={addItem} className="text-xs text-[#0f4b80] font-bold hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">add</span> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input value={it.name} onChange={e => updateItem(idx, 'name', e.target.value)}
                    placeholder="Description"
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f4b80]" />
                  <input type="number" value={it.amount} onChange={e => updateItem(idx, 'amount', e.target.value)}
                    placeholder="₹"
                    className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f4b80]" />
                  {form.items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Tax (₹)</label>
              <input type="number" value={form.tax} onChange={e => setForm(f => ({...f, tax: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f4b80]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Discount (₹)</label>
              <input type="number" value={form.discount} onChange={e => setForm(f => ({...f, discount: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f4b80]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f4b80] bg-white">
                {['PENDING','PAID','PARTIAL'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Method</label>
              <select value={form.payment_method} onChange={e => setForm(f => ({...f, payment_method: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f4b80] bg-white">
                <option value="">—</option>
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
            <input value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f4b80]" />
          </div>

          {/* Total summary */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Tax</span><span>₹{tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>
            <div className="flex justify-between font-black text-slate-900 text-base pt-1 border-t border-slate-200"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={saving}
              className="flex-1 bg-[#0f4b80] text-white font-bold py-2.5 rounded-xl hover:bg-[#0d3f6e] disabled:opacity-60 transition-colors">
              {saving ? 'Creating...' : 'Create Invoice'}
            </button>
            <button onClick={() => setShowNew(false)}
              className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* View Invoice Modal */}
      <Modal open={!!viewInv} onClose={() => setViewInv(null)} title={`Invoice — ${viewInv?.bill_number}`}>
        {viewInv && (
          <div className="space-y-2">
            {[
              ['Patient', viewInv.patient],
              ['Date', viewInv.created_at ? new Date(viewInv.created_at).toLocaleDateString('en-IN') : '—'],
              ['Total', `₹${Number(viewInv.total).toLocaleString('en-IN')}`],
              ['Status', viewInv.status],
              ['Payment Method', viewInv.payment_method || '—'],
              ['Paid At', viewInv.paid_at || '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                <span className="text-sm font-medium text-slate-800">{val}</span>
              </div>
            ))}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Items</p>
              {(() => { try { return JSON.parse(viewInv.items || '[]') } catch { return [] } })().map((it, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-slate-700">{it.name}</span>
                  <span className="font-semibold">₹{it.amount}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setViewInv(null)}
              className="w-full mt-2 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50">
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
