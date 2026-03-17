import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import BackButton from '../components/BackButton.jsx'

// ── Profile Dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ user, role, onLogout, dashboardPath }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-[#0f4b80] flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{role}</p>
        </div>
        <span className={`material-symbols-outlined text-slate-400 text-[16px] transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50" style={{ maxWidth: 'calc(100vw - 16px)' }}>
          {/* User info header */}
          <div className="px-4 py-3 bg-[#0f4b80]/5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0f4b80] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email || `${role.toLowerCase()}@deepthihospitals.com`}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <button
              onClick={() => { navigate(dashboardPath); setOpen(false) }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-400">dashboard</span>
              Dashboard
            </button>
            <button
              onClick={() => { navigate(`${dashboardPath.replace('/dashboard', '/settings')}`); setOpen(false) }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-400">manage_accounts</span>
              Profile & Settings
            </button>
          </div>

          <div className="border-t border-slate-100 py-1.5">
            <button
              onClick={() => { onLogout(); setOpen(false) }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Notification Dropdown ─────────────────────────────────────────────────────
const SAMPLE_NOTIFICATIONS = [
  { id: 1, icon: 'calendar_today', color: 'text-blue-500 bg-blue-50', title: 'New appointment booked', desc: 'Patient Ravi Kumar — Today, 10:30 AM', time: '2m ago', unread: true },
  { id: 2, icon: 'payments', color: 'text-green-500 bg-green-50', title: 'Payment received', desc: '₹4,500 from Priya Sharma — Bill #1042', time: '18m ago', unread: true },
  { id: 3, icon: 'lab_panel', color: 'text-purple-500 bg-purple-50', title: 'Lab report ready', desc: 'CBC report for Anita Rao is available', time: '1h ago', unread: true },
  { id: 4, icon: 'bed', color: 'text-amber-500 bg-amber-50', title: 'Bed status updated', desc: 'Ward B — Bed 12 marked as occupied', time: '3h ago', unread: false },
  { id: 5, icon: 'person_add', color: 'text-teal-500 bg-teal-50', title: 'New patient registered', desc: 'Suresh Babu added to the system', time: '5h ago', unread: false },
]

function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)
  const ref = useRef(null)
  const unreadCount = notifications.filter(n => n.unread).length

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, unread: false })))

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white text-[9px] font-bold px-0.5">{unreadCount}</span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50" style={{ maxWidth: 'calc(100vw - 16px)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#0f4b80] font-semibold hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${n.unread ? 'bg-blue-50/30' : ''}`}
                onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${n.color}`}>
                  <span className="material-symbols-outlined text-[16px]">{n.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-tight ${n.unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{n.desc}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                  {n.unread && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2.5 text-center">
            <button className="text-xs text-[#0f4b80] font-semibold hover:underline">View all notifications</button>
          </div>
        </div>
      )}
    </div>
  )
}


function SearchBar({ nav }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const results = query.trim().length > 0
    ? nav.filter(n => n.label.toLowerCase().includes(query.toLowerCase()))
    : []

  const handleSelect = (to) => {
    navigate(to)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative hidden md:block" ref={ref}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">search</span>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className="pl-9 pr-4 py-1.5 bg-slate-100 rounded-xl text-sm w-48 lg:w-64 focus:ring-2 focus:ring-[#0f4b80]/20 focus:bg-white outline-none border border-transparent focus:border-slate-200 placeholder:text-slate-400 transition-all"
        placeholder="Search pages..."
      />
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
          {results.map(r => (
            <button
              key={r.to}
              onClick={() => handleSelect(r.to)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-[#0f4b80]/5 hover:text-[#0f4b80] transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-400">{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>
      )}
      {open && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-3 z-50">
          <p className="text-sm text-slate-400">No results for "<span className="text-slate-600">{query}</span>"</p>
        </div>
      )}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function SidebarContent({ nav, onClose, user, role, onLogout }) {
  const location = useLocation()
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-200 flex items-center gap-3">
        <Logo height={36} />
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-0.5">HMS {role} Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const active = location.pathname === item.to
          return (
            <Link key={item.to} to={item.to} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-[#0f4b80] text-white shadow-sm' : 'text-slate-600 hover:bg-[#0f4b80]/5 hover:text-[#0f4b80]'
              }`}>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <button onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
      </div>
    </div>
  )
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function HmsLayout({ nav, role, loginPath }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const storedUser = (() => { try { return JSON.parse(localStorage.getItem('hms-user') || '{}') } catch { return {} } })()
  const user = {
    name: storedUser.name || (role === 'Admin' ? 'Administrator' : role === 'Doctor' ? 'Dr. Deepthi K.' : 'Sarah Jenkins'),
    email: storedUser.email || `${role.toLowerCase()}@deepthihospitals.com`,
  }

  const dashboardPath = nav[0]?.to || '/hms/admin/dashboard'

  const handleLogout = () => {
    localStorage.removeItem('hms-token')
    localStorage.removeItem('hms-refresh-token')
    localStorage.removeItem('hms-user')
    navigate(loginPath || '/hms/admin/login')
  }

  const currentPage = nav.find(n => n.to === location.pathname)?.label || 'Dashboard'

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col fixed h-full z-30">
        <SidebarContent nav={nav} user={user} role={role} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col h-full shadow-xl">
            <SidebarContent nav={nav} user={user} role={role} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="h-14 flex items-center justify-between px-4 md:px-6 gap-4">
            {/* Left */}
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined text-slate-600">menu</span>
              </button>
              <div className="hidden lg:flex items-center gap-2">
                <BackButton className="text-xs" />
                <span className="text-slate-300">/</span>
                <span className="text-sm font-semibold text-slate-700">{currentPage}</span>
              </div>
              <span className="lg:hidden text-sm font-semibold text-slate-700">{currentPage}</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <SearchBar nav={nav} />
              <NotificationDropdown />
              <ProfileDropdown user={user} role={role} onLogout={handleLogout} dashboardPath={dashboardPath} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
