import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { hmsService } from '../../../services/api.js'

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID

const STATUS_COLORS = {
  PAID:    'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  PARTIAL: 'bg-blue-100 text-blue-700',
}

function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export default function ReceptionBilling() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [paying, setPaying] = useState(null)
  const [markingPaid, setMarkingPaid] = useState(null)
  const [newBillModal, setNewBillModal] = useState(false)
  const [newBill, setNewBill] = useState({ patient_id: '', description: '', amount: '', payment_method: 'CASH' })
  const [savingBill, setSavingBill] = useState(false)
  const [patients, setPatients] = useState([])
  const location = useLocation()

  // If navigated from queue with a patient context, pre-filter
  useEffect(() => {
    if (location.state?.patientName) {
      setSearch(location.state.patientName)
      setFilter('PENDING')
    }
  }, [location.state])

  const fetchInvoices = useCallback(() => {
    hmsService.getBilling()
      .then(data => {
        setInvoices(data.map(b => {
          let items = []
          try { items = JSON.parse(b.items || '[]') } catch {}
          return {
            ...b,
            patientName: b.patient || 'Unknown',
            desc: items.length > 0 ? items.map(i => i.name).join(', ') : 'Medical Services',
            displayAmount: `₹${(b.total || 0).toLocaleString('en-IN')}`,
            displayDate: b.created_at
              ? new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—',
          }
        }))
      })
      .catch(() => toast.error('Failed to load billing data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchInvoices()
    hmsService.getPatients().then(setPatients).catch(() => {})
  }, [fetchInvoices])

  // ── Razorpay online payment ──────────────────────────────────────────────────
  const handleCollectPayment = async (inv) => {
    setPaying(inv.id)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Razorpay SDK failed to load')

      const order = await hmsService.createPaymentOrder(inv.id)

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: RAZORPAY_KEY || order.key_id,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Deepthi Hospitals',
          description: inv.desc,
          order_id: order.order_id,
          prefill: { name: inv.patientName },
          theme: { color: '#0f4b80' },
          handler: async (response) => {
            try {
              await hmsService.verifyPayment(inv.id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              setInvoices(prev => prev.map(i => i.id === inv.id
                ? { ...i, status: 'PAID', displayDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
                : i))
              toast.success(`Payment collected for ${inv.patientName}`)
              resolve()
            } catch (e) {
              reject(e)
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        })
        rzp.open()
      })
    } catch (err) {
      if (err.message !== 'Payment cancelled') toast.error(err.message || 'Payment failed')
    } finally {
      setPaying(null)
    }
  }

  // ── Mark paid manually (cash/UPI) ────────────────────────────────────────────
  const handleMarkPaid = async (inv, method = 'CASH') => {
    setMarkingPaid(inv.id)
    try {
      await hmsService.updateBill(inv.id, {
        status: 'PAID',
        payment_method: method,
        paid_at: new Date().toISOString(),
      })
      setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'PAID' } : i))
      toast.success(`Marked as paid (${method})`)
    } catch {
      toast.error('Failed to update payment status')
    } finally {
      setMarkingPaid(null)
    }
  }

  // ── Create new bill ──────────────────────────────────────────────────────────
  const handleCreateBill = async () => {
    if (!newBill.patient_id || !newBill.amount) return toast.error('Patient and amount are required')
    setSavingBill(true)
    try {
      const amt = parseFloat(newBill.amount)
      await hmsService.createBill({
        patient_id: Number(newBill.patient_id),
        items: JSON.stringify([{ name: newBill.description || 'Medical Services', qty: 1, price: amt }]),
        subtotal: amt, tax: 0, discount: 0, total: amt,
        status: newBill.payment_method === 'CASH' ? 'PAID' : 'PENDING',
        payment_method: newBill.payment_method === 'CASH' ? 'CASH' : null,
        paid_at: newBill.payment_method === 'CASH' ? new Date().toISOString() : null,
      })
      toast.success('Bill created')
      setNewBillModal(false)
      setNewBill({ patient_id: '', description: '', amount: '', payment_method: 'CASH' })
      setLoading(true)
      fetchInvoices()
    } catch (err) {
      toast.error(err.message || 'Failed to create bill')
    } finally {
      setSavingBill(false)
    }
  }

  const filtered = invoices.filter(i => {
    const matchSearch = i.patientName.toLowerCase().includes(search.toLowerCase()) ||
      i.bill_number?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || i.status === filter
    return matchSearch && matchFilter
  })

  const totalPending = invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + (i.total || 0), 0)
  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + (i.total || 0), 0)

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Billing & Payments</h1>
          <p className="text-slate-500 text-sm">{invoices.length} invoice(s)</p>
        </div>
        <button onClick={() => setNewBillModal(true)}
          className="inline-flex items-center gap-2 bg-[#0f4b80] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 shadow-sm self-start sm:self-auto">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Bill
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Total Collected</p>
          <p className="text-2xl font-black text-green-600">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Pending Amount</p>
          <p className="text-2xl font-black text-amber-600">₹{totalPending.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient or invoice number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'PAID', 'PARTIAL'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${filter === f ? 'bg-[#0f4b80] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          <p className="mt-2 text-sm">Loading invoices...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-slate-300 text-5xl">receipt_long</span>
          <p className="text-slate-500 mt-2">No invoices found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Invoice #', 'Patient', 'Description', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#0f4b80] font-bold">{inv.bill_number}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{inv.patientName}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{inv.desc}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{inv.displayDate}</td>
                    <td className="px-4 py-3 font-black text-slate-900">{inv.displayAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[inv.status] || 'bg-slate-100 text-slate-600'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {inv.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCollectPayment(inv)}
                            disabled={paying === inv.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#0f4b80] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50 whitespace-nowrap">
                            {paying === inv.id
                              ? <span className="material-symbols-outlined text-[13px] animate-spin">progress_activity</span>
                              : <span className="material-symbols-outlined text-[13px]">payment</span>
                            }
                            Collect Payment
                          </button>
                          <div className="relative group">
                            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500">
                              <span className="material-symbols-outlined text-[16px]">more_vert</span>
                            </button>
                            <div className="absolute right-0 top-8 z-20 bg-white border border-slate-200 rounded-xl shadow-xl w-44 hidden group-hover:block">
                              <button onClick={() => handleMarkPaid(inv, 'CASH')}
                                disabled={markingPaid === inv.id}
                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[15px] text-green-600">payments</span>
                                Mark Paid (Cash)
                              </button>
                              <button onClick={() => handleMarkPaid(inv, 'UPI')}
                                disabled={markingPaid === inv.id}
                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[15px] text-violet-600">qr_code</span>
                                Mark Paid (UPI)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {inv.status === 'PAID' && (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
                          <span className="material-symbols-outlined text-[15px]">check_circle</span>
                          Paid
                        </span>
                      )}                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Bill Modal */}
      {newBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Create New Bill</h2>
              <button onClick={() => setNewBillModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Patient</label>
                <select value={newBill.patient_id} onChange={e => setNewBill(p => ({ ...p, patient_id: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
                <input value={newBill.description} onChange={e => setNewBill(p => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Consultation - Cardiology"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Amount (₹)</label>
                <input type="number" value={newBill.amount} onChange={e => setNewBill(p => ({ ...p, amount: e.target.value }))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Payment Method</label>
                <select value={newBill.payment_method} onChange={e => setNewBill(p => ({ ...p, payment_method: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                  <option value="CASH">Cash (Mark Paid Now)</option>
                  <option value="RAZORPAY">Online (Collect via Razorpay)</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={handleCreateBill} disabled={savingBill}
                className="flex-1 bg-[#0f4b80] text-white py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {savingBill ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : null}
                {savingBill ? 'Creating...' : 'Create Bill'}
              </button>
              <button onClick={() => setNewBillModal(false)}
                className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
