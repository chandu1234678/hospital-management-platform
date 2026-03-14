import { useState } from 'react'
import toast from 'react-hot-toast'

const NOTIFICATIONS = [
  { id: 1, group: 'Today', icon: 'calendar_today', color: 'bg-[#0F4C81]/10 text-[#0F4C81]', title: 'Appointment Reminder', desc: 'Your appointment with Dr. Deepthi K. is tomorrow at 10:30 AM.', time: '2 hours ago', read: false },
  { id: 2, group: 'Today', icon: 'lab_profile', color: 'bg-green-100 text-green-600', title: 'Lab Report Ready', desc: 'Your CBC + Lipid Profile report is now available for download.', time: '5 hours ago', read: false },
  { id: 3, group: 'This Week', icon: 'medication', color: 'bg-violet-100 text-violet-600', title: 'Prescription Renewed', desc: 'Dr. Deepthi K. has renewed your Sumatriptan prescription.', time: '2 days ago', read: true },
  { id: 4, group: 'This Week', icon: 'payments', color: 'bg-orange-100 text-orange-600', title: 'Invoice Due', desc: 'Invoice INV-8819 for ₹4,500 is due. Please clear the payment.', time: '3 days ago', read: true },
  { id: 5, group: 'This Week', icon: 'check_circle', color: 'bg-green-100 text-green-600', title: 'Appointment Confirmed', desc: 'Your appointment on 18 Mar 2026 has been confirmed.', time: '4 days ago', read: true },
  { id: 6, group: 'Earlier', icon: 'emergency', color: 'bg-red-100 text-red-600', title: 'Emergency Contact Updated', desc: 'Your emergency contact information was updated successfully.', time: '2 weeks ago', read: true },
  { id: 7, group: 'Earlier', icon: 'person', color: 'bg-slate-100 text-slate-600', title: 'Profile Updated', desc: 'Your health profile was updated. If this wasn\'t you, contact support.', time: '3 weeks ago', read: true },
]

const GROUPS = ['Today', 'This Week', 'Earlier']

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="text-sm font-semibold text-[#0F4C81] hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">done_all</span>
            Mark all read
          </button>
        )}
      </div>

      {GROUPS.map(group => {
        const items = notifications.filter(n => n.group === group)
        if (!items.length) return null
        return (
          <div key={group}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{group}</p>
            <div className="space-y-2">
              {items.map(n => (
                <div key={n.id}
                  className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-colors ${n.read ? 'border-slate-200' : 'border-[#0F4C81]/20 bg-[#0F4C81]/5'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                    <span className="material-symbols-outlined text-[20px]">{n.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#0F4C81] shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-slate-500 text-sm mt-0.5">{n.desc}</p>
                    <p className="text-slate-400 text-xs mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
