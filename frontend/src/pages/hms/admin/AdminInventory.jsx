import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../../components/Modal.jsx'
import { hmsService } from '../../../services/api.js'

const STATUS_MAP = { IN_STOCK: 'In Stock', LOW_STOCK: 'Low Stock', OUT_OF_STOCK: 'Critical' }
const STATUS_COLORS = {
  'In Stock': 'bg-green-100 text-green-700',
  'Low Stock': 'bg-amber-100 text-amber-700',
  'Critical': 'bg-red-100 text-red-700',
}
const CATEGORIES = ['Medicines','Surgical','Consumables','Equipment','Lab Supplies','PPE','Pharmacy','Diagnostics','Other']
const UNITS = ['Units','Boxes','Strips','Vials','Bottles','Packs','Pairs','Rolls','Liters','Kg']
const BLANK = { name: '', category: '', sku: '', quantity: '', unit: 'Units', unit_price: '', reorder_level: '10', expiry_date: '', supplier: '' }

export default function AdminInventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = () => {
    setLoading(true)
    hmsService.getInventory()
      .then(items => setInventory(items.map(i => ({ ...i, statusLabel: STATUS_MAP[i.status] || i.status, stock: i.quantity }))))
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = inventory.filter(i => {
    const matchSearch = (i.name||'').toLowerCase().includes(search.toLowerCase()) || (i.category||'').toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'all' || i.category === filterCat
    return matchSearch && matchCat
  })

  const critical = inventory.filter(i => i.statusLabel === 'Critical').length
  const lowStock = inventory.filter(i => i.statusLabel === 'Low Stock').length

  const handleAdd = async () => {
    if (!form.name || !form.category || !form.quantity) {
      toast.error('Name, category and quantity are required')
      return
    }
    setSaving(true)
    try {
      const created = await hmsService.addInventoryItem({
        name: form.name, category: form.category, sku: form.sku || undefined,
        quantity: Number(form.quantity), unit: form.unit || undefined,
        unit_price: Number(form.unit_price) || 0,
        reorder_level: Number(form.reorder_level) || 10,
        expiry_date: form.expiry_date || undefined,
        supplier: form.supplier || undefined,
      })
      setInventory(prev => [...prev, { ...created, statusLabel: STATUS_MAP[created.status] || created.status, stock: created.quantity }])
      setShowAdd(false)
      setForm(BLANK)
      toast.success(`${created.name} added to inventory`)
    } catch (e) {
      toast.error(e.message || 'Failed to add item')
    } finally { setSaving(false) }
  }

  const openEdit = (item) => {
    setEditItem(item)
    setEditForm({ quantity: item.quantity, unit_price: item.unit_price, expiry_date: item.expiry_date || '', supplier: item.supplier || '' })
  }

  const handleEdit = async () => {
    setSavingEdit(true)
    try {
      const updated = await hmsService.updateInventoryItem(editItem.id, {
        quantity: Number(editForm.quantity),
        unit_price: Number(editForm.unit_price),
        expiry_date: editForm.expiry_date || undefined,
        supplier: editForm.supplier || undefined,
      })
      setInventory(prev => prev.map(i => i.id === editItem.id
        ? { ...i, ...updated, statusLabel: STATUS_MAP[updated.status] || updated.status, stock: updated.quantity }
        : i))
      setEditItem(null)
      toast.success('Item updated')
    } catch (e) { toast.error(e.message || 'Failed to update') }
    finally { setSavingEdit(false) }
  }

  const handleDelete = async () => {
    try {
      await hmsService.deleteInventoryItem?.(deleteId)
      setInventory(prev => prev.filter(i => i.id !== deleteId))
      toast.success('Item removed')
    } catch (e) { toast.error(e.message || 'Failed to delete') }
    finally { setDeleteId(null) }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Inventory & Supplies</h1>
          <p className="text-slate-500 text-sm">Track medical supplies and equipment</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0f4b80] text-white rounded-xl text-sm font-semibold hover:bg-[#0d3f6e] transition-colors shadow-md shadow-blue-900/20 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          Add Item
        </button>
      </div>

      {(critical > 0 || lowStock > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {critical > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 flex-1">
              <span className="material-symbols-outlined text-red-600">emergency</span>
              <p className="text-red-700 text-sm font-bold">{critical} item(s) at critical level — immediate reorder required</p>
            </div>
          )}
          {lowStock > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 flex-1">
              <span className="material-symbols-outlined text-amber-600">warning</span>
              <p className="text-amber-700 text-sm font-bold">{lowStock} item(s) running low — reorder soon</p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none text-sm" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] bg-white">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <p className="mt-2 text-sm">Loading inventory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Item', 'SKU', 'Category', 'Stock', 'Unit', 'Price', 'Reorder', 'Expiry', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0f4b80]/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[#0f4b80] text-sm">inventory_2</span>
                        </div>
                        <span className="font-semibold text-sm">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.sku || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${item.statusLabel === 'Critical' ? 'text-red-600' : item.statusLabel === 'Low Stock' ? 'text-amber-600' : 'text-slate-900'}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.unit || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">₹{item.unit_price?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.reorder_level}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.expiry_date || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[item.statusLabel] || 'bg-slate-100 text-slate-600'}`}>{item.statusLabel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(item)} className="text-[#0f4b80] hover:underline text-xs font-bold">Edit</button>
                        <button onClick={() => setDeleteId(item.id)} className="text-red-500 hover:underline text-xs font-bold">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-slate-300 text-4xl">inventory_2</span>
                <p className="text-slate-500 mt-2">No items found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setForm(BLANK) }} title="Add Inventory Item">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Item Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="e.g. Surgical Gloves (Medium)"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Category <span className="text-red-500">*</span></label>
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] bg-white">
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">SKU / Code</label>
              <input value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))}
                placeholder="e.g. MED-001"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Quantity <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Unit</label>
              <select value={form.unit} onChange={e => setForm(f => ({...f, unit: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] bg-white">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Unit Price (₹)</label>
              <input type="number" min="0" step="0.01" value={form.unit_price} onChange={e => setForm(f => ({...f, unit_price: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Reorder Level</label>
              <input type="number" min="0" value={form.reorder_level} onChange={e => setForm(f => ({...f, reorder_level: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({...f, expiry_date: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80]" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Supplier</label>
              <input value={form.supplier} onChange={e => setForm(f => ({...f, supplier: e.target.value}))}
                placeholder="Supplier name"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleAdd} disabled={saving}
              className="flex-1 bg-[#0f4b80] text-white font-bold py-2.5 rounded-xl hover:bg-[#0d3f6e] disabled:opacity-60 transition-colors">
              {saving ? 'Adding...' : 'Add to Inventory'}
            </button>
            <button onClick={() => { setShowAdd(false); setForm(BLANK) }}
              className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Edit — ${editItem?.name}`}>
        <div className="space-y-3">
          {[
            { label: 'Quantity', key: 'quantity', type: 'number' },
            { label: 'Unit Price (₹)', key: 'unit_price', type: 'number' },
            { label: 'Supplier', key: 'supplier', type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
              <input type={f.type} value={editForm[f.key]||''}
                onChange={e => setEditForm(p => ({...p, [f.key]: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Expiry Date</label>
            <input type="date" value={editForm.expiry_date||''}
              onChange={e => setEditForm(p => ({...p, expiry_date: e.target.value}))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80]" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleEdit} disabled={savingEdit}
              className="flex-1 bg-[#0f4b80] text-white font-bold py-2.5 rounded-xl hover:bg-[#0d3f6e] disabled:opacity-60">
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setEditItem(null)}
              className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Remove Item">
        <p className="text-slate-600 mb-6">Are you sure you want to remove this item from inventory? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl hover:opacity-90">Yes, Remove</button>
          <button onClick={() => setDeleteId(null)} className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50">Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
