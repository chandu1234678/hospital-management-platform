import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../../components/Modal.jsx'
import { doctorService, hmsService } from '../../../services/api.js'

const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN']
const DAY_LABELS = { MON:'Monday',TUE:'Tuesday',WED:'Wednesday',THU:'Thursday',FRI:'Friday',SAT:'Saturday',SUN:'Sunday' }
const BLANK_SCHEDULE = DAYS.map(d => ({ day_of_week: d, start_time: '09:00', end_time: '17:00', slot_duration_minutes: 30, is_active: false }))

const BLANK_DOCTOR = { name: '', email: '', phone: '', password: 'Doctor@123', specialty: '', department: '', qualification: '', experience_years: '', consultation_fee: '500', bio: '' }

const DEPARTMENTS = ['Cardiology','Neurology','Orthopedics','Pediatrics','Dermatology','Ophthalmology','General Medicine','Internal Medicine','Gynecology','Oncology','Radiology','Psychiatry','ENT','Urology','Nephrology']

export default function AdminDoctors() {
  const [search, setSearch] = useState('')
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [scheduleDoc, setScheduleDoc] = useState(null)
  const [schedule, setSchedule] = useState(BLANK_SCHEDULE)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [editDoc, setEditDoc] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState(BLANK_DOCTOR)
  const [savingAdd, setSavingAdd] = useState(false)

  useEffect(() => {
    doctorService.getAll()
      .then(setDoctors)
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = doctors.filter(d =>
    (d.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (d.department||'').toLowerCase().includes(search.toLowerCase())
  )

  const openSchedule = async (doc) => {
    setScheduleDoc(doc)
    setScheduleLoading(true)
    try {
      const existing = await hmsService.getDoctorSchedule(doc.id)
      const merged = BLANK_SCHEDULE.map(blank => {
        const found = existing.find(e => e.day_of_week === blank.day_of_week)
        return found ? { ...blank, ...found } : blank
      })
      setSchedule(merged)
    } catch { setSchedule(BLANK_SCHEDULE) }
    finally { setScheduleLoading(false) }
  }

  const toggleDay = (idx) => setSchedule(s => s.map((e,i) => i===idx ? {...e, is_active: !e.is_active} : e))
  const updateSc = (idx, field, val) => setSchedule(s => s.map((e,i) => i===idx ? {...e, [field]: val} : e))

  const saveSchedule = async () => {
    setSavingSchedule(true)
    try {
      await hmsService.setDoctorSchedule(scheduleDoc.id, schedule.filter(e => e.is_active))
      toast.success('Schedule saved')
      setScheduleDoc(null)
    } catch { toast.error('Failed to save schedule') }
    finally { setSavingSchedule(false) }
  }

  const openEdit = (doc) => {
    setEditDoc(doc)
    setEditForm({
      name: doc.name||'', specialty: doc.specialty||'', department: doc.department||'',
      qualification: doc.qualification||'', experience_years: doc.experience_years||'',
      consultation_fee: doc.consultation_fee||'', bio: doc.bio||'',
      is_available: doc.is_available ?? true,
    })
  }

  const saveEdit = async () => {
    setSavingEdit(true)
    try {
      const updated = await hmsService.updateDoctor(editDoc.id, {
        ...editForm,
        experience_years: Number(editForm.experience_years),
        consultation_fee: Number(editForm.consultation_fee),
      })
      setDoctors(ds => ds.map(d => d.id === editDoc.id ? {...d, ...updated} : d))
      toast.success('Doctor updated')
      setEditDoc(null)
    } catch { toast.error('Failed to update doctor') }
    finally { setSavingEdit(false) }
  }

  const handleAddDoctor = async () => {
    if (!addForm.name || !addForm.email || !addForm.specialty || !addForm.department) {
      toast.error('Name, email, specialty and department are required')
      return
    }
    setSavingAdd(true)
    try {
      const created = await hmsService.createDoctor({
        ...addForm,
        experience_years: Number(addForm.experience_years) || 0,
        consultation_fee: Number(addForm.consultation_fee) || 500,
      })
      setDoctors(ds => [...ds, created])
      setShowAdd(false)
      setAddForm(BLANK_DOCTOR)
      toast.success(`Dr. ${created.name} added successfully`)
    } catch (e) {
      toast.error(e.message || 'Failed to add doctor')
    } finally {
      setSavingAdd(false)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Doctor Management</h1>
          <p className="text-slate-500 text-sm">Manage medical staff and schedules</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0f4b80] text-white rounded-xl text-sm font-semibold hover:bg-[#0d3f6e] transition-colors shadow-md shadow-blue-900/20 self-start sm:self-auto">
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add Doctor
        </button>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none" />
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          <p className="mt-2 text-sm">Loading doctors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  <img src={doc.image} alt={doc.name} className="w-full h-full object-cover"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0f4b80&color=fff` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{doc.name}</h3>
                  <p className="text-xs text-[#0f4b80] font-medium">{doc.specialty}</p>
                  <p className="text-xs text-slate-500">{doc.department} · {doc.experience}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                    <span className="text-xs font-bold">{doc.rating}</span>
                    <span className="text-xs text-slate-400">({doc.reviews})</span>
                    <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${doc.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {doc.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-4 flex gap-2">
                <button onClick={() => openSchedule(doc)}
                  className="flex-1 py-2 bg-[#0f4b80]/10 text-[#0f4b80] text-xs font-bold rounded-lg hover:bg-[#0f4b80]/20 transition-colors flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">calendar_month</span> Schedule
                </button>
                <button onClick={() => openEdit(doc)}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">edit</span> Edit
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12">
              <span className="material-symbols-outlined text-slate-300 text-4xl">person_search</span>
              <p className="text-slate-500 mt-2">No doctors found</p>
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal open={!!scheduleDoc} onClose={() => setScheduleDoc(null)} title={`Schedule — ${scheduleDoc?.name}`}>
        {scheduleLoading ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined animate-spin text-3xl text-[#0f4b80]">progress_activity</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-xs text-slate-500 mb-3">Toggle days and set working hours. Slot duration controls appointment intervals.</p>
            {schedule.map((entry, idx) => (
              <div key={entry.day_of_week}
                className={`rounded-xl border p-3 transition-colors ${entry.is_active ? 'border-[#0f4b80]/30 bg-[#0f4b80]/5' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 cursor-pointer" onClick={() => toggleDay(idx)}>
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${entry.is_active ? 'bg-[#0f4b80]' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${entry.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">{DAY_LABELS[entry.day_of_week]}</span>
                  </label>
                  {entry.is_active && (
                    <select value={entry.slot_duration_minutes}
                      onChange={e => updateSc(idx, 'slot_duration_minutes', Number(e.target.value))}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-[#0f4b80]">
                      {[15,20,30,45,60].map(m => <option key={m} value={m}>{m} min</option>)}
                    </select>
                  )}
                </div>
                {entry.is_active && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-xs text-slate-500 w-8">From</span>
                      <input type="time" value={entry.start_time}
                        onChange={e => updateSc(idx, 'start_time', e.target.value)}
                        className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#0f4b80]" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-xs text-slate-500 w-8">To</span>
                      <input type="time" value={entry.end_time}
                        onChange={e => updateSc(idx, 'end_time', e.target.value)}
                        className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#0f4b80]" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-3 pt-3">
              <button onClick={saveSchedule} disabled={savingSchedule}
                className="flex-1 bg-[#0f4b80] text-white font-bold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60">
                {savingSchedule ? 'Saving...' : 'Save Schedule'}
              </button>
              <button onClick={() => setScheduleDoc(null)}
                className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editDoc} onClose={() => setEditDoc(null)} title={`Edit — ${editDoc?.name}`}>
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Specialty', key: 'specialty', type: 'text' },
            { label: 'Department', key: 'department', type: 'text' },
            { label: 'Qualification', key: 'qualification', type: 'text' },
            { label: 'Experience (years)', key: 'experience_years', type: 'number' },
            { label: 'Consultation Fee (₹)', key: 'consultation_fee', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
              <input type={f.type} value={editForm[f.key]||''}
                onChange={e => setEditForm(p => ({...p, [f.key]: e.target.value}))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Bio</label>
            <textarea value={editForm.bio||''} rows={3}
              onChange={e => setEditForm(p => ({...p, bio: e.target.value}))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0f4b80] resize-none" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer" onClick={() => setEditForm(p => ({...p, is_available: !p.is_available}))}>
            <div className={`w-10 h-5 rounded-full transition-colors relative ${editForm.is_available ? 'bg-[#0f4b80]' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editForm.is_available ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-slate-700">Available for appointments</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={saveEdit} disabled={savingEdit}
              className="flex-1 bg-[#0f4b80] text-white font-bold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60">
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setEditDoc(null)}
              className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Doctor Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setAddForm(BLANK_DOCTOR) }} title="Add New Doctor">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Full Name', key: 'name', type: 'text', required: true, span: 2 },
              { label: 'Email', key: 'email', type: 'email', required: true, span: 2 },
              { label: 'Phone', key: 'phone', type: 'tel', span: 1 },
              { label: 'Login Password', key: 'password', type: 'text', span: 1 },
              { label: 'Qualification', key: 'qualification', type: 'text', span: 2 },
              { label: 'Experience (years)', key: 'experience_years', type: 'number', span: 1 },
              { label: 'Consultation Fee (₹)', key: 'consultation_fee', type: 'number', span: 1 },
            ].map(f => (
              <div key={f.key} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                <input type={f.type} value={addForm[f.key]||''}
                  onChange={e => setAddForm(p => ({...p, [f.key]: e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Specialty <span className="text-red-500">*</span></label>
              <input value={addForm.specialty} onChange={e => setAddForm(p => ({...p, specialty: e.target.value}))}
                placeholder="e.g. Senior Cardiologist"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Department <span className="text-red-500">*</span></label>
              <select value={addForm.department} onChange={e => setAddForm(p => ({...p, department: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] bg-white">
                <option value="">Select department...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Bio</label>
            <textarea value={addForm.bio} rows={2}
              onChange={e => setAddForm(p => ({...p, bio: e.target.value}))}
              placeholder="Brief professional bio..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f4b80] resize-none" />
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            <span className="font-bold">Note:</span> The doctor will be able to log in with their email and the password above via the HMS Staff portal.
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleAddDoctor} disabled={savingAdd}
              className="flex-1 bg-[#0f4b80] text-white font-bold py-2.5 rounded-xl hover:bg-[#0d3f6e] disabled:opacity-60 transition-colors">
              {savingAdd ? 'Adding...' : 'Add Doctor'}
            </button>
            <button onClick={() => { setShowAdd(false); setAddForm(BLANK_DOCTOR) }}
              className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
