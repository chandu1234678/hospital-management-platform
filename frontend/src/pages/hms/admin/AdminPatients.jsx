import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../../components/Modal.jsx'
import { hmsService } from '../../../services/api.js'

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const GENDERS = ['Male','Female','Other']
const BLANK = { name: '', email: '', phone: '', password: 'Patient@123', gender: '', blood_group: '', date_of_birth: '', address: '', allergies: '' }

export default function AdminPatients() {
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [viewPatient, setViewPatient] = useState(null)

  useEffect(() => {
    hmsService.getPatients()
      .then(setPatients)
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
    String(p.id).includes(search)
  )

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.phone) {
      toast.error('Name, email and phone are required')
      return
    }
    setSaving(true)
    try {
      await hmsService.createPatient({
        name: form.name, email: form.email, phone: form.phone, password: form.password,
      })
      // Reload list to get the new patient with their ID
      const updated = await hmsService.getPatients()
      setPatients(updated)
      setShowAdd(false)
      setForm(BLANK)
      toast.success(`Patient ${form.name} registered successfully`)
    } catch (e) {
      toast.error(e.message || 'Failed to register patient')
    } finally { setSaving(false) }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Patient Records</h1>
          <p className="text-slate-500 text-sm">Manage all registered patients</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0f4b80] text-white rounded-xl text-sm font-semibold hover:bg-[#0d3f6e] transition-colors shadow-md shadow-blue-900/20 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add Patient
        </button>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or ID..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <p className="mt-2 text-sm">Loading patients...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['ID', 'Name', 'Gender', 'Blood', 'Phone', 'DOB', 'Allergies', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-[#0f4b80] font-bold">P-{String(p.id).padStart(4, '0')}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0f4b80]/10 flex items-center justify-center text-[#0f4b80] text-xs font-bold">
                          {(p.name || 'P').charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{p.gender || '—'}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-700">{p.blood_group || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{p.phone || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{p.date_of_birth || '—'}</td>
                    <td className="px-5 py-4 text-xs text-slate-500 max-w-[120px] truncate">{p.allergies || 'None'}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => setViewPatient(p)} className="text-[#0f4b80] hover:underline text-xs font-bold">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-slate-300 text-4xl">person_search</span>
                <p className="text-slate-500 mt-2">No patients found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setForm(BLANK) }} title="Register New Patient">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="Patient's full name"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Phone <span className="text-red-500">*</span></label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] bg-white">
                <option value="">Select...</option>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Blood Group</label>
              <select value={form.blood_group} onChange={e => setForm(f => ({...f, blood_group: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] bg-white">
                <option value="">Select...</option>
                {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Date of Birth</label>
              <input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({...f, date_of_birth: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Login Password</label>
              <input value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Address</label>
              <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Known Allergies</label>
              <input value={form.allergies} onChange={e => setForm(f => ({...f, allergies: e.target.value}))}
                placeholder="e.g. Penicillin, Peanuts"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            <span className="font-bold">Note:</span> Patient can log in to the patient portal with their email and password above.
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleAdd} disabled={saving}
              className="flex-1 bg-[#0f4b80] text-white font-bold py-2.5 rounded-xl hover:bg-[#0d3f6e] disabled:opacity-60 transition-colors">
              {saving ? 'Registering...' : 'Register Patient'}
            </button>
            <button onClick={() => { setShowAdd(false); setForm(BLANK) }}
              className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* View Patient Modal */}
      <Modal open={!!viewPatient} onClose={() => setViewPatient(null)} title={`Patient — ${viewPatient?.name}`}>
        {viewPatient && (
          <div className="space-y-2">
            {[
              ['Patient ID', `P-${String(viewPatient.id).padStart(4,'0')}`],
              ['Name', viewPatient.name],
              ['Email', viewPatient.email],
              ['Phone', viewPatient.phone || '—'],
              ['Gender', viewPatient.gender || '—'],
              ['Blood Group', viewPatient.blood_group || '—'],
              ['Date of Birth', viewPatient.date_of_birth || '—'],
              ['Address', viewPatient.address || '—'],
              ['Allergies', viewPatient.allergies || 'None'],
              ['Medical History', viewPatient.medical_history || '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                <span className="text-sm font-medium text-slate-800 text-right max-w-[60%]">{val}</span>
              </div>
            ))}
            <button onClick={() => setViewPatient(null)}
              className="w-full mt-2 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50">
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
