import { useState } from 'react'
import toast from 'react-hot-toast'
import { HMS_INVENTORY } from '../../../data/hmsData.js'

const STATUS_COLORS = {
  'In Stock': 'bg-green-100 text-green-700',
  'Low Stock': 'bg-amber-100 text-amber-700',
  'Critical': 'bg-red-100 text-red-700',
}

export default function AdminInventory() {
  const [inventory] = useState(HMS_INVENTORY)
  const [search, setSearch] = useState('')

  const filtered = inventory.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  )

  const critical = inventory.filter(i => i.status === 'Critical').length
  const lowStock = inventory.filter(i => i.status === 'Low Stock').length

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Inventory & Supplies</h1>
          <p className="text-slate-500 text-sm">Track medical supplies and equipment</p>
        </div>
        <button onClick={() => toast.success('Add inventory item form opened')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          Add Item
        </button>
      </div>

      {/* Alert banners */}
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

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search inventory..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                {['Item', 'Category', 'Stock', 'Unit', 'Reorder Level', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0f4b80]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#0f4b80] text-sm">inventory_2</span>
                      </div>
                      <span className="font-semibold text-sm">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{item.category}</td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-bold ${item.status === 'Critical' ? 'text-red-600' : item.status === 'Low Stock' ? 'text-amber-600' : 'text-slate-900'}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{item.unit}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{item.reorder}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toast.success(`Reorder request sent for ${item.name}`)}
                      className="text-[#0f4b80] hover:underline text-xs font-bold">Reorder</button>
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
