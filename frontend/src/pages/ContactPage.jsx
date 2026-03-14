import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import BackButton from '../components/BackButton.jsx'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    await new Promise(r => setTimeout(r, 800))
    toast.success('Message sent! We\'ll get back to you within 24 hours.')
    reset()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-16">
        <BackButton className="mb-6" />
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-4">Get in Touch</h1>
            <p className="text-slate-500 text-lg mb-10">Have a question or need assistance? We're here to help 24/7.</p>
            <div className="space-y-6">
              {[
                { icon: 'location_on', title: 'Address', value: '123 Health Ave, Medical District, City Name, State 560001' },
                { icon: 'phone', title: 'Phone', value: '+91 80 4567 8900' },
                { icon: 'mail', title: 'Email', value: 'info@deepthihospitals.com' },
                { icon: 'schedule', title: 'Working Hours', value: 'Mon–Sat: 8:00 AM – 8:00 PM\nEmergency: 24/7' },
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-[#0f4b80]/10 rounded-xl flex items-center justify-center text-[#0f4b80] shrink-0">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-slate-500 text-sm whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-red-50 p-5 rounded-xl border border-red-100">
              <p className="text-red-600 font-bold mb-1">Emergency (24/7)</p>
              <p className="text-red-700 text-3xl font-black">1066</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {[
                { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                { name: 'email', label: 'Email Address', type: 'email', placeholder: 'name@email.com' },
                { name: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210' },
                { name: 'subject', label: 'Subject', type: 'text', placeholder: 'How can we help?' },
              ].map(f => (
                <div key={f.name} className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                  <input {...register(f.name)} type={f.type} placeholder={f.placeholder}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none" />
                  {errors[f.name] && <p className="text-red-500 text-xs">{errors[f.name].message}</p>}
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Message</label>
                <textarea {...register('message')} rows={4} placeholder="Describe your query in detail..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none resize-none" />
                {errors.message && <p className="text-red-500 text-xs">{errors.message.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-[#0f4b80] text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
                {isSubmitting ? 'Sending...' : 'Send Message'}
                {!isSubmitting && <span className="material-symbols-outlined">send</span>}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
