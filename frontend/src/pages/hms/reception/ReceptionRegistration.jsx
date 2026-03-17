import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { hmsService } from '../../../services/api.js'
import { doctorService } from '../../../services/api.js'
import { DEPARTMENTS } from '../../../data/mockData.js'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  gender: z.string().min(1, 'Gender is required'),
  date_of_birth: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  blood_group: z.string().min(1, 'Blood group is required'),
  emergency_contact: z.string().min(5, 'Emergency contact is required'),
  department: z.string().min(1, 'Department is required'),
  doctor_id: z.string().min(1, 'Doctor is required'),
  reason: z.string().min(3, 'Reason is required'),
  appointment_date: z.string().min(1, 'Date is required'),
  appointment_time: z.string().min(1, 'Time is required'),
})

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export default function ReceptionRegistration() {
  const [doctors, setDoctors] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
  const selectedDept = watch('department')

  useEffect(() => {
    doctorService.getAll().then(setDoctors).catch(() => {})
  }, [])

  const filteredDoctors = selectedDept
    ? doctors.filter(d => d.department === selectedDept)
    : doctors

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      // 1. Register patient
      const patient = await hmsService.createPatient({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: `Deepthi@${Math.floor(1000 + Math.random() * 9000)}`,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        address: data.address,
        blood_group: data.blood_group,
        emergency_contact: data.emergency_contact,
      })

      // 2. Create appointment
      await hmsService.createAppointment({
        patient_id: patient.id || patient.patient_id,
        doctor_id: Number(data.doctor_id),
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        department: data.department,
        reason: data.reason,
      })

      setSuccess({ name: data.name, id: patient.id || patient.patient_id })
      reset()
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) return (
    <div className="p-4 md:p-8 max-w-lg">
      <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
        </div>
        <h2 className="text-xl font-black text-slate-900">Patient Registered</h2>
        <p className="text-slate-600">
          <span className="font-semibold">{success.name}</span> has been registered successfully.
          Patient ID: <span className="font-mono font-bold text-[#0f4b80]">#{success.id}</span>
        </p>
        <p className="text-sm text-slate-500">Appointment has been scheduled.</p>
        <button onClick={() => setSuccess(null)}
          className="w-full bg-[#0f4b80] text-white py-3 rounded-xl font-semibold hover:opacity-90">
          Register Another Patient
        </button>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">New Patient Registration</h1>
        <p className="text-slate-500 text-sm">Register a new patient and schedule their first appointment</p>
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
              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'patient@email.com' },
              { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' },
              { name: 'emergency_contact', label: 'Emergency Contact', type: 'text', placeholder: 'Name & phone number' },
              { name: 'date_of_birth', label: 'Date of Birth', type: 'date', placeholder: '' },
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
              <select {...register('blood_group')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
              </select>
              {errors.blood_group && <p className="text-red-500 text-xs">{errors.blood_group.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Address</label>
            <textarea {...register('address')} rows={2} placeholder="Full residential address"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none resize-none text-sm" />
            {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
          </div>
        </div>

        {/* Appointment Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0f4b80]">clinical_notes</span>
            Appointment Details
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
              <select {...register('doctor_id')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                <option value="">Select doctor</option>
                {filteredDoctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
              </select>
              {errors.doctor_id && <p className="text-red-500 text-xs">{errors.doctor_id.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Appointment Date</label>
              <input {...register('appointment_date')} type="date"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm" />
              {errors.appointment_date && <p className="text-red-500 text-xs">{errors.appointment_date.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Appointment Time</label>
              <input {...register('appointment_time')} type="time"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm" />
              {errors.appointment_time && <p className="text-red-500 text-xs">{errors.appointment_time.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Reason for Visit / Chief Complaint</label>
            <textarea {...register('reason')} rows={3} placeholder="Describe symptoms or reason for visit"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none resize-none text-sm" />
            {errors.reason && <p className="text-red-500 text-xs">{errors.reason.message}</p>}
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full sm:w-auto px-8 py-3 bg-[#0f4b80] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2 disabled:opacity-50">
          {submitting
            ? <span className="material-symbols-outlined animate-spin">progress_activity</span>
            : <span className="material-symbols-outlined">person_add</span>
          }
          {submitting ? 'Registering...' : 'Register Patient'}
        </button>
      </form>
    </div>
  )
}
