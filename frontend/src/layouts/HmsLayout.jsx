import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import BackButton from '../components/BackButton.jsx'

function SidebarContent({ nav, onClose, user, role, onLogout }) {
  const location = useLocation()
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-200 flex items-center gap-3">
        <Logo height={36} />
        <div>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-0.5">HMS {role} Panel</p>
        </div>
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
      <div className="p-4 border-t border-slate-200 space-y-1">
        <div className="px-3 py-2 bg-[#0f4b80]/5 rounded-xl mb-2">
          <p className="text-xs font-bold text-[#0f4b80]">{user?.name || role}</p>
          <p className="text-[10px] text-slate-500 uppercase">{role}</p>
        </div>
        <button onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
      </div>
    </div>
  )
}

export default function HmsLayout({ nav, role, loginPath }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const user = { name: role === 'Admin' ? 'Admin Profile' : role === 'Doctor' ? 'Dr. Deepthi K.' : 'Sarah Jenkins' }

  const handleLogout = () => {
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
          {/* Brand strip */}
          <div className="h-12 flex items-center justify-between px-4 md:px-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100">
                <span className="material-symbols-outlined text-slate-600">menu</span>
              </button>
              <Logo height={30} />
              <span className="hidden sm:inline text-xs font-bold text-slate-400 uppercase tracking-widest">HMS {role} Panel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input className="pl-9 pr-4 py-1.5 bg-slate-100 rounded-lg text-sm w-44 lg:w-56 focus:ring-2 focus:ring-[#0f4b80]/20 outline-none border-none placeholder:text-slate-400"
                  placeholder="Search..." />
              </div>
              <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <div className="w-8 h-8 rounded-full bg-[#0f4b80] flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
          {/* Breadcrumb / page title row */}
          <div className="h-10 flex items-center gap-3 px-4 md:px-8">
            <BackButton className="text-xs" />
            <span className="text-slate-300 text-sm">/</span>
            <span className="text-sm font-semibold text-slate-700">{currentPage}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
