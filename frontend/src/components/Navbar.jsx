import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import Logo from './Logo.jsx'

const NAV = [
  { to: '/departments', label: 'Departments' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/emergency', label: 'Emergency' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    setDropdown(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <Logo height={38} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV.map(l => (
            <Link key={l.to} to={l.to}
              className="text-sm font-medium text-slate-700 hover:text-[#0F4C81] transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link to="/book-appointment"
            className="hidden sm:flex items-center gap-1 bg-[#0F4C81] text-white text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            Book Appointment
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setDropdown(dropdown === 'user' ? false : 'user')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81] font-bold text-sm">
                  {user?.name?.charAt(0)}
                </div>
                <span className="hidden sm:block text-sm font-semibold">{user?.name?.split(' ')[0]}</span>
                <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
              </button>
              {dropdown === 'user' && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="font-bold text-slate-900 text-sm truncate">{user?.name}</p>
                    </div>
                    <div className="py-1">
                      {[
                        { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
                        { to: '/dashboard/appointments', icon: 'event_note', label: 'My Appointments' },
                        { to: '/dashboard/lab-reports', icon: 'description', label: 'Lab Reports' },
                        { to: '/dashboard/profile', icon: 'person', label: 'Health Profile' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          <span className="material-symbols-outlined text-[#0F4C81] text-xl">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="py-1 border-t border-slate-100">
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors">
                        <span className="material-symbols-outlined text-xl">logout</span>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" state={{ from: location.pathname }}
              className="flex items-center gap-1 text-sm font-bold text-[#0F4C81] px-4 py-2 rounded-lg border border-[#0F4C81]/20 hover:bg-[#0F4C81]/5 transition-colors">
              <span className="material-symbols-outlined text-base">login</span>
              Login
            </Link>
          )}

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-1">
          {NAV.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0F4C81] transition-colors">
              {l.label}
            </Link>
          ))}
          <Link to="/book-appointment" onClick={() => setOpen(false)}
            className="block mt-2 px-3 py-2 bg-[#0F4C81] text-white text-sm font-bold rounded-lg text-center">
            Book Appointment
          </Link>
          {!isAuthenticated && (
            <Link to="/login" state={{ from: location.pathname }} onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#0F4C81] border border-[#0F4C81]/20 text-center mt-1">
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
