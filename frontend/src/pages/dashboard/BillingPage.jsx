import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { billingService } from '../../services/api.js'
import { downloadInvoice } from '../../utils/invoiceGenerator.js'

const FALLBACK_INVOICES = [
  { id: 1, invoiceId: 'INV-8821', date: '12 Mar 2026', desc: 'General Consultation', amount: 1200, status: 'Paid', paymentId: 'pay_mock001', paidOn: '12 Mar 2026' },
  { id: 2, invoiceId: 'INV-8819', date: '10 Mar 2026', desc: 'Laboratory Tests', amount: 4500, status: 'Pending', paymentId: null, paidOn: null },
  { id: 3, invoiceId: 'INV-8790', date: '05 Mar 2026', desc: 'In-patient Stay (2 days)', amount: 18000, status: 'Partial', paymentId: null, paidOn: null },
  { id: 4, invoiceId: 'INV-8755', date: '01 Mar 2026', desc: 'Pharmacy — Medications', amount: 850, status: 'Paid', paymentId: 'pay_mock002', paidOn: '01 Mar 2026' },
  { id: 5, invoiceId: 'INV-8742', date: '28 Feb 2026', desc: 'Radiology — MRI Scan', amount: 8500, status: 'Pending', paymentId: null, paidOn: null },
]

const STATUS_STYLE = {
  Paid:    'bg-green-100 text-green-700',
  Pending: 'bg-orange-100 text-orange-700',
  Partial: 'bg-blue-100 text-blue-700',
}

export default function BillingPage() {
  const [filter, setFilter] = useState('All')
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(null)
  const [savedOrder, setSavedOrder] = useState(null)
  const [tab, setTab] = useState('invoices')

  useEffect(() => {
    billingService.getAll()
      .then(data => setInvoices(data.length > 0 ? data : FALLBACK_INVOICES))
      .catch(() => setInvoices(FALLBACK_INVOICES))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? invoices : invoices.filter(i => i.status === filter)
  const paidHistory = invoices.filter(i => i.status === 'Paid')
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0)
  const totalPending = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0)

  const openCheckout = (inv, order) => {
    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Deepthi Hospitals',
      description: inv.desc,
      order_id: order.order_id,
      handler: async (response) => {
        try {
          await billingService.verifyPayment(inv.id, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          setInvoices(prev => prev.map(i => i.id === inv.id
            ? { ...i, status: 'Paid', paymentId: response.razorpay_payment_id, paidOn: now }
            : i
          ))
          setSavedOrder(null)
          setPaying(null)
          toast.success(`Payment successful for ${inv.invoiceId}`)
        } catch {
          toast.error('Verification failed. Contact support.')
          setPaying(null)
        }
      },
      prefill: { name: 'Patient', email: '' },
      theme: { color: '#0F4C81' },
      modal: { ondismiss: () => setPaying(null) },
    }
    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (resp) => {
      const reason = resp?.error?.description || 'Payment failed'
      toast.error(
        <span>{reason}.{' '}
          <button className="underline font-bold" onClick={() => { toast.dismiss(); openCheckout(inv, order) }}>Retry</button>
        </span>, { duration: 8000 }
      )
      setPaying(null)
    })
    rzp.open()
  }

  const handlePay = async (inv) => {
    setPaying(inv.id)
    if (savedOrder?.invId === inv.id) { openCheckout(inv, savedOrder.order); return }
    try {
      const order = await billingService.createOrder(inv.id)
      setSavedOrder({ invId: inv.id, order })
      openCheckout(inv, order)
    } catch (err) {
      toast.error(err.message || 'Could not initiate payment')
      setPaying(null)
    }
  }

  const handleDownload = (inv) => {
    downloadInvoice({
      invoiceId: inv.invoiceId,
      date: inv.date,
      description: inv.desc,
      amount: inv.amount,
      status: inv.status,
      patientName: 'Arjun Mehta',
      paymentId: inv.paymentId,
    })
    toast.success(`Invoice ${inv.invoiceId} ready to print`)
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Billing & Invoices</h1>
        <p className="text-slate-500 text-sm mt-1">View, pay and download your invoices</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-100 h-24" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, icon: 'account_balance_wallet', color: 'bg-green-50 text-green-600', badge: `${paidHistory.length} invoices`, badgeColor: 'text-green-600 bg-green-50' },
              { label: 'Outstanding', value: `₹${totalPending.toLocaleString('en-IN')}`, icon: 'pending_actions', color: 'bg-[#0F4C81]/10 text-[#0F4C81]', badge: `${invoices.filter(i => i.status !== 'Paid').length} pending`, badgeColor: 'text-[#0F4C81] bg-[#0F4C81]/5' },
              { label: 'Insurance Claims', value: '2 Pending', icon: 'shield', color: 'bg-blue-50 text-blue-600', badge: 'Review needed', badgeColor: 'text-blue-600 bg-blue-50' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${c.color}`}><span className="material-symbols-outlined">{c.icon}</span></div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.badgeColor}`}>{c.badge}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">{c.label}</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900">{c.value}</h3>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {[['invoices', 'receipt_long', 'Invoices'], ['history', 'history', 'Payment History']].map(([key, icon, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? 'bg-white text-[#0F4C81] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <span className="material-symbols-outlined text-base">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Invoices Tab */}
          {tab === 'invoices' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-bold text-lg text-slate-900">All Invoices</h3>
                <div className="flex gap-2">
                  {['All', 'Paid', 'Pending', 'Partial'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === f ? 'bg-[#0F4C81] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Invoice ID', 'Date', 'Description', 'Amount', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No invoices found</td>
                      </tr>
                    ) : filtered.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{inv.invoiceId}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{inv.date}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{inv.desc}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">₹{inv.amount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[inv.status] || 'bg-slate-100 text-slate-600'}`}>{inv.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {(inv.status === 'Pending' || inv.status === 'Partial') && (
                              <button onClick={() => handlePay(inv)} disabled={paying === inv.id}
                                className="flex items-center gap-1 text-xs font-semibold text-white bg-[#0F4C81] px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity">
                                <span className="material-symbols-outlined text-sm">payment</span>
                                {paying === inv.id ? 'Opening…' : savedOrder?.invId === inv.id ? 'Retry' : 'Pay Now'}
                              </button>
                            )}
                            <button onClick={() => handleDownload(inv)}
                              className="flex items-center gap-1 text-xs font-semibold text-[#0F4C81] border border-[#0F4C81]/20 px-3 py-1.5 rounded-lg hover:bg-[#0F4C81]/5 transition-colors">
                              <span className="material-symbols-outlined text-sm">download</span>
                              Invoice
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">Showing {filtered.length} of {invoices.length} invoices</p>
              </div>
            </div>
          )}

          {/* Payment History Tab */}
          {tab === 'history' && (
            <div className="space-y-4">
              {paidHistory.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <span className="material-symbols-outlined text-slate-300 text-5xl">receipt_long</span>
                  <p className="text-slate-500 mt-3 font-medium">No payment history yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-900">Payment History</h3>
                    <p className="text-slate-500 text-sm mt-0.5">{paidHistory.length} successful payments · Total ₹{totalPaid.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {paidHistory.map(inv => (
                      <div key={inv.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900 text-sm">{inv.desc}</p>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Paid</span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1">
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">receipt</span>{inv.invoiceId}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">calendar_today</span>{inv.paidOn || inv.date}
                            </p>
                            {inv.paymentId && (
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">tag</span>{inv.paymentId}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <p className="font-black text-slate-900">₹{inv.amount.toLocaleString('en-IN')}</p>
                          <button onClick={() => handleDownload(inv)}
                            className="flex items-center gap-1 text-xs font-semibold text-[#0F4C81] border border-[#0F4C81]/20 px-3 py-1.5 rounded-lg hover:bg-[#0F4C81]/5 transition-colors">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Invoice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <p className="text-sm text-slate-600 font-medium">Total Paid</p>
                    <p className="text-lg font-black text-[#0F4C81]">₹{totalPaid.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
