import { useState } from 'react'
import toast from 'react-hot-toast'

const STAFF = [
  { id: 'S-001', name: 'Dr. Deepthi K.', role: 'Neurologist', dept: 'Neurology', shift: 'Morning', status: 'Active' },
  { id: 'S-002', name: 'Nurse Priya R.', role: 'Head Nurse', dept: 'ICU', shift: 'Night', status: 'Active' },
  { id: 'S-003', name: 'Dr. Rajan M.', role: 'Cardiologist', dept: 'Cardiology', shift: 'Morning', status: 'On Leave' },
  { id: 'S-004', name: 'Tech. Suresh V.', role: 'Lab Technician', dept: 'Pathology', shift: 'Evening', status: 'Active' },
  { id: 'S-005', name: 'Dr. Anita S.', role: 'Pediatrician', dept: 'Pediatrics', shift: 'Morning', status: 'Active' },
  { id: 'S-006', name: 'Nurse Kavitha L.', role: 'Staff Nurse', dept: 'General Ward', shift: 'Night', status: 'On Leave' },
]

const STATUS_STYLE = { Active: 'bg-green-100 text-green-700', 'On Leave': 'bg-amber-100 text-amber-700' }

export default function AdminStaff() {
  const [staff, setStaff] = useState(STAFF)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', dept: '', shift: 'Morning' })

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.dept.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.name || !form.role || !form.dept) return toast.error('Fill all fields')
    setStaff(prev => [...prev, { ...form, id: `S-00${prev.length + 1}`, status: 'Active' }])
    toast.success('Staff member added')
    setShowModal(false)
    setForm({ name: '', role: '', dept: '', shift: 'Morning' })
  }

  const toggleStatus = (id) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'On Leave' : 'Active' } : s))
    toast.success('Status updated')
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Staff Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage hospital staff, roles and shifts</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-[#0F4C81] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: staff.length, icon: 'group', color: 'text-[#0F4C81] bg-[#0F4C81]/10' },
          { label: 'Active', value: staff.filter(s => s.status === 'Active').length, icon: 'check_circle', color: 'text-green-600 bg-green-50' },
          { label: 'On Leave', value: staff.filter(s => s.status === 'On Leave').length, icon: 'event_busy', color: 'text-amber-600 bg-amber-50' },
          { label: 'Departments', value: [...new Set(staff.map(s => s.dept))].length, icon: 'apartment', color: 'text-violet-600 bg-violet-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] outline-none bg-white" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Staff ID', 'Name', 'Role', 'Department', 'Shift', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#0F4C81] font-bold">{s.id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.role}</td>
                  <td className="px-4 py-3 text-slate-600">{s.dept}</td>
                  <td className="px-4 py-3 text-slate-600">{s.shift}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toast.success('Edit coming soon')}
                        className="text-[#0F4C81] text-xs font-semibold hover:underline">Edit</button>
                      <button onClick={() => toggleStatus(s.id)}
                        className="text-slate-500 text-xs font-semibold hover:underline">
                        {s.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Add Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {[['Full Name', 'name', 'text'], ['Role / Designation', 'role', 'text'], ['Department', 'dept', 'text']].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Shift</label>
                <select value={form.shift} onChange={e => setForm(p => ({ ...p, shift: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] outline-none bg-white">
                  {['Morning', 'Evening', 'Night'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#0F4C81] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90">Add Staff</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
