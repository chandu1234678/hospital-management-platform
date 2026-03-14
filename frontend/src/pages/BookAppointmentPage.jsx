import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import BackButton from '../components/BackButton.jsx'
import { DEPARTMENTS, DOCTORS } from '../data/mockData.js'
import { useAppointmentStore } from '../store/appointmentStore.js'
import { appointmentService } from '../services/api.js'

const STEPS = ['Department', 'Doctor', 'Date & Time', 'Patient Details', 'Confirm']

const patientSchema = z.object({
  patientName: z.string().min(2, 'Name is required'),
  patientPhone: z.string().min(10, 'Valid phone required'),
  patientEmail: z.string().email('Valid email required'),
  reason: z.string().min(3, 'Please describe your reason for visit'),
})

function getNextDays(n = 7) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return { date: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }) }
  })
}

export default function BookAppointmentPage() {
  const [step, setStep] = useState(0)
  const [selectedDept, setSelectedDept] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addAppointment } = useAppointmentStore()
  const days = getNextDays()

  const { register, handleSubmit, formState: { errors }, trigger } = useForm({ resolver: zodResolver(patientSchema) })

  // Pre-fill from URL params
  useEffect(() => {
    const docId = searchParams.get('doctor')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    if (docId) {
      const doc = DOCTORS.find(d => d.id === Number(docId))
      if (doc) {
        setSelectedDept(doc.department)
        setSelectedDoctor(doc)
        setStep(2)
      }
    }
    if (date) setSelectedDate(date)
    if (time) setSelectedSlot(decodeURIComponent(time))
  }, [searchParams])

  const filteredDoctors = selectedDept ? DOCTORS.filter(d => d.department === selectedDept) : DOCTORS

  const onConfirm = async (data) => {
    setLoading(true)
    const appt = {
      id: `APT-${Date.now()}`,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      department: selectedDept,
      date: selectedDate,
      time: selectedSlot,
      location: selectedDoctor.location,
      fee: selectedDoctor.fee,
      status: 'upcoming',
      paymentStatus: 'unpaid',
      patientName: data.patientName,
      reason: data.reason,
    }
    openRazorpayCheckout(appt, data, null)
  }

  const openRazorpayCheckout = (appt, formData, savedOrder) => {
    if (!window.Razorpay) {
      // No Razorpay script — confirm directly (dev fallback)
      addAppointment(appt)
      setLoading(false)
      toast.success('Appointment booked!')
      navigate('/appointment-confirmation', { state: { appointment: appt, doctor: selectedDoctor } })
      return
    }
    const fee = selectedDoctor?.fee || 500
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
      amount: fee * 100,
      currency: 'INR',
      name: 'Deepthi Hospitals',
      description: `Consultation — ${selectedDoctor?.name}`,
      order_id: savedOrder?.order_id || undefined,
      handler: (response) => {
        appt.paymentStatus = 'paid'
        appt.paymentId = response.razorpay_payment_id
        addAppointment(appt)
        setLoading(false)
        toast.success('Payment successful! Appointment confirmed.')
        navigate('/appointment-confirmation', {
          state: { appointment: appt, doctor: selectedDoctor, paid: true, paymentId: response.razorpay_payment_id }
        })
      },
      prefill: { name: formData?.patientName || '', email: formData?.patientEmail || '' },
      theme: { color: '#0F4C81' },
      modal: {
        ondismiss: () => {
          setLoading(false)
          toast.error(
            <span>
              Payment cancelled.{' '}
              <button className="underline font-bold" onClick={() => { toast.dismiss(); openRazorpayCheckout(appt, formData, savedOrder) }}>
                Retry
              </button>
            </span>,
            { duration: 8000 }
          )
        }
      },
    }
    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (resp) => {
      setLoading(false)
      const reason = resp?.error?.description || 'Payment failed'
      toast.error(
        <span>
          {reason}.{' '}
          <button className="underline font-bold" onClick={() => { toast.dismiss(); openRazorpayCheckout(appt, formData, savedOrder) }}>
            Retry
          </button>
        </span>,
        { duration: 8000 }
      )
    })
    rzp.open()
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f7f8]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-xl p-4 border border-slate-200 sticky top-24">
              <div className="flex items-center gap-3 mb-6 p-2">
                <div className="bg-[#0f4b80]/10 text-[#0f4b80] p-2 rounded-lg">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking Status</p>
                  <p className="text-sm font-medium">In Progress</p>
                </div>
              </div>
              <nav className="space-y-1">
                {STEPS.map((s, i) => (
                  <div key={s} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${i === step ? 'bg-[#0f4b80]/5 text-[#0f4b80]' : i < step ? 'text-green-600' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-xl">
                      {i < step ? 'check_circle' : ['category', 'person', 'event_available', 'contact_page', 'check_circle'][i]}
                    </span>
                    <span className={`text-sm ${i === step ? 'font-semibold' : 'font-medium'}`}>{i + 1}. {s}</span>
                  </div>
                ))}
              </nav>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-slate-500 mb-1">Need help?</p>
                  <p className="text-sm font-semibold">Call 1-800-DEEPTHI</p>
                  <p className="text-xs text-slate-400 mt-1">Available 24/7</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="lg:col-span-9 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <BackButton />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Book an Appointment</h2>
              <p className="text-slate-500 mt-1">{['Select the medical department', 'Choose your doctor', 'Pick a date and time', 'Enter your details', 'Review and confirm'][step]}</p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-4">
                <div className="bg-[#0f4b80] h-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Step 0: Department */}
            {step === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {DEPARTMENTS.map(d => (
                  <button key={d.id} onClick={() => setSelectedDept(d.name)}
                    className={`group p-6 bg-white border-2 rounded-xl text-left transition-all hover:shadow-md ${
                      selectedDept === d.name ? 'border-[#0f4b80]' : 'border-transparent hover:border-slate-200'
                    }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl transition-colors ${selectedDept === d.name ? 'bg-[#0f4b80] text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-[#0f4b80]/10 group-hover:text-[#0f4b80]'}`}>
                        <span className="material-symbols-outlined text-3xl">{d.icon}</span>
                      </div>
                      {selectedDept === d.name && <span className="material-symbols-outlined text-[#0f4b80]">check_circle</span>}
                    </div>
                    <h3 className="text-lg font-bold mb-1">{d.name}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{d.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Doctor */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.length === 0 ? (
                  <p className="text-slate-500 col-span-2">No doctors available for this department.</p>
                ) : filteredDoctors.map(doc => (
                  <button key={doc.id} onClick={() => setSelectedDoctor(doc)}
                    className={`p-4 bg-white rounded-xl border-2 flex gap-4 text-left transition-all hover:shadow-md ${
                      selectedDoctor?.id === doc.id ? 'border-[#0f4b80]' : 'border-transparent hover:border-slate-200'
                    }`}>
                    <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                      <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-bold">{doc.name}</h4>
                        {selectedDoctor?.id === doc.id && <span className="material-symbols-outlined text-[#0f4b80]">check_circle</span>}
                      </div>
                      <p className="text-xs text-slate-500 uppercase font-medium">{doc.specialty} • {doc.experience}</p>
                      <div className="flex items-center gap-1 mt-1 text-amber-500">
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="text-xs font-bold text-slate-700">{doc.rating} ({doc.reviews} reviews)</span>
                      </div>
                      <p className="text-sm font-semibold text-[#0f4b80] mt-1">₹{doc.fee} consultation</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h3 className="font-bold mb-4">Select Date</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                    {days.map(d => (
                      <button key={d.date} onClick={() => setSelectedDate(d.date)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          selectedDate === d.date ? 'bg-[#0f4b80] text-white' : 'border border-slate-200 hover:border-[#0f4b80] hover:bg-[#0f4b80]/5'
                        }`}>
                        <p className="text-xs font-bold">{d.label.split(', ')[0]}</p>
                        <p className="text-lg font-black leading-tight">{d.label.split(', ')[1]?.split(' ')[0]}</p>
                        <p className="text-xs">{d.label.split(', ')[1]?.split(' ')[1]}</p>
                      </button>
                    ))}
                  </div>
                </div>
                {selectedDate && selectedDoctor && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold mb-4">Select Time Slot</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedDoctor.slots.map(slot => (
                        <button key={slot} onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                            selectedSlot === slot ? 'bg-[#0f4b80]/20 text-[#0f4b80] border-[#0f4b80]' : 'border-slate-200 hover:border-[#0f4b80]'
                          }`}>{slot}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Patient Details */}
            {step === 3 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
                <h3 className="font-bold text-lg">Patient Information</h3>
                {[
                  { name: 'patientName', label: 'Full Name', type: 'text', placeholder: 'Enter patient full name' },
                  { name: 'patientPhone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' },
                  { name: 'patientEmail', label: 'Email Address', type: 'email', placeholder: 'name@email.com' },
                ].map(f => (
                  <div key={f.name} className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                    <input {...register(f.name)} type={f.type} placeholder={f.placeholder}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none" />
                    {errors[f.name] && <p className="text-red-500 text-xs">{errors[f.name].message}</p>}
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Reason for Visit</label>
                  <textarea {...register('reason')} rows={3} placeholder="Briefly describe your symptoms or reason for visit"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none resize-none" />
                  {errors.reason && <p className="text-red-500 text-xs">{errors.reason.message}</p>}
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-lg">Confirm Your Appointment</h3>
                <div className="bg-[#0f4b80]/5 rounded-xl p-5 space-y-3">
                  {[
                    { icon: 'local_hospital', label: 'Department', value: selectedDept },
                    { icon: 'person', label: 'Doctor', value: selectedDoctor?.name },
                    { icon: 'calendar_today', label: 'Date', value: selectedDate },
                    { icon: 'schedule', label: 'Time', value: selectedSlot },
                    { icon: 'location_on', label: 'Location', value: selectedDoctor?.location },
                    { icon: 'payments', label: 'Fee', value: `₹${selectedDoctor?.fee}` },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#0f4b80]">{item.icon}</span>
                      <span className="text-slate-500 text-sm w-24">{item.label}</span>
                      <span className="font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                className="flex items-center gap-2 text-slate-500 font-semibold px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30">
                <span className="material-symbols-outlined">arrow_back</span> Back
              </button>

              {step < 4 ? (
                <button
                  onClick={async () => {
                    if (step === 0 && !selectedDept) return toast.error('Please select a department')
                    if (step === 1 && !selectedDoctor) return toast.error('Please select a doctor')
                    if (step === 2 && (!selectedDate || !selectedSlot)) return toast.error('Please select date and time')
                    if (step === 3) {
                      const valid = await trigger(['patientName', 'patientPhone', 'patientEmail', 'reason'])
                      if (!valid) return
                    }
                    setStep(s => s + 1)
                  }}
                  className="flex items-center gap-2 bg-[#0f4b80] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:opacity-90 transition-all">
                  Next: {STEPS[step + 1]}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button onClick={handleSubmit(onConfirm)} disabled={loading}
                  className="flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-60">
                  {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">payment</span>}
                  {loading ? 'Processing...' : `Pay ₹${selectedDoctor?.fee} & Confirm`}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
