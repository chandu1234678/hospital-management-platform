import { useState } from 'react'
import toast from 'react-hot-toast'
import { HMS_APPOINTMENTS, HMS_DOCTOR_PATIENTS } from '../../../data/hmsData.js'

export default function DoctorDashboard() {
  const [activePatient] = useState(HMS_DOCTOR_PATIENTS[0])
  const todayAppts = HMS_APPOINTMENTS.slice(0, 5)

  const stats = [
    { label: "Today's Appointments", value: 12, icon: 'calendar_today', color: 'bg-[#0f4b80]/10 text-[#0f4b80]' },
    { label: 'Patients Seen', value: 4, icon: 'check_circle', color: 'bg-green-100 text-green-600' },
    { label: 'Pending Reports', value: 3, icon: 'lab_profile', color: 'bg-amber-100 text-amber-600' },
    { label: 'Prescriptions', value: 8, icon: 'history_edu', color: 'bg-purple-100 text-purple-600' },
  ]

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Clinical Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back, Dr. Deepthi. You have 12 appointments today.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">On-Duty</span>
          <span className="text-sm text-slate-500">Shift ends in 4h 20m</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Consultation */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-[#0f4b80]/5 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0f4b80]">play_circle</span>
                <span className="font-bold text-[#0f4b80] uppercase text-xs tracking-widest">Active Consultation</span>
              </div>
              <span className="text-slate-500 text-sm">Appt Time: 10:30 AM (In 5 mins)</span>
            </div>
            <div className="p-6 flex flex-col md:flex-row gap-6">
              <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                <span className="material-symbols-outlined text-slate-400 text-4xl">person</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{activePatient.name}</h3>
                    <p className="text-slate-500 text-sm">{activePatient.gender === 'F' ? 'Female' : 'Male'}, {activePatient.age} yrs | ID: #{activePatient.id}</p>
                  </div>
                  {activePatient.allergy !== 'None' && (
                    <div className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold border border-red-100">
                      Allergy: {activePatient.allergy}
                    </div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Reason for Visit</p>
                    <p className="text-sm text-slate-700 mt-1">{activePatient.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                    <p className="text-sm text-slate-700 mt-1">{activePatient.status}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button onClick={() => toast.success('Opening prescription pad')}
                    className="flex items-center gap-1 px-4 py-2 bg-[#0f4b80] text-white text-sm font-bold rounded-lg hover:opacity-90">
                    <span className="material-symbols-outlined text-sm">history_edu</span>
                    Write Prescription
                  </button>
                  <button onClick={() => toast.success('Opening lab order form')}
                    className="flex items-center gap-1 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50">
                    <span className="material-symbols-outlined text-sm">lab_profile</span>
                    Order Lab Test
                  </button>
                  <button onClick={() => toast.success('Consultation completed')}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:opacity-90">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Complete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Queue */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-800">Today's Queue</h4>
              <span className="text-xs text-slate-500">{todayAppts.length} patients</span>
            </div>
            <div className="divide-y divide-slate-100">
              {todayAppts.map((a, i) => (
                <div key={a.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#0f4b80]/10 text-[#0f4b80] flex items-center justify-center text-xs font-black shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{a.patient}</p>
                    <p className="text-xs text-slate-500">{a.dept} · {a.time}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    a.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    a.status === 'Waiting' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h4 className="font-bold text-slate-800 mb-4">Quick Actions</h4>
            <div className="space-y-2">
              {[
                { icon: 'history_edu', label: 'New Prescription', color: 'text-[#0f4b80]' },
                { icon: 'lab_profile', label: 'Order Lab Test', color: 'text-blue-600' },
                { icon: 'exit_to_app', label: 'Discharge Patient', color: 'text-green-600' },
                { icon: 'clinical_notes', label: 'Add Clinical Notes', color: 'text-purple-600' },
              ].map(action => (
                <button key={action.label} onClick={() => toast.success(`${action.label} opened`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left">
                  <span className={`material-symbols-outlined ${action.color}`}>{action.icon}</span>
                  <span className="text-sm font-medium text-slate-700">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0f4b80] rounded-xl p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Emergency</p>
            <p className="text-2xl font-black">1066</p>
            <p className="text-white/70 text-xs mt-1">Internal emergency line</p>
          </div>
        </div>
      </div>
    </div>
  )
}
