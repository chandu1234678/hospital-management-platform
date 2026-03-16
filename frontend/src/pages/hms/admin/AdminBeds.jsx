import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../../components/Modal.jsx'
import { hmsService } from '../../../services/api.js'

const STATUS_STYLE = {
  OCCUPIED:    'bg-[#0F4C81] text-white border-[#0F4C81]',
  AVAILABLE:   'bg-green-50 text-green-700 border-green-200',
  MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200',
  RESERVED:    'bg-purple-50 text-purple-700 border-purple-200',
}
const STATUS_DOT = { OCCUPIED: 'bg-[#0F4C81]', AVAILABLE: 'bg-green-500', MAINTENANCE: 'bg-amber-500', RESERVED: 'bg-purple-500' }
const STATUSES = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']
const WARDS = ['ICU', 'General Ward A', 'General Ward B', 'Pediatrics', 'Maternity', 'Private Wing', 'Emergency']
const BED_TYPES = ['GENERAL', 'ICU', 'PRIVATE', 'SEMI_PRIVATE']

const BLANK_BED = { bed_number: '', ward: 'General Ward A', bed_type: 'GENERAL', status: 'AVAILABLE', notes: '' }

export default function AdminBeds() {
  const [beds, setBeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [ward, setWard] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(BLANK_BED)
  const [saving, setSaving] = useState(false)
  const [editBed, setEditBed] = useState(null)
  const [editStatus, setEditStatus] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    hmsService.getBeds()
      .then(setBeds)
      .catch(() => toast.error('Failed to load beds'))
      .finally(() => setLoading(false))
  }, [])

  const wards = [...new Set(beds.map(b => b.ward))].filter(Boolean).sort()
  const filtered = ward === 'All' ? beds : beds.filter(b => b.ward === ward)
  const counts = {
    OCCUPIED: beds.filter(b => b.status === 'OCCUPIED').length,
    AVAILABLE: beds.filter(b => b.status === 'AVAILABLE').length,
    MAINTENANCE: beds.filter(b => b.status === 'MAINTENANCE').length,
  }

  const handleAdd = async () => {
    if (!addForm.bed_number.trim()) return toast.error('Bed number is required')
    setSaving(true)
    try {
      const newBed = await hmsService.addBed(addForm)
      setBeds(b => [...b, newBed])
      toast.success(`Bed ${newBed.bed_number} added`)
      setAddOpen(false)
      setAddForm(BLANK_BED)
    } catch (e) {
      toast.error(e.message || 'Failed to add bed')
    } finally { setSaving(false) }
  }

  const openEdit = (bed) => {
    setEditBed(bed)
    setEditStatus(bed.status)
    setEditNotes(bed.notes || '')
  }

  const handleEditSave = async () => {
    setSavingEdit(true)
    try {
      const updated = await hmsService.updateBed(editBed.id, { status: editStatus, notes: editNotes })
      setBeds(bs => bs.map(b => b.id === editBed.id ? { ...b, ...updated } : b))
      toast.success(`Bed ${editBed.bed_number} updated`)
      setEditBed(null)
    } catch { toast.error('Failed to update bed') }
    finally { setSavingEdit(false) }
  }

  const handleDelete = async (bed) => {
    if (!window.confirm(`Delete bed ${bed.bed_number}?`)) return
    try {
      await hmsService.deleteBed(bed.id)
      setBeds(bs => bs.filter(b => b.id !== bed.id))
      toast.success(`Bed ${bed.bed_number} removed`)
    } catch { toast.error('Failed to delete bed') }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Bed Management</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time ward and bed occupancy overview</p>
        </div>
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4b80] text-white rounded-lg text-sm font-semibold hover:opacity-90 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">add</span>
          Add Bed
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Occupied', key: 'OCCUPIED', color: 'text-[#0F4C81]' },
          { label: 'Available', key: 'AVAILABLE', color: 'text-green-600' },
          { label: 'Maintenance', key: 'MAINTENANCE', color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className={`text-3xl font-black ${s.color}`}>{counts[s.key]}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {Object.entries(STATUS_DOT).map(([label, dot]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${dot}`} />
              <span className="text-xs text-slate-600 font-medium capitalize">{label.toLowerCase()}</span>
            </div>
          ))}
        </div>
        <select value={ward} onChange={e => setWard(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] outline-none bg-white">
          <option value="All">All Wards</option>
          {wards.map(w => <option key={w}>{w}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          <p className="mt-2 text-sm">Loading beds...</p>
        </div>
      ) : (
        (ward === 'All' ? wards : [ward]).map(w => {
          const wardBeds = filtered.filter(b => b.ward === w)
          if (!wardBeds.length) return null
          return (
            <div key={w} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">{w}</h2>
                <span className="text-xs text-slate-500">{wardBeds.filter(b => b.status === 'AVAILABLE').length} available of {wardBeds.length}</span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {wardBeds.map(bed => (
                  <button key={bed.id} onClick={() => openEdit(bed)}
                    className={`rounded-xl border-2 p-3 text-center transition-all hover:scale-105 hover:shadow-md ${STATUS_STYLE[bed.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    <span className="material-symbols-outlined text-[22px] block mb-1">bed</span>
                    <p className="text-xs font-bold">{bed.bed_number}</p>
                    <p className="text-[10px] mt-0.5 opacity-70 capitalize">{(bed.status||'').toLowerCase()}</p>
                  </button>
                ))}
              </div>
            </div>
          )
        })
      )}

      {/* Add Bed Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Bed">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Bed Number *</label>
            <input value={addForm.bed_number} onChange={e => setAddForm(p => ({...p, bed_number: e.target.value}))}
              placeholder="e.g. ICU-09, GWA-13"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Ward</label>
            <select value={addForm.ward} onChange={e => setAddForm(p => ({...p, ward: e.target.value}))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0f4b80]">
              {WARDS.map(w => <option key={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Bed Type</label>
            <select value={addForm.bed_type} onChange={e => setAddForm(p => ({...p, bed_type: e.target.value}))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0f4b80]">
              {BED_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Initial Status</label>
            <select value={addForm.status} onChange={e => setAddForm(p => ({...p, status: e.target.value}))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0f4b80]">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
            <input value={addForm.notes} onChange={e => setAddForm(p => ({...p, notes: e.target.value}))}
              placeholder="Optional notes"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0f4b80]" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleAdd} disabled={saving}
              className="flex-1 bg-[#0f4b80] text-white font-bold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60">
              {saving ? 'Adding...' : 'Add Bed'}
            </button>
            <button onClick={() => setAddOpen(false)}
              className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Bed Modal */}
      <Modal open={!!editBed} onClose={() => setEditBed(null)} title={`Bed ${editBed?.bed_number} — ${editBed?.ward}`}>
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500 text-xs">Type</span><p className="font-semibold">{editBed?.bed_type}</p></div>
            <div><span className="text-slate-500 text-xs">Ward</span><p className="font-semibold">{editBed?.ward}</p></div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setEditStatus(s)}
                  className={`py-2.5 rounded-lg text-xs font-bold border-2 transition-all ${editStatus === s ? STATUS_STYLE[s] + ' scale-105' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
            <input value={editNotes} onChange={e => setEditNotes(e.target.value)}
              placeholder="e.g. Patient name, reason for maintenance..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0f4b80]" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleEditSave} disabled={savingEdit}
              className="flex-1 bg-[#0f4b80] text-white font-bold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60">
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => handleDelete(editBed)}
              className="px-4 py-2.5 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 text-sm">
              Delete
            </button>
            <button onClick={() => setEditBed(null)}
              className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
