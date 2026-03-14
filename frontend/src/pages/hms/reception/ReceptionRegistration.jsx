import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { DEPARTMENTS, DOCTORS } from '../../../data/mockData.js'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  age: z.string().min(1, 'Age is required'),
  gender: z.string().min(1, 'Gender is required'),
  phone: z.string().min(10, 'Valid phone required'),
  address: z.string().min(5, 'Address is required'),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  department: z.string().min(1, 'Department is required'),
  doctor: z.string().min(1, 'Doctor is required'),
  reason: z.string().min(3, 'Reason is required'),
  emergencyContact: z.string().min(5, 'Emergency contact is required'),
})

export default function ReceptionRegistration() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    await new Promise(r => setTimeout(r, 600))
    const id = `HMS-${Math.floor(9000 + Math.random() * 1000)}`
    toast.success(`Patient registered! ID: ${id}`)
    reset()
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">New Patient Registration</h1>
        <p className="text-slate-500 text-sm">Register a new patient into the HMS system</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0f4b80]">person</span>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Patient full name' },
              { name: 'age', label: 'Age', type: 'number', placeholder: 'Age in years' },
              { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' },
              { name: 'emergencyContact', label: 'Emergency Contact', type: 'text', placeholder: 'Name & phone' },
            ].map(f => (
              <div key={f.name} className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                <input {...register(f.name)} type={f.type} placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none text-sm" />
                {errors[f.name] && <p className="text-red-500 text-xs">{errors[f.name].message}</p>}
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Gender</label>
              <select {...register('gender')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                <option value="">Select gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs">{errors.gender.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Blood Group</label>
              <select {...register('bloodGroup')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                <option value="">Select blood group</option>
                {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
              </select>
              {errors.bloodGroup && <p className="text-red-500 text-xs">{errors.bloodGroup.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Address</label>
            <textarea {...register('address')} rows={2} placeholder="Full residential address"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none resize-none text-sm" />
            {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
          </div>
        </div>

        {/* Medical Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0f4b80]">clinical_notes</span>
            Medical Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Department</label>
              <select {...register('department')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d.id}>{d.name}</option>)}
              </select>
              {errors.department && <p className="text-red-500 text-xs">{errors.department.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Assigned Doctor</label>
              <select {...register('doctor')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                <option value="">Select doctor</option>
                {DOCTORS.map(d => <option key={d.id}>{d.name}</option>)}
              </select>
              {errors.doctor && <p className="text-red-500 text-xs">{errors.doctor.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Reason for Visit / Chief Complaint</label>
            <textarea {...register('reason')} rows={3} placeholder="Describe symptoms or reason for visit"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none resize-none text-sm" />
            {errors.reason && <p className="text-red-500 text-xs">{errors.reason.message}</p>}
          </div>
        </div>

        <button type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-[#0f4b80] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined">person_add</span>
          Register Patient
        </button>
      </form>
    </div>
  )
}
