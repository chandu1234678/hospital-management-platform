import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal.jsx'
import { patientService } from '../../services/api.js'
import { useAuthStore } from '../../store/authStore.js'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone required'),
  address: z.string().min(5, 'Address is required'),
  emergencyContact: z.string().min(5, 'Emergency contact is required'),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  allergies: z.string(),
  medications: z.string(),
})

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formData, setFormData] = useState(null)
  const savedProfile = useRef(user)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: user || {},
  })

  useEffect(() => {
    patientService.getProfile().then(profile => {
      savedProfile.current = profile
      reset(profile)
    })
  }, [])

  const onSubmit = (data) => {
    setFormData(data)
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const updated = await patientService.updateProfile(formData)
      updateUser(updated)
      reset(updated)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  const fields = [
    { section: 'Personal Information', icon: 'person', items: [
      { name: 'name', label: 'Full Name', type: 'text' },
      { name: 'phone', label: 'Phone Number', type: 'tel' },
      { name: 'address', label: 'Home Address', type: 'textarea' },
    ]},
    { section: 'Medical Information', icon: 'clinical_notes', items: [
      { name: 'emergencyContact', label: 'Emergency Contact', type: 'text' },
      { name: 'bloodGroup', label: 'Blood Group', type: 'select', options: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
      { name: 'allergies', label: 'Allergies', type: 'text' },
      { name: 'medications', label: 'Ongoing Medications', type: 'text' },
    ]},
  ]

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Health Profile</h2>
          <p className="text-slate-500">Manage your personal and medical information</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => reset(savedProfile.current)} disabled={!isDirty}
            className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 disabled:opacity-40">
            Cancel
          </button>
          <button onClick={handleSubmit(onSubmit)} disabled={!isDirty || loading}
            className="px-6 py-2 bg-[#0f4b80] text-white text-sm font-bold rounded-lg hover:opacity-90 shadow-lg disabled:opacity-40">
            Save Changes
          </button>
        </div>
      </div>

      {/* Profile header */}
      <div className="flex items-center gap-6 bg-white p-6 rounded-xl shadow-sm border border-[#0f4b80]/5 mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[#0f4b80] flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-md">
            {user?.name?.charAt(0)}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-slate-500 font-medium">Patient ID: #{user?.id}</p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold uppercase">Active</span>
            <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold uppercase">Patient</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {fields.map(section => (
            <section key={section.section} className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0f4b80]">{section.icon}</span>
                {section.section}
              </h3>
              <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-[#0f4b80]/5">
                {section.items.map(f => (
                  <div key={f.name} className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea {...register(f.name)} rows={3}
                        className="w-full rounded-lg border border-slate-200 bg-[#f6f7f8] focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] px-4 py-2.5 outline-none resize-none" />
                    ) : f.type === 'select' ? (
                      <select {...register(f.name)}
                        className="w-full rounded-lg border border-slate-200 bg-[#f6f7f8] focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] px-4 py-2.5 outline-none">
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input {...register(f.name)} type={f.type}
                        className="w-full rounded-lg border border-slate-200 bg-[#f6f7f8] focus:ring-2 focus:ring-[#0f4b80]/20 focus:border-[#0f4b80] px-4 py-2.5 outline-none" />
                    )}
                    {errors[f.name] && <p className="text-red-500 text-xs">{errors[f.name].message}</p>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </form>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Profile Update">
        <p className="text-slate-600 mb-6">Are you sure you want to save these changes to your profile?</p>
        <div className="flex gap-3">
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 bg-[#0f4b80] text-white font-bold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60">
            {loading ? 'Saving...' : 'Yes, Save Changes'}
          </button>
          <button onClick={() => setConfirmOpen(false)}
            className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}
