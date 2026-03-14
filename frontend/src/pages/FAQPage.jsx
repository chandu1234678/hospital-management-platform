import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import BackButton from '../components/BackButton.jsx'
import { FAQS } from '../data/mockData.js'

export default function FAQPage() {
  const [open, setOpen] = useState(null)
  const [category, setCategory] = useState('All')
  const categories = ['All', ...new Set(FAQS.map(f => f.category))]
  const filtered = category === 'All' ? FAQS : FAQS.filter(f => f.category === category)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-12 py-16">
        <BackButton className="mb-6" />
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-3">Frequently Asked Questions</h1>
          <p className="text-slate-500 text-lg">Find answers to common questions about our services</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                category === c ? 'bg-[#0f4b80] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0f4b80]'
              }`}>{c}</button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors">
                <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                <span className={`material-symbols-outlined text-[#0f4b80] shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5 border-t border-slate-100">
                  <p className="text-slate-600 leading-relaxed pt-4">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
