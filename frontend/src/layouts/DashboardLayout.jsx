import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import Logo from '../components/Logo.jsx'
import BackButton from '../components/BackButton.jsx'

const NAV = [
  { to: '/dashboard', icon: 'grid_view', label: 'Dashboard' },
  { to: '/dashboard/appointments', icon: 'calendar_today', label: 'Appointments' },
  { to: '/dashboard/prescriptions', icon: 'medication', label: 'Prescriptions' },
  { to: '/dashboard/lab-reports', icon: 'lab_research', label: 'Lab Reports' },
  { to: '/dashboard/billing', icon: 'payments', label: 'Billing' },
  { to: '/dashboard/notifications', icon: 'notifications', label: 'Notifications' },
  { to: '/dashboard/profile', icon: 'person', label: 'Health Profile' },
]

function Sidebar({ onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 flex items-center gap-2 border-b border-slate-100">
        <Link to="/" onClick={onClose}><Logo height={34} /></Link>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex-1">My Health</p>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0f4b80] flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">{user?.name || 'Patient'}</p>
            <p className="text-xs text-slate-500">ID: #{user?.id || 'DP-0000'}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => {
          const active = location.pathname === item.to
          return (
            <Link key={item.to} to={item.to} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-[#0f4b80]/10 text-[#0f4b80] font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}>
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-slate-100 space-y-1">
        <Link to="/" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined text-xl">home</span>
          Back to Home
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
          <span className="material-symbols-outlined text-xl">logout</span>
          Logout
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const location = useLocation()

  const openDrawer = () => { setMobileOpen(true); requestAnimationFrame(() => setDrawerVisible(true)) }
  const closeDrawer = () => { setDrawerVisible(false); setTimeout(() => setMobileOpen(false), 300) }

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col fixed h-full z-30">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/"><Logo height={30} /></Link>
        </div>
        <button onClick={openDrawer} className="p-2 rounded-lg hover:bg-slate-100">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${drawerVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeDrawer}
          />
          <aside className={`relative w-64 bg-white flex flex-col h-full shadow-xl transition-transform duration-300 ${drawerVisible ? 'translate-x-0' : 'translate-x-full'}`}>
            <Sidebar onClose={closeDrawer} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        {/* Desktop header bar */}
        <div className="hidden md:flex items-center gap-3 px-8 h-12 bg-white border-b border-slate-100 sticky top-0 z-10">
          <BackButton className="text-xs" />
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-600">
            {NAV.find(n => n.to === location.pathname)?.label || 'Dashboard'}
          </span>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
