import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    hospitalName: 'Deepthi Hospitals',
    email: 'admin@deepthihospitals.com',
    phone: '+91 80 4567 8900',
    address: '123 Health Ave, Medical District, City Name, State 560001',
    emergencyLine: '1066',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    notifications: true,
    maintenanceMode: localStorage.getItem('deepthi-maintenance') === '1',
  })

  const handleSave = () => toast.success('Settings saved successfully!')

  const handleToggle = (key) => {
    if (key === 'maintenanceMode') {
      const next = !settings.maintenanceMode
      setSettings(s => ({ ...s, maintenanceMode: next }))
      localStorage.setItem('deepthi-maintenance', next ? '1' : '0')
      toast.success(next ? 'Maintenance mode enabled — public site is now blocked' : 'Maintenance mode disabled — public site is live')
    } else {
      setSettings(s => ({ ...s, [key]: !s[key] }))
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">System Settings</h1>
        <p className="text-slate-500 text-sm">Configure hospital management system settings</p>
      </div>

      {[
        {
          title: 'Hospital Information',
          icon: 'local_hospital',
          fields: [
            { key: 'hospitalName', label: 'Hospital Name', type: 'text' },
            { key: 'email', label: 'Admin Email', type: 'email' },
            { key: 'phone', label: 'Phone Number', type: 'tel' },
            { key: 'address', label: 'Address', type: 'textarea' },
            { key: 'emergencyLine', label: 'Emergency Helpline', type: 'text' },
          ]
        },
        {
          title: 'System Configuration',
          icon: 'settings',
          fields: [
            { key: 'timezone', label: 'Timezone', type: 'select', options: ['Asia/Kolkata', 'UTC', 'America/New_York'] },
            { key: 'currency', label: 'Currency', type: 'select', options: ['INR', 'USD', 'EUR'] },
          ]
        }
      ].map(section => (
        <div key={section.title} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0f4b80]">{section.icon}</span>
            {section.title}
          </h3>
          {section.fields.map(f => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea value={settings[f.key]} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  rows={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none resize-none text-sm" />
              ) : f.type === 'select' ? (
                <select value={settings[f.key]} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] outline-none text-sm">
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} value={settings[f.key]} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-[#0f4b80] focus:ring-2 focus:ring-[#0f4b80]/20 outline-none text-sm" />
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Toggles */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0f4b80]">toggle_on</span>
          System Toggles
        </h3>
        {[
          { key: 'notifications', label: 'Email Notifications', desc: 'Send email alerts for critical events' },
          { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily disable public access' },
        ].map(t => (
          <div key={t.key} className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold text-sm text-slate-900">{t.label}</p>
              <p className="text-xs text-slate-500">{t.desc}</p>
            </div>
            <button
              onClick={() => handleToggle(t.key)}
              className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${settings[t.key] ? 'bg-[#0f4b80]' : 'bg-slate-300'}`}
            >
              <span className={`inline-block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${settings[t.key] ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={handleSave}
        className="px-8 py-3 bg-[#0f4b80] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg">
        Save Settings
      </button>
    </div>
  )
}
